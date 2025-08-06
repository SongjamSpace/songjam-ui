import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.service';

export const createGeocodingDoc = async (
  location: string,
  coordinates: {
    lat: number;
    lon: number;
    display_name: string;
    name: string;
    place_id: number;
    type: string;
  }
) => {
  const geocoding = await setDoc(
    doc(db, 'geocoding', location.toLocaleLowerCase()),
    {
      location,
      ...coordinates,
      createdAt: Date.now(),
    }
  );

  return geocoding;
};

export const createFailedGeocodingDoc = async (
  location: string,
  error?: string
) => {
  const geocoding = await setDoc(
    doc(db, 'geocoding', location.toLocaleLowerCase()),
    {
      location,
      invalid: true,
      error: error || 'Geocoding failed',
      createdAt: Date.now(),
    }
  );

  return geocoding;
};

export const getGeocodingDoc = async (location: string) => {
  const geocoding = await getDoc(
    doc(db, 'geocoding', location.toLocaleLowerCase())
  );
  return geocoding.data();
};
