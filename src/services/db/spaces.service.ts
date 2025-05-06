import {
  collection,
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
  state: string;
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
    viewCountGraph: number[];
  };
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
    limit(30)
  );
  const snapshot = await getDocs(colRef);
  return (
    snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as (Space & { id: string })[]
  ).filter((space) => space.speakers.length > 0);
};

export type AudioSpace = {
  metadata: {
    title: string;
    rest_id: string;
    state: string;
    media_key: string;
    created_at: number;
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
