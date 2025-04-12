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
} from 'firebase/firestore';
import { db } from '../firebase.service';
import { updateAgentToSpace } from './spaces.service';

export type AgentOrg = {
  name: string;
  createdAt: number;
  createdUserId: string;
  authorizedUsers: string[];
};

export type AgentOrgDoc = AgentOrg & {
  id: string;
};

const COLLECTION_NAME = 'agents';

export const createAgentOrg = async (org: AgentOrg) => {
  const agentOrg = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(agentOrg, org);
  return docRef.id;
};

export const getAgentOrg = async (
  agentId: string
): Promise<AgentOrgDoc | null> => {
  const agentOrg = await getDoc(doc(db, COLLECTION_NAME, agentId));
  if (!agentOrg.exists()) {
    return null;
  }
  return { ...(agentOrg.data() as AgentOrg), id: agentOrg.id };
};

export const getAgentsByUserId = async (userId: string) => {
  // const agentOrg = await getDocs(
  //   query(
  //     collection(db, COLLECTION_NAME),
  //     where('authorizedUsers', 'array-contains', userId)
  //   )
  // );
  const agentOrg = await getDocs(
    query(collection(db, COLLECTION_NAME), where('createdUserId', '==', userId))
  );
  // if (agentOrg.docs.length === 0) {
  //   const newAgentOrg: AgentOrg = {
  //     id: userId,
  //     name: 'New Agent Org',
  //     createdAt: Date.now(),
  //     createdUserId: userId,
  //     authorizedUsers: [userId],
  //   };
  //   await createAgentOrg(newAgentOrg);
  //   return [newAgentOrg];
  // }
  return agentOrg.docs.map((doc) => ({
    ...(doc.data() as AgentOrg),
    id: doc.id,
  }));
};

export const updateAgentOrg = async (id: string, org: Partial<AgentOrg>) => {
  const agentOrg = doc(db, COLLECTION_NAME, id);
  await updateDoc(agentOrg, org);
};

export const updateSpaceToAgent = async (spaceId: string, agentId: string) => {
  const agent = doc(db, COLLECTION_NAME, agentId);
  const spaces = doc(db, COLLECTION_NAME, agentId, 'spaces', spaceId);
  await setDoc(spaces, {
    id: spaceId,
    createdAt: Date.now(),
  });
  await updateDoc(agent, {
    totalNoOfSpaces: increment(1),
  });

  await updateAgentToSpace(spaceId, agentId);
};
