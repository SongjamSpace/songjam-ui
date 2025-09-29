import {
  getDoc,
  updateDoc,
  doc,
  increment,
  collection,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase.service';
import { TwitterUser } from './spaces.service';

const DJ_LURKY_SPACES_COL_NAME = 'djLurkySpaces';

export type DjLurkySpace = {
  spaceId: string;
  status: 'REQUESTED' | 'JOINED' | 'FAILED' | 'ENDED';
  createdAt: number;
  title?: string;
  startedAt?: number;
  admins?: TwitterUser[];
  speakers?: TwitterUser[];
};

export const getDjLurkySpaceDoc = async (spaceId: string) => {
  const docRef = doc(db, DJ_LURKY_SPACES_COL_NAME, spaceId);
  const docData = await getDoc(docRef);
  if (docData.exists()) {
    return docData.data() as DjLurkySpace;
  }
  return null;
};

export enum RequestType {
  LOAD_SOUNDBOARD = 'LOAD_SOUNDBOARD',
  PLAY_SOUND = 'PLAY_SOUND',
  STOP_SOUNDBOARD = 'STOP_SOUNDBOARD',
  GET_SOUNDBOARD_STATUS = 'GET_SOUNDBOARD_STATUS',
  PLAY_MUSIC = 'PLAY_MUSIC',
  STOP_MUSIC = 'STOP_MUSIC',
  REACT_EMOJI = 'REACT_EMOJI',
  SPEAK_TEXT = 'SPEAK_TEXT',
  LEAVE_SPACE = 'LEAVE_SPACE',
}

type RequstData = {
  audioFullPath?: string;
  emoji?: string;
};

type LurkySpaceDjRequest = {
  id: string;
  requestType: RequestType;
  data: RequstData;
  createdAt: any;
  isComplete: boolean;
  spaceId: string;
};
const REQUESTS_SUB_COLLECTION = 'requests';

export const sendDjRequest = async (
  spaceId: string,
  requestType: RequestType,
  data: RequstData
) => {
  const docRef = collection(
    db,
    DJ_LURKY_SPACES_COL_NAME,
    spaceId,
    REQUESTS_SUB_COLLECTION
  );
  await addDoc(docRef, {
    requestType,
    data,
    createdAt: Date.now(),
    isComplete: false,
    spaceId,
  } as LurkySpaceDjRequest);
};

export const updateDjDoc = async (
  spaceId: string,
  obj: Partial<DjLurkySpace>
) => {
  await updateDoc(doc(db, DJ_LURKY_SPACES_COL_NAME, spaceId), obj);
};
