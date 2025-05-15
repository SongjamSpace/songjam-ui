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

export const getListenersByTopics = async (topics: string[]) => {
  const db = getFirestore();
  const q = query(
    collection(db, 'listeners'),
    where('topics', 'in', topics),
    orderBy('randomSeed', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as Listener[];
};
