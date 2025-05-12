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

export const extractSpaceId = (url: string) => {
  if (!url) return '';
  const match = url.match(/(?:spaces|broadcasts)\/([a-zA-Z0-9]+)/);
  return match?.[1] || url.split('/').pop();
};

export const getDynamicToken = () => {
  const token = localStorage.getItem('dynamic_authentication_token');
  if (!token) {
    return null;
  }
  return JSON.parse(token);
};

export const getPlanLimits = (plan: string) => {
  switch (plan) {
    case 'pro':
      return { transcriptionRequests: 100, aiAssistantRequests: 200 };
    case 'business':
      return { transcriptionRequests: 500, aiAssistantRequests: 1000 };
    case 'enterprise':
      return { transcriptionRequests: 1000, aiAssistantRequests: 2000 };
    default:
      return { transcriptionRequests: 30, aiAssistantRequests: 50 };
  }
};
