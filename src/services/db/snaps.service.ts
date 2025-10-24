import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase.service';

export interface SnapJob {
  id?: string;
  searchQuery: string;
  status: 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: number;
  updatedAt: number;
  tweetsCount: number;
  profilesCount: number;
  error?: string;
  lastCursor?: string;
  userId: string;
}

const SNAPJOBS_COLLECTION = 'snaps';

export const getSnapListenerById = (
  snapId: string,
  listener: (snap: SnapJob) => void
) => {
  const snapRef = doc(db, SNAPJOBS_COLLECTION, snapId);
  return onSnapshot(snapRef, (snapshot) => {
    listener(snapshot.data() as SnapJob);
  });
};

export const getSnapJobsByUserId = async (
  userId: string,
  listener?: (snapJobs: SnapJob[]) => void
) => {
  const snapJobsRef = collection(db, SNAPJOBS_COLLECTION);
  const q = query(
    snapJobsRef,
    where('userId', '==', userId),
    where('status', '==', 'COMPLETED'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  if (listener) {
    onSnapshot(q, (snapshot) => {
      listener(
        snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as SnapJob[]
      );
    });
  }

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as SnapJob[];
};
