import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase.service";

const USER_COLLECTION = "users";
export const createUser = async (user: {
  address: string;
  chainId: string;
}) => {
  const userRef = doc(db, USER_COLLECTION, user.address);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  }

  await setDoc(userRef, {
    address: user.address,
    createdAt: serverTimestamp(),
    spaceIds: [],
    chainId: user.chainId,
  });
};

export const getUser = async (address: string) => {
  const userRef = doc(db, USER_COLLECTION, address);
  const userDoc = await getDoc(userRef);
  return userDoc.data();
};

export const updateAccess = async (address: string, spaceId: string) => {
  const userRef = doc(db, USER_COLLECTION, address);
  await setDoc(userRef, {
    spaceIds: arrayUnion(spaceId),
  });
};

export const hasAccessToSpace = async (address: string, spaceId: string) => {
  const user = await getUser(address);
  return user?.spaceIds.includes(spaceId);
};
