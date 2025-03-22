import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebase.service";
import { getDownloadURL } from "firebase/storage";
import { ref } from "firebase/storage";

export type User = {
  user_id: string;
  display_name: string;
  twitter_screen_name: string;
  avatar_url: string;
  is_verified: boolean;
  speaker?: boolean;
  admin?: boolean;
};

export type Segment = {
  id: number;
  start: number;
  text: string;
  end: number;
};
export type Space = {
  transcription_status: "STARTED" | "PROCESSING" | "FAILED" | "ENDED";
  type: "recorded" | "live";
  spaceId: string;
  hls_url: string;

  title: string;
  state: string;
  media_key: string;
  created_at: number;
  started_at: number;
  ended_at: string;
  content_type: string;
  is_space_available_for_replay: boolean;
  is_space_available_for_clipping: boolean;
  total_replay_watched: number;
  total_live_listeners: number;
  tweet_id: string | any;
  admins: User[];
  speakers: User[];

  text?: string;
  segments?: Segment[];
};

export const getSpace = async (spaceId: string) => {
  const docRef = doc(db, "spaces", spaceId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

const SUMMARY_SUBCOLLECTION = "summaries";
export const getSummary = async (spaceId: string) => {
  const docRef = doc(
    db,
    "spaces",
    spaceId,
    SUMMARY_SUBCOLLECTION,
    "final_summary"
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export const getFirstLevelSummaries = async (spaceId: string) => {
  const docRef = doc(db, "spaces", spaceId, SUMMARY_SUBCOLLECTION, "meta");
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.first_level_summaries;
};

export const getSegmentsAndText = async (spaceId: string) => {
  const docRef = doc(db, "spaces", spaceId, "segments", "raw");
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export const getTwitterThread = async (spaceId: string) => {
  const docRef = doc(db, "spaces", spaceId, "twitter_threads", "v1");
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.thread;
};

export const getSpaceAudioDownloadUrl = async (spaceId: string) => {
  const storageRef = ref(storage, `spaces/${spaceId}.mp3`);
  const url = await getDownloadURL(storageRef);
  return url;
};
