import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db, storage } from '../firebase.service';
import { getDownloadURL } from 'firebase/storage';
import { ref } from 'firebase/storage';
import axios from 'axios';

export type TwitterUser = {
  userId: string;
  displayName: string;
  twitterScreenName: string;
  avatarUrl: string;
  isVerified: boolean;
  admin?: boolean;
  speaker?: boolean;
  listener?: boolean;
};
export type SpaceListener = TwitterUser & {
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
  isVerified: boolean;
  pinnedTweetIds: string[];
  website: string;
  canDm: boolean;
  banner: string;
  likesCount: number;
};

export type Segment = {
  start: number;
  text: string;
  end: number;
  seek: number;
  no_speech_prob: number;
};
export type Space = {
  transcriptionStatus:
    | 'NOT_STARTED'
    | 'STARTED'
    | 'PROCESSING'
    | 'FAILED'
    | 'SHORT_ENDED'
    | 'ENDED';
  isLive?: boolean;
  isRecorded?: boolean;
  isScheduled?: boolean;
  spaceId: string;
  userHelperMessage?: string;
  // Space details
  hlsUrl: string;
  title: string;
  state: 'Ended' | 'Running' | 'NotStarted' | 'TimedOut';
  mediaKey: string;
  createdAt: number;
  startedAt: number;
  endedAt: number;
  contentType: string;
  isSpaceAvailableForReplay: boolean;
  isSpaceAvailableForClipping: boolean;
  totalReplayWatched: number;
  totalLiveListeners: number;
  tweetId: string | any;
  admins: TwitterUser[];
  speakers: TwitterUser[];
  isLiveListenersSyncing?: boolean;
  liveListenersCount?: number;
  topics?: string[];

  docCreatedAt?: number;
  transcriptionProgress?: TranscriptionProgress;
  scheduledStart?: number;
  hasCampaign?: boolean;
  projectIds?: string[];
  createdProjectId?: string;
  // Broadcast specific fields
  isBroadcast?: boolean;
  viewCountGraph?: number[];
  broadcastInfo: {
    twitterUsername: string;
    viewCountGraph: number[];
  };
  coinAnalysis?: {
    breakdown: { sang: number; songjam: number };
    noOfMentions: number;
    speakerMentions: {
      count: number;
      name: string;
      userId: string;
      username: string;
    }[];
  };
};

export type SpaceDoc = Space & {
  id: string;
};

export enum TranscriptionProgress {
  NOT_STARTED = 0,
  DOWNLOADING_AUDIO = 1,
  TRANSCRIBING_STARTED = 2,
  TRANSCRIBING = 3,
  SUMMARIZING = 4,
  AI_SUMMARY = 5,
  ENDED = 6,
}

const SPACE_COLLECTION = 'spaces';
const SUMMARY_SUBCOLLECTION = 'summaries';
const SEGMENTS_SUBCOLLECTION = 'segments';
const TWITTER_THREADS_SUBCOLLECTION = 'twitter_threads';
const LISTENER_LOGS_SUBCOLLECTION = 'listenerLogs';
const CAMPAIGNS_SUBCOLLECTION = 'campaigns';

// Modify getSpace to handle null case properly
export const getSpace = async (
  spaceId: string,
  onUpdate?: (space: Space) => void
): Promise<Space | null> => {
  const docRef = doc(db, 'spaces', spaceId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const space = docSnap.data() as Space;
    if (onUpdate) {
      onSnapshot(docRef, (doc) => {
        onUpdate(doc.data() as Space);
      });
    }
    return space;
  }
  return null;
};

export const subscribeToSpace = (
  spaceId: string,
  onUpdate: (space: Space) => void
) => {
  const docRef = doc(db, 'spaces', spaceId);
  return onSnapshot(docRef, (doc) => {
    onUpdate(doc.data() as Space);
  });
};

export const getSummary = async (spaceId: string) => {
  const docRef = doc(
    db,
    SPACE_COLLECTION,
    spaceId,
    SUMMARY_SUBCOLLECTION,
    'final_summary'
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export const getDetailedSummary = async (spaceId: string) => {
  const docRef = doc(
    db,
    SPACE_COLLECTION,
    spaceId,
    SUMMARY_SUBCOLLECTION,
    'meta'
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.first_level_summaries;
};

export const getFirstLevelSummaries = async (spaceId: string) => {
  const docRef = doc(
    db,
    SPACE_COLLECTION,
    spaceId,
    SUMMARY_SUBCOLLECTION,
    'meta'
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.first_level_summaries;
};

export const getFullTranscription = async (spaceId: string) => {
  const docRef = doc(
    db,
    SPACE_COLLECTION,
    spaceId,
    SUMMARY_SUBCOLLECTION,
    'full_transcript'
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.text;
};

export const getSegments = async (spaceId: string) => {
  const colRef = query(
    collection(db, SPACE_COLLECTION, spaceId, SEGMENTS_SUBCOLLECTION),
    orderBy('idx', 'asc'),
    limit(20)
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};

export const getSegmentsByStartSeconds = async (
  spaceId: string,
  startSeconds: number
) => {
  const colRef = query(
    collection(db, SPACE_COLLECTION, spaceId, SEGMENTS_SUBCOLLECTION),
    orderBy('idx', 'desc'),
    where('start', '<=', startSeconds),
    limit(1)
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};

export const getTwitterThread = async (spaceId: string) => {
  const docRef = doc(
    db,
    SPACE_COLLECTION,
    spaceId,
    TWITTER_THREADS_SUBCOLLECTION,
    'v1'
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.thread;
};

export const getSpaceAudioDownloadUrl = async (spaceId: string) => {
  const storageRef = ref(storage, `spaces/${spaceId}.mp3`);
  const url = await getDownloadURL(storageRef);
  return url;
};

export const getSpaceListeners = async (spaceId: string) => {
  const colRef = query(
    collection(db, SPACE_COLLECTION, spaceId, LISTENER_LOGS_SUBCOLLECTION),
    orderBy('joinedAt', 'asc')
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data() as SpaceListener);
};

export const getSpaceListenersForDm = async (spaceId: string) => {
  const colRef = query(
    collection(db, SPACE_COLLECTION, spaceId, LISTENER_LOGS_SUBCOLLECTION),
    where('canDm', '==', true)
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data() as SpaceListener);
};

export const getSpaces = async () => {
  const colRef = query(
    collection(db, SPACE_COLLECTION),
    orderBy('docCreatedAt', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(colRef);
  return (
    snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as SpaceDoc[]
  ).filter((space) => space.speakers.length > 0);
};

export type AudioSpace = {
  metadata: {
    title: string;
    rest_id: string;
    state: string;
    media_key: string;
    created_at: number;
    scheduled_start: number;
    started_at: number;
    ended_at: string;
    updated_at: number;
    content_type: string;
    creator_results: {
      result: any;
    };
    conversation_controls: number;
    disallow_join: boolean;
    is_employee_only: boolean;
    is_locked: boolean;
    is_muted: boolean;
    is_space_available_for_clipping: boolean;
    is_space_available_for_replay: boolean;
    narrow_cast_space_type: number;
    no_incognito: boolean;
    total_replay_watched: number;
    total_live_listeners: number;
    tweet_results: Record<string, any>;
    max_guest_sessions: number;
    max_admin_capacity: number;
  };
  participants: {
    total: number;
    admins: any[];
    speakers: any[];
    listeners: any[];
  };
};

export const getRawSpaceFromX = async (spaceId: string) => {
  const res = await axios.get(
    `${import.meta.env.VITE_JAM_SERVER_URL}/get-space/${spaceId}`
  );
  return res.data.result as AudioSpace;
};

export const getBroadcastFromX = async (broadcastId: string) => {
  const res = await axios.get(
    `${import.meta.env.VITE_JAM_SERVER_URL}/get-broadcast/${broadcastId}`
  );
  return res.data.result as Space;
};

export const spaceColRef = collection(db, SPACE_COLLECTION);

export const getSpacesByProjectId = async (
  projectId: string,
  listener?: (spaces: SpaceDoc[]) => void
) => {
  const colRef = query(
    spaceColRef,
    where('projectIds', 'array-contains', projectId)
  );
  const snapshot = await getDocs(colRef);
  if (listener) {
    onSnapshot(colRef, (snapshot) => {
      listener(
        snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as SpaceDoc[]
      );
    });
  }
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as SpaceDoc[];
};

export const getListenersAcrossSpaces = async () => {
  const colRef = query(
    collectionGroup(db, LISTENER_LOGS_SUBCOLLECTION),
    // where('twitterScreenName', '==', 'Bkess75'),
    limit(100)
  );
  const snapshot = await getDocs(colRef);
  // Unique listeners
  const listeners = snapshot.docs.map((doc) => doc.data() as SpaceListener);
  return listeners.filter(
    (listener, index, self) =>
      index === self.findIndex((t) => t.userId === listener.userId)
  );
};

export const getTestListeners = (): SpaceListener[] => {
  return [
    {
      avatarUrl:
        'https://pbs.twimg.com/profile_images/1899456885809627136/8FjDgfMT_normal.jpg',
      banner:
        'https://pbs.twimg.com/profile_banners/1517949596118487043/1742760293',
      biography:
        'Building @SongjamSpace\n\n10 Hackathon Wins @Chainlink Grand Prize & NFT @Filecoin @Polkadot X2 @MoonbeamNetwork @Coinbase @NethermindETH @0n1Force @Consensus_HK',
      canDm: true,
      displayName: 'Adam Place',
      followersCount: 362,
      followingCount: 345,
      isBlueVerified: false,
      isPrivate: false,
      isProfileFetched: true,
      isVerified: false,
      joined: '1650742491',
      joinedAt: 1746637600416,
      leftAt: 1746638510483,
      likesCount: 738,
      listener: true,
      location: 'Celestial Kingdom',
      pinnedTweetIds: [],
      timeSpentInMs: 910067,
      tweetsCount: 827,
      twitterScreenName: 'adam_songjam',
      userId: '1517949596118487043',
      website: 'https://songjam.space',
    },
    {
      avatarUrl:
        'https://pbs.twimg.com/profile_images/1617764613881499651/mVz38s8O_normal.jpg',
      displayName: 'Logesh',
      twitterScreenName: 'logeshr24',
      isVerified: false,
      joinedAt: 1743700715382,
      leftAt: 1743700745254,
      listener: true,
      timeSpentInMs: 29872,
      userId: '1MWKwnWexprQb',
      banner: '',
      biography: 'Building @SongjamSpace http://devpost.com/logesh665',
      canDm: true,
      followersCount: 100,
      followingCount: 100,
      tweetsCount: 100,
      isProfileFetched: true,
      location: '',
      pinnedTweetIds: [],
      website: '',
      isBlueVerified: false,
      isPrivate: false,
      joined: '',
      likesCount: 0,
    },
    {
      avatarUrl:
        'https://pbs.twimg.com/profile_images/1910521121193275392/SPYPj_ay_normal.jpg',
      banner:
        'https://pbs.twimg.com/profile_banners/1902034473400872960/1742760534',
      biography:
        '🎙️ @Xspaces Text-to-Speech & AI Analysis\n\n🔍 Unlock Insights. Amplify Voices\n\n📡 Capture Every Conversation\n\n#AMA #TextToSpeech #Xspace',
      canDm: true,
      displayName: 'Songjam',
      followersCount: 168,
      followingCount: 0,
      isBlueVerified: true,
      isPrivate: false,
      isProfileFetched: true,
      isVerified: false,
      joined: '',
      joinedAt: 1745510492173,
      leftAt: 1745512252188,
      likesCount: 27,
      listener: true,
      location: 'Trusted Execution Environment',
      pinnedTweetIds: ['1904279473543155738'],
      timeSpentInMs: 1760015,
      tweetsCount: 27,
      twitterScreenName: 'SongjamSpace',
      userId: '1902034473400872960',
      website: 'https://songjam.space',
    },
    {
      avatarUrl:
        'https://pbs.twimg.com/profile_images/1775232074338721792/CQY_1wkW_normal.jpg',
      banner: 'https://pbs.twimg.com/profile_banners/37118689/1744562546',
      biography: 'Community Director @0n1force | Coffee & Anime Enjoyer ☕️',
      canDm: true,
      displayName: 'Bobby-San',
      followersCount: 6045,
      followingCount: 4751,
      isBlueVerified: true,
      isPrivate: false,
      isProfileFetched: true,
      isVerified: false,
      joined: '',
      joinedAt: 1744920081394,
      leftAt: 1744920091486,
      likesCount: 143812,
      listener: true,
      location: 'New Tokyo',
      pinnedTweetIds: ['1886798962231017662'],
      timeSpentInMs: 10092,
      tweetsCount: 47079,
      twitterScreenName: 'Bkess75',
      userId: '1PXEdmlXNVZQe',
      website: '',
    },
    {
      avatarUrl:
        'https://pbs.twimg.com/profile_images/1729790698369495040/IisjDluB.jpg',
      banner:
        'https://pbs.twimg.com/profile_banners/1516412295546613761/1678093951',
      biography:
        'I build resilient communities that thrive no matter the market conditions.\nCM @bigaarcade.',
      followersCount: 2921,
      followingCount: 921,
      isPrivate: false,
      isVerified: false,
      likesCount: 22373,
      location: 'Kenya',
      displayName: 'mrKonsole',
      pinnedTweetIds: [],
      tweetsCount: 6860,
      isProfileFetched: true,
      joinedAt: 1743700715382,
      leftAt: 1743700745254,
      userId: '1516412295546613761',
      twitterScreenName: 'mrKonsole',
      isBlueVerified: true,
      canDm: true,
      joined: '2022-04-19T13:44:33.000Z',
      website: 'https://www.youtube.com/@mrkonsole',
    },
  ];
};

const TWEET_SUMMARY_COLLECTION = 'tweetSpacesPipeline';
export type TweetSummary = {
  createdAt: number;
  isSent: boolean;
  spaceId: string;
  status: 'SENT';
  tweet: string;
  tweetId: string;
};
export const getTweetSummary = async (spaceId: string) => {
  const docRef = doc(db, TWEET_SUMMARY_COLLECTION, spaceId);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as TweetSummary;
};
