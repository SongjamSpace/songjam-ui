// Nominatim API response types
export interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

// Map data structure that MapView expects
export interface MapDataPoint {
  username: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  followers: number;
  bio: string;
  verified: boolean;
  userId: string;
  avatarUrl?: string;
}

// Extended SpaceListener with geocoded coordinates
export interface GeocodedSpaceListener {
  userId: string;
  displayName: string;
  twitterScreenName: string;
  avatarUrl: string;
  isVerified: boolean;
  admin?: boolean;
  speaker?: boolean;
  listener?: boolean;
  joinedAt: number;
  leftAt: number | null;
  timeSpent?: number | null;
  timeSpentInMs?: number | null;
  isProfileFetched: boolean;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  biography: string;
  location: string;
  joined: string;
  isPrivate: boolean;
  isBlueVerified: boolean;
  pinnedTweetIds: string[];
  website: string;
  canDm: boolean;
  banner: string;
  likesCount: number;
  // Geocoded coordinates
  coordinates?: [number, number] | null; // [longitude, latitude]
  geocodingStatus: 'pending' | 'success' | 'failed';
  country?: string;
}
