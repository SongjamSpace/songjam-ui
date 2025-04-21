export const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${Math.floor(remainingSeconds)
    .toString()
    .padStart(2, '0')}`;
};
const publicDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'gmx.com',
  'mail.com',
];
export const isCustomDomain = (domain: string) =>
  !publicDomains.includes(domain);
