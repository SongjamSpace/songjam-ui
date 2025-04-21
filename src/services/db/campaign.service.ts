import { db } from '../firebase.service';
import { addDoc, collection, collectionGroup } from 'firebase/firestore';

export type Campaign = {
  ctaType: 'follow' | 'space';
  ctaTarget: string;
  spaceId: string;
  projectId: string;
  userId: string;
  status: 'draft' | 'generating' | 'ready' | 'sending' | 'completed';
  messages: {
    [userId: string]: {
      content: string;
      status: 'pending' | 'generating' | 'ready' | 'sent' | 'failed';
    };
  };
};

export const createCampaign = async (campaign: Campaign) => {
  const campaignRef = collection(db, 'campaigns');
  collectionGroup;
  const newCampaignRef = await addDoc(campaignRef, campaign);
  return newCampaignRef;
};
