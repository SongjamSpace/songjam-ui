import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.service";

export const getSpace = async (spaceId: string) => {
  const docRef = doc(db, "spaces", spaceId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};
