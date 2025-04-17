import {
  collection,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  increment,
  setDoc,
  deleteDoc,
  writeBatch,
  arrayRemove,
  arrayUnion,
  documentId,
} from 'firebase/firestore';
import { db } from '../firebase.service';
import { updateAgentToSpace } from './spaces.service';
import { USER_COLLECTION } from './user.service';
import { OrganizationInvite } from './organizationInvites.service';

export type Organization = {
  name: string;
  createdAt: number;
  createdUserId: string;
};

export type OrganizationDoc = Organization & {
  id: string;
};

export type OrganizationMember = {
  email: string;
  role: 'creator' | 'admin' | 'viewer';
  isPending: boolean;
  isAccepted: boolean;
  createdAt: number;
  updatedAt: number;
  userId: string | null;
};

const COLLECTION_NAME = 'organizations';
const MEMBERS_COLLECTION_NAME = 'members';

export const createOrganization = async (
  org: Organization,
  members: OrganizationMember[]
) => {
  const agentOrg = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(agentOrg, org);
  for (const member of members) {
    const memberRef = doc(
      db,
      COLLECTION_NAME,
      docRef.id,
      MEMBERS_COLLECTION_NAME,
      member.email
    );
    await setDoc(memberRef, { ...member, createdAt: Date.now() });
  }
  return docRef.id;
};

export const getOrganizationsByIds = async (
  orgIds: string[]
): Promise<OrganizationDoc[]> => {
  const orgs = await getDocs(
    query(collection(db, COLLECTION_NAME), where(documentId(), 'in', orgIds))
  );
  return orgs.docs.map((doc) => ({
    ...(doc.data() as Organization),
    id: doc.id,
  }));
};

export const getOrganizationsById = async (
  orgId: string
): Promise<OrganizationDoc | null> => {
  const org = await getDoc(doc(db, COLLECTION_NAME, orgId));
  if (!org.exists()) {
    return null;
  }
  return { ...(org.data() as Organization), id: org.id };
};

export const updateOrganization = async (
  id: string,
  org: Partial<Organization>
) => {
  const orgRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(orgRef, org);
};

export const updateSpaceToAgent = async (spaceId: string, agentId: string) => {
  const orgRef = doc(db, COLLECTION_NAME, agentId);
  const spaces = doc(db, COLLECTION_NAME, agentId, 'spaces', spaceId);
  await setDoc(spaces, {
    id: spaceId,
    createdAt: Date.now(),
  });
  await updateDoc(orgRef, {
    totalNoOfSpaces: increment(1),
  });

  await updateAgentToSpace(spaceId, agentId);
};

export const addMemberToOrganization = async (
  orgId: string,
  member: OrganizationMember
) => {
  const memberRef = doc(
    db,
    COLLECTION_NAME,
    orgId,
    MEMBERS_COLLECTION_NAME,
    member.email
  );
  await setDoc(memberRef, { ...member });
};

export const getOrganizationMembers = async (orgId: string) => {
  const members = await getDocs(
    query(collection(db, COLLECTION_NAME, orgId, MEMBERS_COLLECTION_NAME))
  );
  return members.docs.map((doc) => doc.data() as OrganizationMember);
};

// Batch Operations

export const acceptOrgInvite = async (
  invite: OrganizationInvite,
  userId: string
) => {
  const batch = writeBatch(db);

  // Update the organization invite
  const organizationInviteRef = doc(
    db,
    'organizationInvites',
    `${invite.organizationId}_${invite.email}`
  );
  batch.delete(organizationInviteRef);

  // Update the organization member
  const memberRef = doc(
    db,
    COLLECTION_NAME,
    invite.organizationId,
    MEMBERS_COLLECTION_NAME,
    invite.email
  );
  batch.update(memberRef, {
    isPending: false,
    isAccepted: true,
    userId,
  });

  // Update the user
  const userRef = doc(db, USER_COLLECTION, userId);
  batch.update(userRef, {
    organizationIds: arrayUnion(invite.organizationId),
    defaultOrganizationId: invite.organizationId,
    updatedAt: Date.now(),
  });

  await batch.commit();
};

export const rejectOrgInvite = async (
  invite: OrganizationInvite,
  userId: string
) => {
  const batch = writeBatch(db);

  //   await updateOrganizationInvite(invite.email, invite.organizationId, false);
  const organizationInviteRef = doc(
    db,
    'organizationInvites',
    `${invite.organizationId}_${invite.email}`
  );
  batch.delete(organizationInviteRef);
  //   await updateOrganizationMember(invite.email, invite.organizationId, false);
  const memberRef = doc(
    db,
    COLLECTION_NAME,
    invite.organizationId,
    MEMBERS_COLLECTION_NAME,
    invite.email
  );
  batch.update(memberRef, {
    isPending: false,
    isAccepted: false,
    userId,
    updatedAt: Date.now(),
  });

  await batch.commit();
};

export const removeUserFromMembers = async (
  email: string,
  organizationId: string,
  userId: string | null
) => {
  const batch = writeBatch(db);
  const memberRef = doc(
    db,
    COLLECTION_NAME,
    organizationId,
    MEMBERS_COLLECTION_NAME,
    email
  );
  batch.delete(memberRef);
  // Update the user
  if (userId) {
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      organizationIds: arrayRemove(organizationId),
      updatedAt: Date.now(),
    });
  }

  await batch.commit();
};
