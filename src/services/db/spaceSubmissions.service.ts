import {
  collection,
  doc,
  getDoc,
  increment,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.service';

const spaceSubmissions = collection(db, 'spaceSubmissions');

export type SpaceSubmission = {
  spaceUrl: string;
  userId: string;
  username?: string;
  name?: string;
  twitterId?: string | null;
  createdAt: Date;
  spacePoints: number;
  status?: 'pending' | 'done';
};

export const createSpaceSubmission = async (
  id: string,
  submission: SpaceSubmission
) => {
  const docRef = await setDoc(doc(spaceSubmissions, id), submission);
  return docRef;
};

export const markSubmissionAsDone = async (id: string) => {
  const docRef = await updateDoc(doc(spaceSubmissions, id), { status: 'done' });
  return docRef;
};

const GRANTED_SPACE_POINTS_COL = 'grantedSpacePoints';

type GrantedSpacePoints = {
  name: string;
  spacePoints: number;
  userId: string;
  username: string;
};

export const grantSpacePoints = async (
  userId: string,
  name: string,
  username: string,
  spacePoints: number
) => {
  const userSs = await getDoc(doc(db, GRANTED_SPACE_POINTS_COL, userId));
  if (userSs.exists()) {
    await updateDoc(doc(db, GRANTED_SPACE_POINTS_COL, userId), {
      spacePoints: increment(spacePoints),
    });
  } else {
    await setDoc(doc(db, GRANTED_SPACE_POINTS_COL, userId), {
      name,
      spacePoints,
      userId,
      username,
    });
  }
};
