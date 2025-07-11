import { SongjamUser } from '../services/db/user.service';

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
  const match = url.match(/\/i\/(?:spaces|broadcasts)\/([a-zA-Z0-9]+)/);
  return match?.[1];
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
    case 'starter':
      return { spaces: 64, aiAssistantRequests: 100, autoDms: 250 };
    case 'pro':
      return { spaces: Infinity, aiAssistantRequests: 200, autoDms: Infinity };
    case 'business':
      return { spaces: Infinity, aiAssistantRequests: 2000, autoDms: Infinity };
    default:
      return { spaces: 16, aiAssistantRequests: 50, autoDms: 10 };
  }
};

export const canRequestSpace = (user: SongjamUser) => {
  const planLimits = getPlanLimits(user.currentPlan);
  return user.usage.spaces < planLimits.spaces;
};

export const canRequestAutoDms = (user: SongjamUser) => {
  const planLimits = getPlanLimits(user.currentPlan);
  return user.usage.autoDms < planLimits.autoDms;
};

export const canRequestAiAssistant = (user: SongjamUser) => {
  const planLimits = getPlanLimits(user.currentPlan);
  return user.usage.aiAssistantRequests < planLimits.aiAssistantRequests;
};
