
import Airtable from 'airtable';

const base = new Airtable({apiKey: import.meta.env.VITE_AIRTABLE_API_KEY}).base(import.meta.env.VITE_AIRTABLE_BASE_ID!);

export const submitToAirtable = async (formData: {
  name: string;
  email: string;
  telegram: string;
  message: string;
}) => {
  try {
    const result = await base(import.meta.env.VITE_AIRTABLE_TABLE_NAME!).create([
      {
        fields: {
          Name: formData.name,
          Email: formData.email,
          Telegram: formData.telegram,
          Message: formData.message,
          'Submission Date': new Date().toISOString()
        }
      }
    ]);
    return result;
  } catch (error) {
    console.error('Airtable submission error:', error);
    throw error;
  }
};
