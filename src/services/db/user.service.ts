import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase.service';
import { projectsColRef } from './projects.service';

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
  projectIds: string[];
  defaultProjectId: string | null;
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
  // const orgInvites = await getOrganizationInvitesFromEmail(user.email);
  // if (orgInvites.length > 0) {
  //   await setDoc(userRef, {
  //     ...user,
  //     createdAt: serverTimestamp(),
  //     organizationIds: [],
  //     defaultOrganizationId: null,
  //   });
  // } else {
  // const orgId = await createOrganization(
  //   {
  //     createdUserId: id,
  //     createdAt: Date.now(),
  //     name: 'My Organization',
  //   },
  //   [
  //     {
  //       email: user.email,
  //       role: 'creator',
  //       isPending: false,
  //       isAccepted: true,
  //       createdAt: Date.now(),
  //       updatedAt: Date.now(),
  //       userId: id,
  //     },
  //   ]
  // );
  const batch = writeBatch(db);
  const projectRef = doc(projectsColRef);
  batch.set(projectRef, {
    createdUserId: id,
    createdEmail: user.email,
    createdAt: Date.now(),
    name: 'Project 1',
  });
  batch.set(doc(projectRef, 'members', user.email), {
    email: user.email,
    role: 'creator',
    isPending: false,
    isAccepted: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userId: id,
  });
  const projectId = projectRef.id;

  batch.set(userRef, {
    ...user,
    createdAt: serverTimestamp(),
    projectIds: arrayUnion(projectId),
    defaultProjectId: projectId,
  });

  await batch.commit();
  // await setDoc(userRef, {
  //   ...user,
  //   createdAt: serverTimestamp(),
  //   organizationIds: arrayUnion(orgId),
  //   defaultOrganizationId: orgId,
  // });
  // }
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

export const addProjectToUser = async (id: string, projectId: string) => {
  const userRef = doc(db, USER_COLLECTION, id);
  await updateDoc(userRef, {
    projectIds: arrayUnion(projectId),
    defaultProjectId: projectId,
  });
};

export const updateUserDefaultProjectId = async (
  id: string,
  projectId: string
) => {
  const userRef = doc(db, USER_COLLECTION, id);
  await updateDoc(userRef, { defaultProjectId: projectId });
};
