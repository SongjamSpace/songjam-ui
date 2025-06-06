import { getDownloadURL } from 'firebase/storage';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase.service';

export const uploadMusic = async (file: File, id: string) => {
  const storageRef = ref(storage, `dj/${id}.mp3`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
