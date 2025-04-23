import { db } from '../firebase.service';
import {
  doc,
  addDoc,
  collection,
  query,
  getDocs,
  where,
  updateDoc,
} from 'firebase/firestore';
import { SpaceListener } from './spaces.service';

export type Campaign = {
  id?: string;
  ctaType: 'follow' | 'space';
  ctaTarget: string;
  spaceId: string;
  spaceTitle: string;

  projectId: string;
  userId: string;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'COMPLETED';
  createdAt: number;
  totalDms?: number;
};

export type CampaignListener = SpaceListener & {
  messageStatus: 'READY' | 'SENT' | 'FAILED';
  messageContent: string;
  messageCreatedAt: number;
  messageUpdatedAt: number;
};

export const CAMPAIGN_COLLECTION = 'campaigns';
export const CAMPAIGN_MESSAGES_SUBCOLLECTION = 'messages';

export const createCampaign = async (campaign: Campaign) => {
  const campaignRef = collection(db, CAMPAIGN_COLLECTION);
  const newCampaignRef = await addDoc(campaignRef, campaign);
  return { ...newCampaignRef, id: newCampaignRef.id } as unknown as Campaign;
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
