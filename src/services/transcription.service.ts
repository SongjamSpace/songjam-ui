import axios from 'axios';
import { getSpace } from './db/spaces.service';

export const transcribeSpace = async (
  spaceId: string,
  projectId: string,
  isBroadcast = false
) => {
  // Check if space already exists
  const space = await getSpace(spaceId);

  if (space) {
    return `/crm/${spaceId}`;
  }

  // Space doesn't exist, request transcription
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_JAM_SERVER_URL}/transcribe-recorded-space`,
      { spaceId, isBroadcast, projectId }
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

export const transcribePy = async (hlsUrl: string, spaceId: string) => {
  const formData = new FormData();
  formData.append('hls_url', hlsUrl);
  formData.append('space_id', spaceId);
  await axios.post(
    `${import.meta.env.VITE_JAM_PY_SERVER_URL}/transcribe`,
    formData
  );
};
