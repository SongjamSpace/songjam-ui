import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

export type Listener = {
  userId: string;
  displayName: string;
  twitterScreenName: string;
  avatarUrl: string;
  isVerified: boolean;
  spaceTitles: string[];
  spaceIds: string[];
  spaceTopics: string[];
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  biography: string;
  location: string;
  joined: Date;
  isPrivate: boolean;
  isBlueVerified: boolean;
  pinnedTweetIds: string[];
  website: string;
  banner: string;
  likesCount: number;
  isProfileFetched: boolean;
  canDm: boolean;
  randomSeed: number;
  exposureCount: number;
  lastSharedMs: number;
  userByProjectId: string[];
};
