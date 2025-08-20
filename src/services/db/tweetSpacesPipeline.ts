import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

const TWEETED_SPACE_SUMMARIES_COLLECTION = 'tweetSpacesPipeline';

const getTweetedSpaceSummaryDoc = async (spaceId: string) => {
  const spaceRef = doc(db, TWEETED_SPACE_SUMMARIES_COLLECTION, spaceId);
  const spaceDoc = await getDoc(spaceRef);
  if (!spaceDoc.exists()) {
    return null;
  }
  return spaceDoc.data() || null;
};

export { getTweetedSpaceSummaryDoc };
