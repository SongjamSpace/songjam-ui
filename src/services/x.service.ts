import { User } from './db/spaces.service';

const PROXY_URL = 'http://localhost:3001/api';

export interface XUserProfile {
  id: string;
  name: string;
  username: string;
  description: string;
  profile_image_url: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  created_at: string;
  verified: boolean;
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

export const fetchXUserProfile = async (username: string): Promise<XUserProfile | null> => {
  try {
    console.log('Fetching X profile for:', username);
    const response = await fetch(`${PROXY_URL}/x/user/${username}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch X profile:', data);
      return null;
    }

    if (!data.data) {
      console.error('No data returned from X API for user:', username);
      return null;
    }

    console.log('Successfully fetched X profile:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error fetching X user profile:', error);
    return null;
  }
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

export const enrichSpeakerData = async (speaker: User): Promise<User & { xProfile?: XUserProfile; recentTweets?: XTweet[] }> => {
  try {
    console.log('Enriching speaker data for:', speaker.twitter_screen_name);
    const xProfile = await fetchXUserProfile(speaker.twitter_screen_name) || undefined;
    const recentTweets = xProfile ? await fetchXUserTweets(xProfile.id) : [];

    return {
      ...speaker,
      xProfile,
      recentTweets,
    };
  } catch (error) {
    console.error('Error enriching speaker data:', error);
    return speaker;
  }
}; 