import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase.service";

export type DjInstance = {
    spaceId: string;
    userId: string;
    username: string;
    socketId: string;
}
const DJ_COLLECTION_NAME = "djInstances";

export const createDjInstance = async (obj: DjInstance) => {
    await setDoc(doc(collection(db, DJ_COLLECTION_NAME), obj.socketId), {
        spaceId: obj.spaceId,
        userId: obj.userId,
        username: obj.username,
        createdDateTime: serverTimestamp(),
        socketId: obj.socketId,
    })
}