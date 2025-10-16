import { db } from '../firebase.service';
import {
  doc,
  addDoc,
  collection,
  query,
  getDocs,
  where,
  updateDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  limit,
  orderBy,
  increment,
  writeBatch,
  startAfter,
} from 'firebase/firestore';
import { SpaceListener } from './spaces.service';

export type Campaign = {
  id?: string;
  ctaType: 'follow' | 'space' | 'live' | 'auto-dms';
  ctaTarget: string;
  spaceId: string;
  spaceTitle: string;
  projectId: string;
  userId: string;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'COMPLETED';
  createdAt: number;
  totalDms?: number;

  // Scheduled Campaign
  description?: string;
  topics?: string[];
  scheduledStart?: number;
  spaceSpeakerUsernames?: string[];
  selectedSpaceIds?: string[];
  addedType?: 'NEW' | 'ENDED_SPACE';
  hostHandle?: string;
  spaceUrl?: string;
  campaignType?: 'speakers' | 'listeners';
  isBroadcast?: boolean;
  generatedDms?: number;
};

export type CampaignListener = SpaceListener & {
  messageStatus: 'READY' | 'SENT' | 'FAILED';
  messageContent: string;
  messageCreatedAt: number;
  messageUpdatedAt: number;
  customLabel?: string;
};

export const CAMPAIGN_COLLECTION = 'campaigns';
export const CAMPAIGN_MESSAGES_SUBCOLLECTION = 'messages';

export const createCampaign = async (campaign: Campaign) => {
  const campaignRef = collection(db, CAMPAIGN_COLLECTION);
  const newCampaignRef = await addDoc(campaignRef, campaign);
  return { ...campaign, id: newCampaignRef.id } as unknown as Campaign;
};

export const createScheduledCampaign = async (campaign: Campaign) => {
  const campaignRef = collection(db, CAMPAIGN_COLLECTION);
  const newCampaignRef = await addDoc(campaignRef, campaign);
  return { ...campaign, id: newCampaignRef.id } as unknown as Campaign;
};

export const getCampaign = async (
  campaignId: string,
  listener?: (campaign: Campaign | null) => void
) => {
  const campaignRef = doc(db, CAMPAIGN_COLLECTION, campaignId);
  const campaignDoc = await getDoc(campaignRef);
  if (listener) {
    onSnapshot(campaignRef, (snapshot) => {
      const campaignData = snapshot.data() as Campaign;
      if (!campaignData) {
        listener(null);
      } else {
        listener({ ...campaignData, id: campaignId } as Campaign);
      }
    });
  }
  return { ...campaignDoc.data(), id: campaignId } as Campaign;
};

export const getCampaigns = async (spaceId: string, projectId: string) => {
  const campaignsRef = collection(db, CAMPAIGN_COLLECTION);
  const q = query(
    campaignsRef,
    where('spaceId', '==', spaceId),
    where('projectId', '==', projectId)
  );
  return await getDocs(q);
};

export const campaignsByProjectSpaceId = async (
  spaceId: string,
  projectId: string
) => {
  const campaignsRef = collection(db, CAMPAIGN_COLLECTION);
  const q = query(
    campaignsRef,
    where('spaceId', '==', spaceId),
    where('projectId', '==', projectId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Campaign[];
};

export const getCampaignListeners = async (campaignId: string) => {
  const campaignRef = collection(
    db,
    CAMPAIGN_COLLECTION,
    campaignId,
    CAMPAIGN_MESSAGES_SUBCOLLECTION
  );
  const campaignDoc = await getDocs(campaignRef);
  return campaignDoc.docs.map((doc) => doc.data() as CampaignListener);
};

export const updateCampaign = async (
  campaignId: string,
  campaign: Partial<Campaign>
) => {
  const campaignRef = doc(db, CAMPAIGN_COLLECTION, campaignId);
  await updateDoc(campaignRef, campaign);
};

export const updateCampaignListenerMessage = async (
  campaignId: string,
  listenerId: string,
  message: string
) => {
  const campaignRef = doc(
    db,
    CAMPAIGN_COLLECTION,
    campaignId,
    CAMPAIGN_MESSAGES_SUBCOLLECTION,
    listenerId
  );
  await updateDoc(campaignRef, {
    messageContent: message,
    messageUpdatedAt: Date.now(),
  });
};

export const getNewCampaignsByProjectId = async (
  projectId: string,
  listener?: (campaigns: Campaign[]) => void
) => {
  const campaignsRef = collection(db, CAMPAIGN_COLLECTION);
  const q = query(
    campaignsRef,
    where('projectId', '==', projectId),
    where('addedType', '==', 'NEW')
  );
  const snapshot = await getDocs(q);
  if (listener) {
    onSnapshot(q, (snapshot) => {
      listener(
        snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Campaign[]
      );
    });
  }
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Campaign[];
};

export const deleteCampaign = async (campaignId: string) => {
  const campaignRef = doc(db, CAMPAIGN_COLLECTION, campaignId);
  await deleteDoc(campaignRef);
};

export const subscribeToCampaignMessages = (
  campaignId: string,
  onUpdate: (
    messages: CampaignListener[],
    lastMessage?: CampaignListener
  ) => void
) => {
  const messagesRef = collection(
    db,
    CAMPAIGN_COLLECTION,
    campaignId,
    CAMPAIGN_MESSAGES_SUBCOLLECTION
  );

  // Create a query to order messages by timestamp
  const q = query(messagesRef, orderBy('messageCreatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as unknown as CampaignListener[];

    // Get the last message for streaming effect
    const lastMessage = messages[0];

    // Sort messages by timestamp (newest first)
    const sortedMessages = messages.sort(
      (a, b) => (b.messageCreatedAt || 0) - (a.messageCreatedAt || 0)
    );

    onUpdate(sortedMessages, lastMessage);
  });
};

export const deleteCampaignMessageDoc = async (
  campaignId: string,
  listenerId: string
) => {
  const campaignRef = doc(db, CAMPAIGN_COLLECTION, campaignId);
  const campaignMessageRef = doc(
    db,
    CAMPAIGN_COLLECTION,
    campaignId,
    CAMPAIGN_MESSAGES_SUBCOLLECTION,
    listenerId
  );
  // create a Transaction
  const transaction = writeBatch(db);
  transaction.update(campaignRef, {
    totalDms: increment(-1) as unknown as number,
    generatedDms: increment(-1) as unknown as number,
  });
  transaction.delete(campaignMessageRef);
  await transaction.commit();
};

export const dropCampaignMessagesSubcollection = async (campaignId: string) => {
  const campaignRef = doc(db, CAMPAIGN_COLLECTION, campaignId);
  const messagesRef = collection(
    db,
    CAMPAIGN_COLLECTION,
    campaignId,
    CAMPAIGN_MESSAGES_SUBCOLLECTION
  );

  const batchSize = 100;
  let totalDeleted = 0;
  let lastDoc = null;

  // Keep fetching and deleting in batches until no more documents
  while (true) {
    // Create a query to order messages by timestamp
    let q = query(
      messagesRef,
      where('messageStatus', '==', 'READY'),
      orderBy('messageCreatedAt', 'desc'),
      limit(batchSize)
    );

    // If we have a last document, start after it
    if (lastDoc) {
      q = query(
        messagesRef,
        where('messageStatus', '==', 'READY'),
        orderBy('messageCreatedAt', 'desc'),
        startAfter(lastDoc),
        limit(batchSize)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    // If no more documents, break the loop
    if (docs.length === 0) {
      break;
    }

    // Update the last document for next iteration
    lastDoc = docs[docs.length - 1];

    // Create and commit batch for current documents
    const batch = writeBatch(db);
    docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    totalDeleted += docs.length;
  }

  // Update campaign document with total count reduction
  if (totalDeleted > 0) {
    const campaignTransaction = writeBatch(db);
    campaignTransaction.update(campaignRef, {
      totalDms: increment(-totalDeleted) as unknown as number,
      generatedDms: increment(-totalDeleted) as unknown as number,
    });
    await campaignTransaction.commit();
  }
};
