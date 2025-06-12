import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.service';

const MUSIC_AGENT_COLLECTION = 'musicAgentRequests';

export type MusicAgentRequest = {
  userId: string;
  audioUrl: string;
  spaceUrl?: string;
  startedAt: number;
  endedAt?: number;
  email: string;
};

// export const getMusicUploadsByUserId = async (userId: string) => {
//   const musicUploads = await getDocs(
//     query(collection(db, MUSIC_AGENT_COLLECTION), where('userId', '==', userId))
//   );
//   return musicUploads.docs.map((doc) => doc.data() as MusicAgentRequest);
// };

export const createMusicAgentRequest = async (request: MusicAgentRequest) => {
  const musicUploadRef = collection(db, MUSIC_AGENT_COLLECTION);
  await addDoc(musicUploadRef, { ...request, docCreatedAt: serverTimestamp() });
};
