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

export type AutoDm = {
  id?: string;
  title: string;
  aiContext?: string;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'COMPLETED';
  userId: string;
  promptSettings?: {
    tone?: string;
    length?: string;
    style?: string;
    customInstructions?: string;
  };
  createdAt: number;
  totalDms?: number;
  generatedDms?: number;
};

export type AutoDmListener = SpaceListener & {
  messageStatus: 'READY' | 'SENT' | 'FAILED';
  messageContent: string;
  messageCreatedAt: number;
  messageUpdatedAt: number;
  customLabel?: string;
};

export const AUTODM_COLLECTION = 'autoDms';
export const AUTODM_MESSAGES_SUBCOLLECTION = 'messages';

export const createAutoDm = async (autoDm: AutoDm) => {
  const autoDmRef = collection(db, AUTODM_COLLECTION);
  const newAutoDmRef = await addDoc(autoDmRef, autoDm);
  return { ...autoDm, id: newAutoDmRef.id } as unknown as AutoDm;
};

export const getAutoDm = async (
  autoDmId: string,
  listener?: (autoDm: AutoDm | null) => void
) => {
  const autoDmRef = doc(db, AUTODM_COLLECTION, autoDmId);
  const autoDmDoc = await getDoc(autoDmRef);
  if (listener) {
    onSnapshot(autoDmRef, (snapshot) => {
      const autoDmData = snapshot.data() as AutoDm;
      if (!autoDmData) {
        listener(null);
      } else {
        listener({ ...autoDmData, id: autoDmId } as AutoDm);
      }
    });
  }
  return { ...autoDmDoc.data(), id: autoDmId } as AutoDm;
};

export const getAutoDmsByUserId = async (
  userId: string,
  listener?: (autoDms: AutoDm[]) => void
) => {
  const autoDmsRef = collection(db, AUTODM_COLLECTION);
  const q = query(
    autoDmsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  if (listener) {
    onSnapshot(q, (snapshot) => {
      listener(
        snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as AutoDm[]
      );
    });
  }
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as AutoDm[];
};

export const getAutoDmListeners = async (autoDmId: string) => {
  const autoDmRef = collection(
    db,
    AUTODM_COLLECTION,
    autoDmId,
    AUTODM_MESSAGES_SUBCOLLECTION
  );
  const autoDmDoc = await getDocs(autoDmRef);
  return autoDmDoc.docs.map((doc) => doc.data() as AutoDmListener);
};

export const updateAutoDm = async (
  autoDmId: string,
  autoDm: Partial<AutoDm>
) => {
  const autoDmRef = doc(db, AUTODM_COLLECTION, autoDmId);
  await updateDoc(autoDmRef, autoDm);
};

export const updateAutoDmListenerMessage = async (
  autoDmId: string,
  listenerId: string,
  message: string
) => {
  const autoDmRef = doc(
    db,
    AUTODM_COLLECTION,
    autoDmId,
    AUTODM_MESSAGES_SUBCOLLECTION,
    listenerId
  );
  await updateDoc(autoDmRef, {
    messageContent: message,
    messageUpdatedAt: Date.now(),
  });
};

export const deleteAutoDm = async (autoDmId: string) => {
  const autoDmRef = doc(db, AUTODM_COLLECTION, autoDmId);
  await deleteDoc(autoDmRef);
};

export const subscribeToAutoDmMessages = (
  autoDmId: string,
  onUpdate: (messages: AutoDmListener[], lastMessage?: AutoDmListener) => void
) => {
  const messagesRef = collection(
    db,
    AUTODM_COLLECTION,
    autoDmId,
    AUTODM_MESSAGES_SUBCOLLECTION
  );

  // Create a query to order messages by timestamp
  const q = query(messagesRef, orderBy('messageCreatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as unknown as AutoDmListener[];

    // Get the last message for streaming effect
    const lastMessage = messages[0];

    // Sort messages by timestamp (newest first)
    const sortedMessages = messages.sort(
      (a, b) => (b.messageCreatedAt || 0) - (a.messageCreatedAt || 0)
    );

    onUpdate(sortedMessages, lastMessage);
  });
};

export const deleteAutoDmMessageDoc = async (
  autoDmId: string,
  listenerId: string
) => {
  const autoDmRef = doc(db, AUTODM_COLLECTION, autoDmId);
  const autoDmMessageRef = doc(
    db,
    AUTODM_COLLECTION,
    autoDmId,
    AUTODM_MESSAGES_SUBCOLLECTION,
    listenerId
  );
  // create a Transaction
  const transaction = writeBatch(db);
  transaction.update(autoDmRef, {
    totalDms: increment(-1) as unknown as number,
    generatedDms: increment(-1) as unknown as number,
  });
  transaction.delete(autoDmMessageRef);
  await transaction.commit();
};

export const dropAutoDmMessagesSubcollection = async (autoDmId: string) => {
  const autoDmRef = doc(db, AUTODM_COLLECTION, autoDmId);
  const messagesRef = collection(
    db,
    AUTODM_COLLECTION,
    autoDmId,
    AUTODM_MESSAGES_SUBCOLLECTION
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

  // Update autoDm document with total count reduction
  if (totalDeleted > 0) {
    const autoDmTransaction = writeBatch(db);
    autoDmTransaction.update(autoDmRef, {
      totalDms: increment(-totalDeleted) as unknown as number,
      generatedDms: increment(-totalDeleted) as unknown as number,
    });
    await autoDmTransaction.commit();
  }
};
