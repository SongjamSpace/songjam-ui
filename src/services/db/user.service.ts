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
import { Project } from './projects.service';
import { isCustomDomain } from '../../utils';

export type SongjamUser = {
  displayName: string | null;
  photoURL: string | null;
  username: string | null;
  email: string;
  uid: string;
  spaceIds: string[];
  spaceCredits: number;
  totalUnlockedSpaces: number;

  isTwitterLogin: boolean;
  isDynamicLogin: boolean;
  projectIds: string[];
  defaultProjectId: string | null;

  currentPlan: 'free' | 'starter' | 'pro' | 'business';
  usage: {
    aiAssistantRequests: number;
    spaces: number;
    autoDms: number;
    totalRequests: number;
  };
  endsAt: number;
  startsAt: number;
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
  const domain = user.email.split('@')[1];
  batch.set(projectRef, {
    createdUserId: id,
    createdEmail: user.email,
    createdAt: Date.now(),
    domain: isCustomDomain(domain) ? domain : '',
    name: 'Project 1',
  } as Project);
  batch.set(doc(projectRef, 'members', user.email), {
    email: user.email,
    role: 'creator',
    isPending: false,
    isAccepted: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userId: id,
    projectId: projectRef.id,
  });
  const projectId = projectRef.id;

  batch.set(userRef, {
    ...user,
    createdAt: serverTimestamp(),
    projectIds: arrayUnion(projectId),
    defaultProjectId: projectId,
    domain: isCustomDomain(domain) ? domain : '',
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
      const user = snapshot.data() as SongjamUser;
      user.usage = {
        aiAssistantRequests: user.usage.aiAssistantRequests || 0,
        spaces: user.usage.spaces || 0,
        autoDms: user.usage.autoDms || 0,
        totalRequests: user.usage.totalRequests || 0,
      };
      user.currentPlan = user.currentPlan || 'free';
      listener(user);
    });
  }
  if (userDoc.exists()) {
    const user = userDoc.data() as SongjamUser;
    // if currentPlan is not set, set it to free in the db
    if (!user.currentPlan) {
      await updateDoc(userRef, { currentPlan: 'free' });
    }
    // if usage is not set, set default values in the db
    if (!user.usage) {
      await updateDoc(userRef, {
        usage: {
          aiAssistantRequests: 0,
          spaces: 0,
          autoDms: 0,
          totalRequests: 0,
        },
      });
    }
    user.usage = {
      aiAssistantRequests: user.usage.aiAssistantRequests || 0,
      spaces: user.usage.spaces || 0,
      autoDms: user.usage.autoDms || 0,
      totalRequests: user.usage.totalRequests || 0,
    };
    user.currentPlan = user.currentPlan || 'free';
    return user;
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

export const updateUserPlan = async (
  id: string,
  plan: string,
  startsAt: number,
  endsAt: number
) => {
  const userRef = doc(db, USER_COLLECTION, id);
  await updateDoc(userRef, { currentPlan: plan, startsAt, endsAt });
};

export const updateSpaceRequests = async (id: string) => {
  const userRef = doc(db, USER_COLLECTION, id);
  await updateDoc(userRef, { 'usage.spaces': increment(1) });
};

export const updateAutoDmsRequests = async (id: string) => {
  const userRef = doc(db, USER_COLLECTION, id);
  await updateDoc(userRef, { 'usage.autoDms': increment(1) });
};
