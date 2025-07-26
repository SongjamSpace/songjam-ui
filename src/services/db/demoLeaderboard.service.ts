import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { db } from '../firebase.service';

export const getDemoLeaderboard = async (queryId: string) => {
  const docs = await getDocs(
    // query(collection(db, 'demo', queryId, 'leaderboard'), limit(10))
    collection(db, 'demo', queryId, 'leaderboard')
  );
  return docs.docs.map((doc) => doc.data());
};

export const getDemoDoc = async (queryId: string) => {
  const ss = await getDoc(doc(db, 'demo', queryId));
  if (!ss.exists) {
    return null;
  }
  return ss.data() as {
    createdAt: number;
    tweetsCount: number;
    totalImpressions: number;
  };
};
