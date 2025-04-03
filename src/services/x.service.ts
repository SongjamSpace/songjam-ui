import axios from 'axios';
import { Tweet } from '../types/twitter.types';
import { TwitterUser } from './db/spaces.service';

const PROXY_URL = 'http://localhost:3001/api';

export interface XUserProfile {
  avatar: string;
  banner: string;
  biography: string;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  mediaCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  likesCount: number;
  listedCount: number;
  location: string;
  name: string;
  pinnedTweetIds: string[];
  tweetsCount: number;
  url: string;
  userId: string;
  username: string;
  isBlueVerified: boolean;
  canDm: boolean;
  joined: string;

  // Add this field
  profile_image_url: string;
}

export interface XTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

// Cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number;

  constructor(ttlHours: number) {
    this.ttl = ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.ttl) {
      // Keep stale data but mark it as needing refresh
      return entry.data;
    }

    return entry.data;
  }

  set(key: string, data: T) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > this.ttl;
  }
}

// Initialize caches with appropriate TTLs based on rate limits
const userCache = new APICache<TwitterUser>(24); // 24 hours TTL for user data
const tweetsCache = new APICache<Tweet[]>(24); // 24 hours TTL for tweets

// API calls with caching
export const getUserInfo = async (
  userId: string
): Promise<TwitterUser | null> => {
  try {
    // Check cache first
    const cachedUser = userCache.get(userId);
    if (cachedUser && !userCache.isStale(userId)) {
      return cachedUser;
    }

    // Only make API call if cache is empty or stale
    if (!cachedUser || userCache.isStale(userId)) {
      const response = await fetch(
        `https://api.twitter.com/2/users/${userId}?user.fields=description,profile_image_url,public_metrics`,
        {
          headers: {
            Authorization: `Bearer ${
              import.meta.env.VITE_TWITTER_BEARER_TOKEN
            }`,
          },
        }
      );

      if (!response.ok) {
        // If API call fails but we have cached data, return that
        if (cachedUser) {
          console.warn('Failed to refresh user data, using cached data');
          return cachedUser;
        }
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      userCache.set(userId, data.data);
      return data.data;
    }

    return cachedUser;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    // Return cached data if available, even if stale
    return userCache.get(userId);
  }
};

export const getUserTweets = async (
  userId: string,
  limit: number = 5
): Promise<Tweet[]> => {
  try {
    // Check cache first
    const cachedTweets = tweetsCache.get(userId);
    if (cachedTweets && !tweetsCache.isStale(userId)) {
      return cachedTweets.slice(0, limit);
    }

    // Only make API call if cache is empty or stale
    if (!cachedTweets || tweetsCache.isStale(userId)) {
      const response = await fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?max_results=${limit}&tweet.fields=created_at,public_metrics`,
        {
          headers: {
            Authorization: `Bearer ${
              import.meta.env.VITE_TWITTER_BEARER_TOKEN
            }`,
          },
        }
      );

      if (!response.ok) {
        // If API call fails but we have cached data, return that
        if (cachedTweets) {
          console.warn('Failed to refresh tweets, using cached data');
          return cachedTweets.slice(0, limit);
        }
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      tweetsCache.set(userId, data.data);
      return data.data;
    }

    return cachedTweets.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch user tweets:', error);
    // Return cached tweets if available, even if stale
    return tweetsCache.get(userId)?.slice(0, limit) || [];
  }
};

// Rate limit tracking
interface RateLimit {
  remaining: number;
  reset: number; // timestamp
}

const rateLimits = new Map<string, RateLimit>();

export const updateRateLimit = (
  endpoint: string,
  remaining: number,
  resetTime: number
) => {
  rateLimits.set(endpoint, { remaining, reset: resetTime });
};

export const canMakeRequest = (endpoint: string): boolean => {
  const limit = rateLimits.get(endpoint);
  if (!limit) return true;

  if (Date.now() > limit.reset) {
    rateLimits.delete(endpoint);
    return true;
  }

  return limit.remaining > 0;
};

export const fetchXUserProfile = async (
  username: string
): Promise<XUserProfile | null> => {
  const res = await axios.post(
    `${import.meta.env.VITE_JAM_SERVER_URL}/get-user-profile`,
    {
      userName: username,
    }
  );
  return res.data.profile as XUserProfile;
};

export const fetchXUserTweets = async (userId: string): Promise<XTweet[]> => {
  try {
    console.log('Fetching X tweets for user:', userId);
    const response = await fetch(`${PROXY_URL}/x/user/${userId}/tweets`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch X tweets:', data);
      return [];
    }

    if (!data.data) {
      console.log('No tweets found for user:', userId);
      return [];
    }

    console.log('Successfully fetched X tweets:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error fetching X user tweets:', error);
    return [];
  }
};

export const enrichSpeakerData = async (
  speaker: TwitterUser
): Promise<
  TwitterUser & { xProfile?: XUserProfile; recentTweets?: XTweet[] }
> => {
  return speaker;
  // try {
  //   console.log('Enriching speaker data for:', speaker.twitter_screen_name);
  //   const xProfile =
  //     (await fetchXUserProfile(speaker.twitter_screen_name)) || undefined;
  //   const recentTweets = xProfile ? await fetchXUserTweets(xProfile.id) : [];

  //   return {
  //     ...speaker,
  //     xProfile,
  //     recentTweets,
  //   };
  // } catch (error) {
  //   console.error('Error enriching speaker data:', error);
  //   return speaker;
  // }
};
