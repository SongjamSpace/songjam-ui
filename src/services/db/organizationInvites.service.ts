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

export type OrganizationInvite = {
  organizationId: string;
  organizationName: string;
  email: string;
  createdAt: number;
  isAccepted: boolean;
  invitedBy: { email: string; userId: string };
};

const createOrganizationInvite = async (
  organizationId: string,
  organizationName: string,
  email: string,
  invitedBy: { email: string; userId: string }
) => {
  // Only one invite can exists for a given email
  const organizationInviteRef = doc(
    db,
    'organizationInvites',
    `${organizationId}_${email}`
  );
  const organizationInvite = await getDoc(organizationInviteRef);
  if (organizationInvite.exists()) {
    return false;
  }
  await setDoc(organizationInviteRef, {
    organizationId,
    email,
    createdAt: Date.now(),
    isAccepted: false,
    isPending: true,
    invitedBy,
    organizationName,
    userId: null,
  });
  return true;
};

const getOrganizationInvitesFromEmail = async (email: string) => {
  const organizationInviteRef = collection(db, 'organizationInvites');
  const organizationInvites = await getDocs(
    query(organizationInviteRef, where('email', '==', email))
  );
  return organizationInvites.docs.map((doc) => doc.data());
};

const updateOrganizationInvite = async (
  email: string,
  organizationId: string,
  isAccepted: boolean
) => {
  const organizationInviteRef = doc(
    db,
    'organizationInvites',
    `${organizationId}_${email}`
  );
  await updateDoc(organizationInviteRef, {
    isAccepted,
    updatedAt: Date.now(),
    isPending: false,
  });
};

export {
  createOrganizationInvite,
  getOrganizationInvitesFromEmail,
  updateOrganizationInvite,
};
