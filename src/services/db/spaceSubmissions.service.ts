import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

const spaceSubmissions = collection(db, 'spaceSubmissions');

type SpaceSubmission = {
  spaceUrl: string;
  userId: string;
  username?: string;
  name?: string;
  twitterId?: string | null;
  createdAt: Date;
  spacePoints: number;
};

export const createSpaceSubmission = async (
  id: string,
  submission: SpaceSubmission
) => {
  const docRef = await setDoc(doc(spaceSubmissions, id), submission);
  return docRef;
};
