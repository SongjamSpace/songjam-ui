import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translation keys based on App.tsx
const translationEN = {
  accuracy: 'Accuracy',
  spacesNative: 'Spaces Native',
  settlement: 'Settlement',
  heroTitle1: 'Unlock Insights',
  heroTitle2: 'Amplify Voices',
  heroSubtitle1: 'X Spaces Text-to-Speech and AI Analysis',
  heroSubtitle2: 'Capture Every Conversation',
  spaceInputPlaceholder: 'Paste your X space URL here to try it now',
  analyzeButton: 'Analyze',
  tryPreviewButton: 'Try Preview',
  viewPricingButton: 'View Pricing',
  launchOfferTitle: 'Special Launch Offer - Only $1 USDT!',
  launchOfferText: 'Get full access to our AI-powered transcription service for just $1 USDT. Try it now with zero risk - preview the timeline before paying!',
  whatYouGetTitle: "✨ What You'll Get:",
  getDealFeature1: '1 x Full Space Transcription',
  getDealFeature2: '1 x AI-Powered Summary',
  getDealFeature3: 'Full Thread with 3 x Remixes',
  spaceInputPlaceholderDialog: 'Paste your X space URL here (e.g., x.com/i/spaces/123...)',
  getDealButton: 'Get Deal Now 🚀',
  noCommitment: 'No commitment required - Preview before you pay!',
  previewDialogTitle: '🔭 Preview Analyzed Spaces 🔭',
  previewDialogText1: 'Click on any space below to see an example of the analysis output.',
  previewDialogText2: 'Paste your own space URL on the homepage to try it!',
  availablePreviewsTitle: '🚀 Available Previews:',
  analyzedOn: 'Analyzed on',
  noPreviews: 'No completed spaces available for preview yet.',
  previewDialogText3: 'This is just a preview. Analyze your own space for full insights!',
  poweredBy: 'Powered by',
  // Add other App.tsx strings here...
  transcribeFeatureTitle: 'Transcribe',
  transcribeFeatureText: 'Converting your X Space audio into text makes it easy to analyze',
  transcribeFeatureDetail: 'Get your time back',
  analyzeFeatureTitle: 'Analyze',
  analyzeFeatureText: 'Unlock awesome insights from your X Spaces in seconds',
  analyzeFeatureDetail: 'Harness the power of AI',
  shareFeatureTitle: 'Share',
  shareFeatureText: 'Compile your insights and share with your audience',
  shareFeatureDetail: 'Infinitely customizable',
  howItWorksTitle: 'How It Works',
  step1Title: 'Connect Space',
  step1Text: 'Paste the URL of your live X Space',
  step2Title: 'Retrieve Listeners',
  step2Text: 'All listener X accounts will be retrieved',
  step3Title: 'Dive In',
  step3Text: 'Leverage LLMs to analyze the space',
  honorsTitle: 'Honors',
  honorsText: 'Songjam builders have won top awards from the following crypto leaders:',
  contactTitle: 'Contact Us',
  contactText: 'Got a beefy project or custom request? Drop us a line',
  namePlaceholder: 'Name',
  telegramPlaceholder: 'Telegram Username',
  telegramHelp: 'Must start with @',
  emailPlaceholder: 'Email',
  messagePlaceholder: 'How can we help?',
  submitButton: 'Submit',
  connectWithUsTitle: 'Connect With Us',
  productHunt: 'Product Hunt',
  github: 'GitHub',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  footerText: '© Songjam 2025. All rights reserved.',
  switchLanguage: '中文', // Text for the language switcher button when current language is English
};

const translationZH = {
  accuracy: '准确率',
  spacesNative: 'Spaces 原生',
  settlement: '结算',
  heroTitle1: '解锁洞见',
  heroTitle2: '放大声音',
  heroSubtitle1: 'X Spaces 语音转文本与 AI 分析',
  heroSubtitle2: '捕捉每一次对话',
  spaceInputPlaceholder: '在此处粘贴您的 X space URL 立即试用',
  analyzeButton: '分析',
  tryPreviewButton: '试用预览',
  viewPricingButton: '查看定价',
  launchOfferTitle: '🎉 特别启动优惠 - 仅需 1 USDT！🎉',
  launchOfferText: '仅需 1 USDT 即可完全访问我们的 AI 驱动转录服务。立即零风险试用 - 付款前预览时间线！',
  whatYouGetTitle: '✨ 您将获得：',
  getDealFeature1: '1 x 完整 Space 转录',
  getDealFeature2: '1 x AI 驱动摘要',
  getDealFeature3: '包含 3 x Remix 的完整 Thread',
  spaceInputPlaceholderDialog: '在此处粘贴您的 X space URL (例如 x.com/i/spaces/123...)',
  getDealButton: '立即获取优惠 🚀',
  noCommitment: '无需承诺 - 付款前预览！',
  previewDialogTitle: '🔭 预览已分析的空间 🔭',
  previewDialogText1: '点击下面的任何空间以查看分析输出示例。',
  previewDialogText2: '在主页粘贴您自己的空间 URL 进行尝试！',
  availablePreviewsTitle: '🚀 可用预览：',
  analyzedOn: '分析于',
  noPreviews: '暂无已完成的空间可供预览。',
  previewDialogText3: '这只是预览。分析您自己的空间以获取完整见解！',
  poweredBy: '技术支持',
  // Add other App.tsx strings here...
  transcribeFeatureTitle: '转录',
  transcribeFeatureText: '将您的 X Space 音频转换为文本，便于分析',
  transcribeFeatureDetail: '节省您的时间',
  analyzeFeatureTitle: '分析',
  analyzeFeatureText: '在几秒钟内从您的 X Spaces 中解锁精彩见解',
  analyzeFeatureDetail: '利用 AI 的力量',
  shareFeatureTitle: '分享',
  shareFeatureText: '整理您的见解并与您的受众分享',
  shareFeatureDetail: '无限可定制',
  howItWorksTitle: '运作方式',
  step1Title: '连接空间',
  step1Text: '粘贴您的实时 X Space 的 URL',
  step2Title: '检索听众',
  step2Text: '将检索所有听众的 X 帐户',
  step3Title: '深入了解',
  step3Text: '利用 LLM 分析空间',
  honorsTitle: '荣誉',
  honorsText: 'Songjam 构建者已赢得以下加密货币领导者的最高奖项：',
  contactTitle: '联系我们',
  contactText: '有大型项目或定制请求？给我们留言',
  namePlaceholder: '姓名',
  telegramPlaceholder: 'Telegram 用户名',
  telegramHelp: '必须以 @ 开头',
  emailPlaceholder: '电子邮件',
  messagePlaceholder: '我们能帮您什么？',
  submitButton: '提交',
  connectWithUsTitle: '联系我们',
  productHunt: 'Product Hunt',
  github: 'GitHub',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  footerText: '© Songjam 2025. 保留所有权利。',
  switchLanguage: 'English', // Text for the language switcher button when current language is Chinese
};

i18n
  // Detect user language
  // Learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  // For all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'en',
    detection: {
      // Order and from where user language should be detected
      order: ['path', 'navigator', 'htmlTag', 'localStorage', 'subdomain'],
      lookupFromPathIndex: 0,
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: {
      en: {
        translation: translationEN,
      },
      zh: {
        translation: translationZH,
      },
    },
  });

export default i18n; 