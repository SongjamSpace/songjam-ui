import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

export type DjInstance = {
  spaceId: string;
  userId: string;
  username: string;
  socketId: string;
  email?: string;

  referredById?: string;
  referredByUid?: string;
  referredByTwitterId?: string;
};
const LATEST_DJ_COLLECTION = 'djSpaces';

export const createDjSpacesDoc = async (obj: DjInstance) => {
  await setDoc(doc(collection(db, LATEST_DJ_COLLECTION), obj.spaceId), {
    ...Object,
    createdDateTime: serverTimestamp(),
    createdAt: Date.now(),
  });
};
// const DJ_PROFILE_COLLECTION_NAME = 'djProfiles';

// export type DjProfile = {
//   userId: string;
//   username: string;
//   createdAt: number;
// };

// export const createDjProfile = async (obj: DjProfile) => {
//   await setDoc(doc(collection(db, DJ_PROFILE_COLLECTION_NAME), obj.userId), {
//     userId: obj.userId,
//     username: obj.username,
//     createdDateTime: serverTimestamp(),
//   });
// };
