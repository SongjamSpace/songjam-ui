import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.service";

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
