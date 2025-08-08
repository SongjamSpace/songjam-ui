import { deleteObject, getDownloadURL } from 'firebase/storage';
import { ref, uploadBytes, listAll } from 'firebase/storage';
import { storage } from '../firebase.service';

export const uploadSoundboardFile = async (file: File, uid: string) => {
  const storageRef = ref(storage, `soundboard-uploads/${uid}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const getSoundboardFilesByUserId = async (
  uid: string
): Promise<{ name: string; audioUrl: string }[]> => {
  const storageRef = ref(storage, `soundboard-uploads/${uid}`);
  const list = await listAll(storageRef);
  // get the name of the file
  const names = list.items.map((item) => item.name);
  const urls = await Promise.all(
    list.items.map(async (item) => await getDownloadURL(item))
  );
  return names.map((name, index) => ({ name, audioUrl: urls[index] }));
};

export const deleteSoundboardFile = async (fileName: string, uid: string) => {
  const storageRef = ref(storage, `soundboard-uploads/${uid}/${fileName}`);
  await deleteObject(storageRef);
};
