export const uploadAndNormalizeMusic = async (
  file: File,
  uid: string
): Promise<void> => {
  const baseUrl = import.meta.env.VITE_JAM_MUSIC_AGENT_URL;
  if (!baseUrl) {
    throw new Error('VITE_JAM_MUSIC_AGENT_URL is not set');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('uid', uid);

  await fetch(`${baseUrl}/normalize-upload`, {
    method: 'POST',
    body: formData,
  });
};
