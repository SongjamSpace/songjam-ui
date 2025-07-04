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
  setDoc,
  arrayUnion,
} from 'firebase/firestore';

const projectIdMap: { [key: string]: string } = {
  evaonlinexyz: 'evaonlinexyz_leaderboard',
};
const projectIdTweetsMap: { [key: string]: string } = {
  evaonlinexyz: 'evaonlinexyz_twitterMentions',
};

export type LeaderboardUser = {
  engagementPoints: number;
  name: string;
  postGenesisPoints: number;
  preGenesisPoints: number;
  totalPoints: number;
  userId: string;
  username: string;
};

export type UserTweetMention = {
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
  timestamp: number;
  text: string;
  mentions: { id: string; username?: string; name?: string }[];
  engagementPoints: number;
  docCreatedAt: number;
  tweetId: string;
  earlyMultiplier: number;
  baseEngagementPoints?: number;
};

export const getLeaderBoardUser = async (projectId: string, userId: string) => {
  const leaderboardRef = doc(db, projectIdMap[projectId], userId);
  const docSs = await getDoc(leaderboardRef);
  return docSs.data() as LeaderboardUser;
};

export const getTwitterMentions = async (projectId: string, userId: string) => {
  const leaderboardRef = query(
    collection(db, projectIdTweetsMap[projectId]),
    where('id', '==', userId)
  );
  const snapshot = await getDocs(leaderboardRef);
  return snapshot.docs.map((d) => d.data() as UserTweetMention);
};

export type AgentReport = {
  summary: string;
  repliesAnalysis: string;
  authenticity: number;
  quality: number;
  explanation: string;
  farmingIndicators: {
    averageHashtags: number;
    averageMentions: number;
    gmTweetCount: number;
    callToActionRatio: number;
  };
  botLikelihoodScore: number;
  tweetsCount: number;
};

export const getReport = async (id: string) => {
  const ss = await getDoc(doc(db, 'agentReports', id));
  return (await ss.data()) as AgentReport;
};

export type SlashDoc = {
  proposer: string;
  createdAt: number;
  userId: string;
  username: string;
  slashCount: number;
  defendCount: number;
  slashedUsernames: string[];
  defendedUsernames: string[];
  updatedAt: number;
};

const FLAG_DB_NAME = 'flags';

export const createSlash = async (
  projectId: string,
  userId: string,
  proposer: string,
  username: string
): Promise<SlashDoc> => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${userId}`);
  const slashDoc = {
    createdAt: Date.now(),
    defendCount: 0,
    slashCount: 1,
    proposer,
    username,
    slashedUsernames: [proposer],
    defendedUsernames: [],
    updatedAt: 0,
    userId,
  } as SlashDoc;
  await setDoc(slashRef, slashDoc);
  return slashDoc;
};

export const updateSlash = async (
  projectId: string,
  userId: string,
  username: string,
  vote: 'defend' | 'slash'
) => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${userId}`);
  await updateDoc(slashRef, {
    slashCount: increment(vote === 'slash' ? 1 : 0),
    defendCount: increment(vote === 'defend' ? 1 : 0),
    slashedUsernames: arrayUnion(username),
    defendedUsernames: arrayUnion(username),
    updatedAt: Date.now(),
  });
  const slash = await getSlash(projectId, userId);
  return slash;
};

export const getSlash = async (projectId: string, userId: string) => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${userId}`);
  const docSs = await getDoc(slashRef);
  return docSs.data() as SlashDoc;
};
