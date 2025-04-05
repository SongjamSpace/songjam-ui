import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db, storage } from '../firebase.service';
import { getDownloadURL } from 'firebase/storage';
import { ref } from 'firebase/storage';

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
  timeSpent: number | null;
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

// Add API status tracking
export const XApiStatus = {
  READY: 'ready',
  RATE_LIMITED: 'rate_limited',
  ERROR: 'error',
  UNAUTHORIZED: 'unauthorized',
};

let currentApiStatus = XApiStatus.READY;
let lastApiError: Error | null = null;

// Add error handling wrapper
const handleXApiRequest = async <T>(
  requestFn: () => Promise<T>,
  retryCount = 3
): Promise<T> => {
  try {
    const response = await requestFn();
    currentApiStatus = XApiStatus.READY;
    lastApiError = null;
    return response;
  } catch (error: any) {
    if (error.status === 429) {
      currentApiStatus = XApiStatus.RATE_LIMITED;
      const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return handleXApiRequest(requestFn, retryCount - 1);
      }
    } else if (error.status === 401) {
      currentApiStatus = XApiStatus.UNAUTHORIZED;
      // Trigger re-authentication
      window.dispatchEvent(new CustomEvent('x-api-unauthorized'));
    } else {
      currentApiStatus = XApiStatus.ERROR;
    }
    lastApiError = error;
    throw error;
  }
};

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

// Add API status monitoring
export const getXApiStatus = () => ({
  status: currentApiStatus,
  lastError: lastApiError,
});

// Add token refresh handling
export const refreshXApiToken = async () => {
  // Implement token refresh logic
};

const SUMMARY_SUBCOLLECTION = 'summaries';
export const getSummary = async (spaceId: string) => {
  const docRef = doc(
    db,
    'spaces',
    spaceId,
    SUMMARY_SUBCOLLECTION,
    'final_summary'
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export const getDetailedSummary = async (spaceId: string) => {
  const docRef = doc(db, 'spaces', spaceId, SUMMARY_SUBCOLLECTION, 'meta');
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.first_level_summaries;
};

export const getFirstLevelSummaries = async (spaceId: string) => {
  const docRef = doc(db, 'spaces', spaceId, SUMMARY_SUBCOLLECTION, 'meta');
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.first_level_summaries;
};

export const getFullTranscription = async (spaceId: string) => {
  const docRef = doc(
    db,
    'spaces',
    spaceId,
    SUMMARY_SUBCOLLECTION,
    'full_transcript'
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.text;
};

export const getSegments = async (spaceId: string) => {
  const colRef = query(
    collection(db, 'spaces', spaceId, 'segments'),
    orderBy('idx', 'asc'),
    limit(20)
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};

export const getTwitterThread = async (spaceId: string) => {
  const docRef = doc(db, 'spaces', spaceId, 'twitter_threads', 'v1');
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
    collection(db, 'spaces', spaceId, 'listenerLogs'),
    orderBy('joinedAt', 'asc')
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data() as SpaceListener);
};
