import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.service";

export type SongjamUser = {
  displayName: string | null;
  photoURL: string | null;
  username: string | null;
  email: string | null;
  uid: string | null;
  spaceIds: string[];
  spaceCredits: number;
  totalUnlockedSpaces: number;
};

type SongjamUserDoc = SongjamUser & {
  createdAt: string;
};

const USER_COLLECTION = "users";
export const createUser = async (id: string, user: SongjamUser) => {
  const userRef = doc(db, USER_COLLECTION, id);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  }

  await setDoc(userRef, {
    ...user,
    createdAt: serverTimestamp(),
  });
};

export const getUser = async (
  id: string,
  listener?: (user: SongjamUser) => void
) => {
  const userRef = doc(db, USER_COLLECTION, id);
  const userDoc = await getDoc(userRef);
  if (listener) {
    onSnapshot(userRef, (snapshot) => {
      listener(snapshot.data() as SongjamUser);
    });
  }
  if (userDoc.exists()) {
    return userDoc.data() as SongjamUser;
  }
  return null;
};

export const updateAccess = async (id: string, spaceId: string) => {
  const userRef = doc(db, USER_COLLECTION, id);
  await updateDoc(userRef, {
    spaceIds: arrayUnion(spaceId),
    spaceCredits: increment(-1),
    totalUnlockedSpaces: increment(1),
  });
};

export const hasAccessToSpace = async (id: string, spaceId: string) => {
  const user = await getUser(id);
  return user?.spaceIds.includes(spaceId);
};
