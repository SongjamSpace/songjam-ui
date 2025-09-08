import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  increment,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase.service';

export type Referral = {
  id: string;
  accountId?: string | null;
  email: string;
  username: string | null;
  uid: string;
  createdAt: number;
  referralCount: number;
  playCount: number;
  referralCode: string;
};

export const REFERRAL_COLLECTION = 'referrals';

// Create a new referral document
export const createReferral = async (
  userId: string,
  userData: {
    accountId?: string | null;
    email: string;
    username: string | null;
    uid: string;
  }
): Promise<string> => {
  const referralRef = doc(collection(db, REFERRAL_COLLECTION));
  const docId = referralRef.id;

  const referralData: Omit<Referral, 'id'> = {
    accountId: userData.accountId ?? '',
    email: userData.email ?? '',
    username: userData.username ?? '',
    uid: userData.uid,
    createdAt: Date.now(),
    referralCount: 0,
    playCount: 0,
    referralCode: docId,
  };

  await setDoc(referralRef, referralData);
  return docId;
};

// Get referral by user ID
export const getReferralByTwitterId = async (
  twitterId: string
): Promise<Referral | null> => {
  const q = query(
    collection(db, REFERRAL_COLLECTION),
    where('accountId', '==', twitterId)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Referral;
};

// Get referral by referral code
export const getReferralByCode = async (
  referralCode: string
): Promise<Referral | null> => {
  const q = query(
    collection(db, REFERRAL_COLLECTION),
    where('referralCode', '==', referralCode)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Referral;
};

// Get referral by document ID
export const getReferralById = async (
  referralId: string
): Promise<Referral | null> => {
  const referralRef = doc(db, REFERRAL_COLLECTION, referralId);
  const referralDoc = await getDoc(referralRef);

  if (!referralDoc.exists()) {
    return null;
  }

  return {
    id: referralDoc.id,
    ...referralDoc.data(),
  } as Referral;
};

// Increment referral count
export const incrementReferralCount = async (
  referralId: string
): Promise<void> => {
  const referralRef = doc(db, REFERRAL_COLLECTION, referralId);
  await updateDoc(referralRef, {
    referralCount: increment(1),
  });
};

// Increment play count
export const incrementPlayCount = async (referralId: string): Promise<void> => {
  const referralRef = doc(db, REFERRAL_COLLECTION, referralId);
  await updateDoc(referralRef, {
    playCount: increment(1),
  });
};

// Get or create referral for user
export const getOrCreateReferral = async (
  twitterId: string,
  userData: {
    accountId?: string | null;
    email: string;
    username: string | null;
    uid: string;
  }
): Promise<Referral> => {
  // First try to get existing referral
  const existingReferral = await getReferralByTwitterId(twitterId);
  if (existingReferral) {
    return existingReferral;
  }

  // Create new referral if none exists
  await createReferral(twitterId, userData);
  const newReferral = await getReferralByTwitterId(twitterId);

  if (!newReferral) {
    throw new Error('Failed to create referral');
  }

  return newReferral;
};
