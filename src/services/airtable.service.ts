
import Airtable from 'airtable';

const airtable = new Airtable({apiKey: import.meta.env.VITE_AIRTABLE_API_KEY});
const base = airtable.base(import.meta.env.VITE_AIRTABLE_BASE_ID);

interface FormData {
  name: string;
  email: string;
  telegram: string;
  message: string;
}

export const submitToAirtable = async (formData: FormData) => {
  try {
    const result = await base(import.meta.env.VITE_AIRTABLE_TABLE_NAME).create([
      {
        fields: {
          Name: formData.name,
          Email: formData.email,
          Telegram: formData.telegram,
          Message: formData.message,
          Timestamp: new Date().toISOString()
        }
      }
    ]);
    return result;
  } catch (error) {
    console.error('Airtable submission error:', error);
    throw error;
  }
};
