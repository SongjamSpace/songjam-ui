import axios from 'axios';
import { getSpace } from './db/spaces.service';
import { useNavigate } from 'react-router-dom';

export const transcribeSpace = async (spaceUrl: string) => {
  // Extract space ID from URL
  const spaceId = spaceUrl.split('/').pop();

  if (!spaceId) {
    throw new Error('Invalid space URL');
  }

  // Check if space already exists
  const space = await getSpace(spaceId);

  if (space) {
    // Space exists, navigate to it
    window.location.href = `/${spaceId}`;
    return;
  }

  // Space doesn't exist, request transcription
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_JAM_SERVER_URL}/transcribe-recorded-space`,
      { spaceId }
    );

    if (res.data.status === 'success') {
      window.location.href = `/${spaceId}`;
    } else {
      throw new Error('Transcription failed');
    }
  } catch (error) {
    console.error('Error transcribing space:', error);
    throw new Error('Failed to transcribe the space. Please try again later.');
  }
};
