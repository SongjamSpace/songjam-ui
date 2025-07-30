import axios from 'axios';
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

const leaderboardEndpointsIdMap: { [key: string]: string } = {
  evaonlinexyz: 'https://evaonlinexyz-leaderboard.logesh-063.workers.dev/',
  songjamspace:
    'https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace',
};
const projectIdTweetsMap: { [key: string]: string } = {
  evaonlinexyz: 'evaonlinexyz_twitterMentions',
  songjamspace: 'twitterMentions_17_06_2025',
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
  const lbData = await axios.get(leaderboardEndpointsIdMap[projectId]);
  const leaderboard = Array.isArray(lbData.data)
    ? lbData.data
    : lbData.data.result;
  const leaderboardUser = leaderboard.find(
    (user: LeaderboardUser) => user.userId === userId
  );
  return leaderboardUser;
};

export const getTwitterMentions = async (projectId: string, userId: string) => {
  const leaderboardRef = query(
    collection(db, projectIdTweetsMap[projectId]),
    where('id', '==', userId),
    limit(20)
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
  slashedUserIds: string[];
  defendedUsernames: string[];
  updatedAt: number;
};

const FLAG_DB_NAME = 'flags';

export const createSlash = async (
  projectId: string,
  flagUserId: string,
  proposer: string,
  username: string,
  voterUserId: string
): Promise<SlashDoc> => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${flagUserId}`);
  const slashDoc = {
    createdAt: Date.now(),
    defendCount: 0,
    slashCount: 1,
    proposer,
    username,
    slashedUsernames: [proposer],
    slashedUserIds: [voterUserId],
    defendedUsernames: [],
    updatedAt: 0,
    userId: flagUserId,
  } as SlashDoc;
  await setDoc(slashRef, slashDoc);
  return slashDoc;
};

export const updateSlash = async (
  projectId: string,
  userId: string,
  username: string,
  vote: 'defend' | 'slash',
  voterUserId: string
) => {
  const slashRef = doc(db, FLAG_DB_NAME, `${projectId}_${userId}`);
  await updateDoc(slashRef, {
    slashCount: increment(vote === 'slash' ? 1 : 0),
    defendCount: increment(vote === 'defend' ? 1 : 0),
    slashedUsernames: arrayUnion(username),
    slashedUserIds: arrayUnion(voterUserId),
    defendedUsernames: [],
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
