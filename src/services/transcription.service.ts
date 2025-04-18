import axios from 'axios';
import { getSpace } from './db/spaces.service';

export const transcribeSpace = async (spaceId: string) => {
  // Check if space already exists
  const space = await getSpace(spaceId);

  if (space) {
    return `/crm/${spaceId}`;
  }

  // Space doesn't exist, request transcription
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_JAM_SERVER_URL}/transcribe-recorded-space`,
      { spaceId }
    );

    if (res.data.status === 'success') {
      return `/crm/${spaceId}`;
    } else {
      throw new Error('Transcription failed');
    }
  } catch (error) {
    console.error('Error transcribing space:', error);
    throw new Error('Failed to analyze the space. Please try again later.');
  }
};
