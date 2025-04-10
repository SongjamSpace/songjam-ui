import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, storage } from '../firebase.service';
import { getDownloadURL } from 'firebase/storage';
import { ref } from 'firebase/storage';
import axios from 'axios';
import { AudioSpace, Space, SpaceListener } from '../../types/space.types';

const SPACE_COLLECTION = 'spaces';
const SUMMARY_SUBCOLLECTION = 'summaries';
const SEGMENTS_SUBCOLLECTION = 'segments';
const TWITTER_THREADS_SUBCOLLECTION = 'twitter_threads';
const LISTENER_LOGS_SUBCOLLECTION = 'listenerLogs';

// Modify getSpace to handle null case properly
export const getSpace = async (
  spaceId: string,
  onUpdate?: (space: Space) => void
): Promise<Space | null> => {
  const docRef = doc(db, SPACE_COLLECTION, spaceId);
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

export const getRawSpaceFromX = async (spaceId: string) => {
  const res = await axios.get(
    `${import.meta.env.VITE_JAM_SERVER_URL}/get-space/${spaceId}`
  );
  return res.data.result as AudioSpace;
};

export const updateAgentToSpace = async (spaceId: string, agentId: string) => {
  const docRef = doc(db, SPACE_COLLECTION, spaceId);
  await updateDoc(docRef, {
    agentIds: arrayUnion(agentId),
  });
};
