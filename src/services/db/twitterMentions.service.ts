import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase.service';

type UserTweetMention = {
  username: string;
  id: string;
  name: string;
  isPin: boolean;
  urls: string[];
  isQuoated: boolean;
  isReply: boolean;
  isRetweet: boolean;
  likes: number;
  replies: number;
  retweets: number;
  quotes: number;
  views: number;
  isQuoted: boolean;
  bookmarks: number;
  timeParsed: Date | null;
  timestamp: number | null;
  text: string;
  engagementPoints: number;
  docCreatedAt: number;
};

export type UserLeaderboardEntry = {
  username: string;
  userId: string;
  name: string;
  totalPoints: number;
};

export const getTwitterMentionsLeaderboard = async (): Promise<
  UserLeaderboardEntry[]
> => {
  const space = await getDocs(
    query(collection(db, 'twitterMentions'), where('engagementPoints', '>', 0))
  );
  const mentions = space.docs.map((doc) => doc.data() as UserTweetMention);

  const userData: Record<string, UserLeaderboardEntry> = {};

  const ignoredUsers = ['logeshr24', 'adam_songjam', 'SongjamSpace'];
  mentions.forEach((mention) => {
    if (ignoredUsers.includes(mention.username)) {
      return;
    }
    if (userData[mention.id]) {
      userData[mention.id].totalPoints += mention.engagementPoints;
    } else {
      userData[mention.id] = {
        username: mention.username,
        userId: mention.id,
        name: mention.name,
        totalPoints: mention.engagementPoints,
      };
    }
  });

  return Object.values(userData).sort((a, b) => b.totalPoints - a.totalPoints);
};
