import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.service';
import { createOrganization } from './organization.service';
import { getOrganizationInvitesFromEmail } from './organizationInvites.service';

export type SongjamUser = {
  displayName: string | null;
  photoURL: string | null;
  username: string | null;
  email: string;
  uid: string | null;
  spaceIds: string[];
  spaceCredits: number;
  totalUnlockedSpaces: number;

  isTwitterLogin: boolean;
  isDynamicLogin: boolean;
  organizationIds: string[];
  defaultOrganizationId: string | null;
};

type SongjamUserDoc = SongjamUser & {
  createdAt: string;
};

export const USER_COLLECTION = 'users';

export const createUser = async (id: string, user: SongjamUser) => {
  const userRef = doc(db, USER_COLLECTION, id);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  }
  // Check if the user has an organization invite
  const orgInvites = await getOrganizationInvitesFromEmail(user.email);
  if (orgInvites.length > 0) {
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      organizationIds: [],
      defaultOrganizationId: null,
    });
  } else {
    const orgId = await createOrganization(
      {
        createdUserId: id,
        createdAt: Date.now(),
        name: 'My Organization',
      },
      [
        {
          email: user.email,
          role: 'creator',
          isPending: false,
          isAccepted: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          userId: id,
        },
      ]
    );

    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      organizationIds: arrayUnion(orgId),
      defaultOrganizationId: orgId,
    });
  }
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

export const updateUserOrgId = async (id: string, orgId: string) => {
  const userRef = doc(db, USER_COLLECTION, id);
  await updateDoc(userRef, {
    organizationIds: arrayUnion(orgId),
    defaultOrganizationId: orgId,
  });
};
