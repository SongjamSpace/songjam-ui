import React, { useState } from 'react';
// import { AirtableRecord } from './types'; // Assuming this type definition exists elsewhere

// const Airtable = require("airtable");
import Airtable from 'airtable';

const airtable = new Airtable({
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
}).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

const submitToAirtable = async (formData: AirtableRecord) => {
  await airtable(import.meta.env.VITE_AIRTABLE_TABLE_NAME).create([
    { fields: { ...formData, timestamp: new Date().toISOString() } },
  ]);
};

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitToAirtable(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', telegram: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="telegram">Telegram:</label>
        <input
          type="text"
          id="telegram"
          name="telegram"
          value={formData.telegram}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Submit</button>
      {submitStatus === 'success' && <p>Form submitted successfully!</p>}
      {submitStatus === 'error' && (
        <p>Error submitting form. Please try again.</p>
      )}
    </form>
  );
};

export default ContactForm;

// Dummy type definition - replace with your actual type
type AirtableRecord = {
  name: string;
  email: string;
  telegram: string;
  message: string;
};
