
import Airtable from 'airtable';

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID!);

export const submitToAirtable = async (formData: {
  name: string;
  email: string;
  telegram: string;
  message: string;
}) => {
  try {
    const result = await base(process.env.AIRTABLE_TABLE_NAME!).create([
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
