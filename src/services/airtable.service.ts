
import Airtable from 'airtable';

interface FormData {
  name: string;
  email: string;
  telegram: string;
  message: string;
}

export const submitToAirtable = async (formData: FormData) => {
  if (!import.meta.env.VITE_AIRTABLE_API_KEY) {
    throw new Error('Airtable API key is missing');
  }
  
  if (!import.meta.env.VITE_AIRTABLE_BASE_ID) {
    throw new Error('Airtable base ID is missing');
  }

  if (!import.meta.env.VITE_AIRTABLE_TABLE_NAME) {
    throw new Error('Airtable table name is missing');
  }

  const base = new Airtable({ 
    apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
    endpointUrl: 'https://api.airtable.com'
  }).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

  try {
    const result = await base(import.meta.env.VITE_AIRTABLE_TABLE_NAME).create([
      {
        fields: {
          Name: formData.name,
          Email: formData.email,
          Telegram: formData.telegram,
          Message: formData.message,
          timestamp: new Date().toISOString()
        }
      }
    ]);
    return result;
  } catch (error: any) {
    if (error.error === 'NOT_AUTHORIZED') {
      throw new Error('Invalid Airtable API key or permissions');
    }
    throw new Error(error.message || 'Failed to submit to Airtable');
  }
};
