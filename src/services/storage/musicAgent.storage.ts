import { getDownloadURL } from 'firebase/storage';
import { ref, uploadBytes, listAll } from 'firebase/storage';
import { storage } from '../firebase.service';

export const uploadMusic = async (file: File, uid: string) => {
  const storageRef = ref(storage, `music-agent-uploads/${uid}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const getMusicUploadsByUserId = async (
  uid: string
): Promise<{ name: string; audioUrl: string }[]> => {
  const storageRef = ref(storage, `music-agent-uploads/${uid}`);
  const list = await listAll(storageRef);
  // get the name of the file
  const names = list.items.map((item) => item.name);
  const urls = await Promise.all(
    list.items.map(async (item) => await getDownloadURL(item))
  );
  return names.map((name, index) => ({ name, audioUrl: urls[index] }));
};
