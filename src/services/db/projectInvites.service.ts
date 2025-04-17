import { db } from '../firebase.service';
import {
  collection,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { doc } from 'firebase/firestore';

export type ProjectInvite = {
  projectId: string;
  projectName: string;
  email: string;
  createdAt: number;
  isAccepted: boolean;
  invitedBy: { email: string; userId: string };
};

export const PROJECT_INVITES_COLLECTION = 'projectInvites';

const createProjectInvite = async (
  projectId: string,
  projectName: string,
  email: string,
  invitedBy: { email: string; userId: string }
) => {
  // Only one invite can exists for a given email
  const projectInviteRef = doc(
    db,
    PROJECT_INVITES_COLLECTION,
    `${projectId}_${email}`
  );
  const projectInvite = await getDoc(projectInviteRef);
  if (projectInvite.exists()) {
    return false;
  }
  await setDoc(projectInviteRef, {
    projectId,
    email,
    createdAt: Date.now(),
    isAccepted: false,
    isPending: true,
    invitedBy,
    projectName,
    userId: null,
  });
  return true;
};

const getProjectInvitesFromEmail = async (email: string) => {
  const projectInviteRef = collection(db, PROJECT_INVITES_COLLECTION);
  const projectInvites = await getDocs(
    query(projectInviteRef, where('email', '==', email))
  );
  return projectInvites.docs.map((doc) => doc.data());
};

const updateProjectInvite = async (
  email: string,
  projectId: string,
  isAccepted: boolean
) => {
  const projectInviteRef = doc(
    db,
    PROJECT_INVITES_COLLECTION,
    `${projectId}_${email}`
  );
  await updateDoc(projectInviteRef, {
    isAccepted,
    updatedAt: Date.now(),
    isPending: false,
  });
};

export { createProjectInvite, getProjectInvitesFromEmail, updateProjectInvite };
