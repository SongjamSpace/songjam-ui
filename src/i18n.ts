import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useTranslation } from 'react-i18next';

// --- English Translations ---

const appTranslationsEN = {
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
  launchOfferText:
    'Get full access to our AI-powered transcription service for just $1 USDT. Try it now with zero risk - preview the timeline before paying!',
  whatYouGetTitle: "✨ What You'll Get:",
  getDealFeature1: '1 x Full Space Transcription',
  getDealFeature2: '1 x AI-Powered Summary',
  getDealFeature3: 'Full Thread with 3 x Remixes',
  spaceInputPlaceholderDialog:
    'Paste your X space URL here (e.g., x.com/i/spaces/123...)',
  getDealButton: 'Get Deal Now 🚀',
  noCommitment: 'No commitment required - Preview before you pay!',
  previewDialogTitle: '🔭 Preview Analyzed Spaces 🔭',
  previewDialogText1:
    'Click on any space below to see an example of the analysis output.',
  previewDialogText2: 'Paste your own space URL on the homepage to try it!',
  availablePreviewsTitle: '🚀 Available Previews:',
  analyzedOn: 'Analyzed on',
  noPreviews: 'No completed spaces available for preview yet.',
  previewDialogText3:
    'This is just a preview. Analyze your own space for full insights!',
  poweredBy: 'Powered by',
  transcribeFeatureTitle: 'Transcribe',
  transcribeFeatureText:
    'Converting your X Space audio into text makes it easy to analyze',
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
  honorsText:
    'Songjam builders have won top awards from the following crypto leaders:',
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
  switchLanguage: '中文',
  processingSpaceTitle: 'Processing Space',
  processingSpaceMessage:
    'We are processing the space and will redirect you shortly.',
  spaceDetails: 'Space Details',
  liveSpaceTitle: 'Live Space',
  liveSpaceMessage:
    'Setting up the live Twitter agent and redirecting you shortly.',
  recordedSpaceTitle: 'Recorded Space',
  recordedSpaceMessage: 'Retrieving space data and redirecting you shortly.',
  scheduledSpaceTitle: 'Schedule Space',
  scheduledSpaceMessage: 'We are scheduling the space, please wait.',
};

const crmTranslationsEN = {
  agenticCRM: 'Agentic CRM',
  audienceTab: 'Audience',
  contentTab: 'Content',
  timelineTab: 'Timeline',
  transcriptionTab: 'Transcription',
  listenerRetentionTab: 'Listener Retention',
  betaChip: 'Beta',
  queuedChip: 'Queued',
  analyzingChip: 'Analyzing...',
  quickStatsTitle: 'Quick Stats',
  attendeesStat: 'Participants',
  durationStat: 'Duration',
  minStat: 'min',
  createCampaignButton: 'Create Campaign',
  transcriptTimelineTitle: 'Transcript Timeline',
  fullTranscriptionTitle: 'Full Transcription & Search',
  downloadRecordingButton: 'Download Recording',
  downloadingButton: 'Downloading...',
  aiAssistantTitle: 'AI Assistant',
  selectModelLabel: 'Select Model',
  aiPlaceholder: 'Ask the AI assistant...',
  thinkingAI: 'Thinking...',
  askAnythingAI:
    'Ask me anything about this space or how to engage with the audience!',
  quickActionsTitle: 'Quick Actions',
  summarizeSpaceChip: 'Summarize Space',
  createThreadChip: 'Create Thread',
  engagementIdeasChip: 'Engagement Ideas',
  mobileSidebarTitle: 'X Space CRM',
  askAIButton: 'Ask AI',
  authDialogTitle: 'Welcome to Songjam',
  authDialogText:
    'Connect your Twitter account to access Space analytics, audience insights, and AI-powered tools.',
  listenersLabel: 'listeners',
  noListenerData: 'No listener data available',
};

const audiencePanelTranslationsEN = {
  audienceMgmtTitle: 'Audience Management',
  engagementLabel: 'Engagement',
  allLevels: 'All Levels',
  highEngagement: 'High',
  mediumEngagement: 'Medium',
  lowEngagement: 'Low',
  speakersTab: 'Speakers',
  listenersTab: 'Listeners',
  searchPlaceholder: 'Search speakers/listeners...',
  filtersTitle: 'Filter {{tabName}}',
  engagementLevelLabel: 'Engagement Level',
  followerCountLabel: 'Follower Count',
  allSizes: 'All Sizes',
  largeFollowers: 'Large (5000+)',
  mediumFollowers: 'Medium (1000-5000)',
  smallFollowers: 'Small (<1000)',
  locationLabel: 'Location',
  allLocations: 'All Locations',
  interestsLabel: 'Interests',
  clearAllButton: 'Clear All',
  applyFiltersButton: 'Apply Filters',
  speakersFound: '{{count}} speaker found',
  speakersFound_plural: '{{count}} speakers found',
  listenersFound: '{{count}} listener found',
  listenersFound_plural: '{{count}} listeners found',
};

const contentStudioTranslationsEN = {
  contentStudioTitle: 'Content Studio',
  threadTab: 'Thread',
  postTab: 'Post',
  replyTab: 'Reply',
  dmTab: 'DM',
  templatesTitle: 'Templates',
  customPromptTitle: 'Custom Prompt',
  promptHelpText:
    "Use placeholders like [TOPIC] or [SPEAKER] to refine the AI's focus.",
  selectModelLabel: 'Select Model',
  generateButton: 'Generate',
  generatingButton: 'Generating...',
  generatedContentTitle: 'Generated Content',
  copyButton: 'Copy',
  saveButton: 'Save',
  savedContentTitle: 'Saved Content',
  saveContentPrompt: 'You have unsaved content. Save it first?',
  saveConfirmButton: 'Save & Create New',
  discardConfirmButton: 'Discard & Create New',
  cancelButton: 'Cancel',
  aiErrorAlert: 'AI Error',
  aiFailedError: 'Failed to generate content',
  createCustomTemplateButton: 'Create custom template',
  noSavedContentYet: 'No saved content yet',
  customPromptPlaceholder: 'Enter your custom prompt or modify a template...',
  generatingProgressText: 'Generating...',
  generatedContentPlaceholder: 'Your generated content will appear here.',
};

const spaceAnalysisTranslationsEN = {
  loadingAnalysis: 'Loading analysis...',
  generatingAnalysis: 'Generating analysis...',
  errorGeneratingAnalysis: 'Error generating analysis:',
  noAnalysisData: 'No analysis data available. Please generate the analysis.',
  interactionGraphTab: 'Interaction Graph',
  topicsTab: 'Topics',
  analysisSettingsTab: 'Analysis Settings',
  topicsTitle: 'Topics',
  keyInsightsTitle: 'Key Insights',
  analysisSettingsTitle: 'Analysis Settings',
  interactionDetailsTitle: 'Interaction Details',
  generateAnalysisButton: 'Generate Analysis',
  updateAnalysisButton: 'Update Analysis',
  closeButton: 'Close',
  selectTopicLabel: 'Select Topic',
  allTopicsOption: 'All Topics',
  interactionTypesLabel: 'Interaction Types',
  strengthMetricsLabel: 'Strength Metrics',
  timeWindowLabel: 'Time Window (s)',
  topicOverlapThresholdLabel: 'Topic Overlap Threshold',
  directMentionsConfig: 'Direct Mentions',
  sequentialResponsesConfig: 'Sequential Responses',
  topicBasedConfig: 'Topic Based',
  timeProximityConfig: 'Time Proximity',
  frequencyConfig: 'Frequency',
  durationConfig: 'Duration',
  topicOverlapConfig: 'Topic Overlap',
  sentimentConfig: 'Sentiment',
  responseTimeConfig: 'Response Time',
  modalFromLabel: 'From:',
  modalToLabel: 'To:',
  modalTypeLabel: 'Type:',
  modalSentimentLabel: 'Sentiment:',
  modalTimestampLabel: 'Timestamp:',
  modalStrengthLabel: 'Strength:',
  modalUtterancesLabel: 'Key Utterances:',
  analysisConfigHelpTitle: 'Help: Analysis Configuration',
  analysisConfigHelpText:
    'Configure how speaker interactions and their strength are calculated. Hover over options for more details. Regenerate analysis after changing settings.',
  mostActiveSpeakerStat: 'Most Active Speaker',
  avgInteractionsStat: 'Avg. Interactions',
  totalConnectionsStat: 'Total Connections',
  noInteractionsForTopic: 'No interactions found for this topic.',
  noTopicsFound: 'No topics found in the analysis.',
};

// --- Chinese Translations ---

const appTranslationsZH = {
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
  launchOfferText:
    '仅需 1 USDT 即可完全访问我们的 AI 驱动转录服务。立即零风险试用 - 付款前预览时间线！',
  whatYouGetTitle: '✨ 您将获得：',
  getDealFeature1: '1 x 完整 Space 转录',
  getDealFeature2: '1 x AI 驱动摘要',
  getDealFeature3: '包含 3 x Remix 的完整 Thread',
  spaceInputPlaceholderDialog:
    '在此处粘贴您的 X space URL (例如 x.com/i/spaces/123...)',
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
  switchLanguage: 'English',
  processingSpaceTitle: '处理中',
  processingSpaceMessage: '我们正在处理空间，稍后将重定向您。',
  spaceDetails: '空间详情',
  liveSpaceTitle: '直播空间',
  liveSpaceMessage: '正在设置实时 Twitter 代理，稍后将重定向您。',
  recordedSpaceTitle: '已录制空间',
  recordedSpaceMessage: '正在检索空间数据，稍后将重定向您。',
  scheduledSpaceTitle: '预定空间',
  scheduledSpaceMessage: '我们正在预定空间，请稍候。',
};

const crmTranslationsZH = {
  agenticCRM: '智能 CRM',
  audienceTab: '听众',
  contentTab: '内容',
  timelineTab: '时间线',
  transcriptionTab: '文字记录',
  listenerRetentionTab: '听众留存',
  betaChip: '测试版',
  queuedChip: '排队中',
  analyzingChip: '分析中...',
  quickStatsTitle: '快速统计',
  attendeesStat: '参与者',
  durationStat: '持续时间',
  minStat: '分钟',
  createCampaignButton: '创建活动',
  transcriptTimelineTitle: '文字记录时间线',
  fullTranscriptionTitle: '完整文字记录与搜索',
  downloadRecordingButton: '下载录音',
  downloadingButton: '下载中...',
  aiAssistantTitle: 'AI 助手',
  selectModelLabel: '选择模型',
  aiPlaceholder: '询问 AI 助手...',
  thinkingAI: '思考中...',
  askAnythingAI: '向我询问有关此空间或如何与听众互动的任何问题！',
  quickActionsTitle: '快捷操作',
  summarizeSpaceChip: '总结空间',
  createThreadChip: '创建推文串',
  engagementIdeasChip: '互动建议',
  mobileSidebarTitle: 'X Space CRM',
  askAIButton: '询问 AI',
  authDialogTitle: '欢迎来到 Songjam',
  authDialogText:
    '连接您的 Twitter 帐户以访问空间分析、听众洞察和 AI 驱动的工具。',
  listenersLabel: '听众',
  noListenerData: '无可用听众数据',
};

const audiencePanelTranslationsZH = {
  audienceMgmtTitle: '听众管理',
  engagementLabel: '互动程度',
  allLevels: '所有级别',
  highEngagement: '高',
  mediumEngagement: '中',
  lowEngagement: '低',
  speakersTab: '发言者',
  listenersTab: '听众',
  searchPlaceholder: '搜索发言者/听众...',
  filtersTitle: '筛选 {{tabName}}',
  engagementLevelLabel: '互动级别',
  followerCountLabel: '粉丝数',
  allSizes: '所有规模',
  largeFollowers: '多 (5000+)',
  mediumFollowers: '中 (1000-5000)',
  smallFollowers: '少 (<1000)',
  locationLabel: '地点',
  allLocations: '所有地点',
  interestsLabel: '兴趣',
  clearAllButton: '清除全部',
  applyFiltersButton: '应用筛选',
  speakersFound: '找到 {{count}} 位发言者',
  speakersFound_plural: '找到 {{count}} 位发言者',
  listenersFound: '找到 {{count}} 位听众',
  listenersFound_plural: '找到 {{count}} 位听众',
};

const contentStudioTranslationsZH = {
  contentStudioTitle: '内容工作室',
  threadTab: '推文串',
  postTab: '帖子',
  replyTab: '回复',
  dmTab: '私信',
  templatesTitle: '模板',
  customPromptTitle: '自定义提示',
  promptHelpText: '使用像 [主题] 或 [发言人] 这样的占位符来优化 AI 的焦点。',
  selectModelLabel: '选择模型',
  generateButton: '生成',
  generatingButton: '生成中...',
  generatedContentTitle: '生成的内容',
  copyButton: '复制',
  saveButton: '保存',
  savedContentTitle: '已保存的内容',
  saveContentPrompt: '您有未保存的内容。要先保存吗？',
  saveConfirmButton: '保存并新建',
  discardConfirmButton: '放弃并新建',
  cancelButton: '取消',
  aiErrorAlert: 'AI 错误',
  aiFailedError: '生成内容失败',
  createCustomTemplateButton: '创建自定义模板',
  noSavedContentYet: '尚无已保存内容',
  customPromptPlaceholder: '输入您的自定义提示或修改模板...',
  generatingProgressText: '生成中...',
  generatedContentPlaceholder: '您生成的内容将显示在此处。',
};

const spaceAnalysisTranslationsZH = {
  loadingAnalysis: '正在加载分析...',
  generatingAnalysis: '正在生成分析...',
  errorGeneratingAnalysis: '生成分析时出错：',
  noAnalysisData: '无可用分析数据。请生成分析。',
  interactionGraphTab: '互动图谱',
  topicsTab: '话题',
  analysisSettingsTab: '分析设置',
  topicsTitle: '话题',
  keyInsightsTitle: '关键洞察',
  analysisSettingsTitle: '分析设置',
  interactionDetailsTitle: '互动详情',
  generateAnalysisButton: '生成分析',
  updateAnalysisButton: '更新分析',
  closeButton: '关闭',
  selectTopicLabel: '选择话题',
  allTopicsOption: '所有话题',
  interactionTypesLabel: '互动类型',
  strengthMetricsLabel: '强度指标',
  timeWindowLabel: '时间窗口 (秒)',
  topicOverlapThresholdLabel: '话题重叠阈值',
  directMentionsConfig: '直接提及',
  sequentialResponsesConfig: '顺序回应',
  topicBasedConfig: '基于话题',
  timeProximityConfig: '时间邻近性',
  frequencyConfig: '频率',
  durationConfig: '持续时间',
  topicOverlapConfig: '话题重叠',
  sentimentConfig: '情感',
  responseTimeConfig: '响应时间',
  modalFromLabel: '来自：',
  modalToLabel: '至：',
  modalTypeLabel: '类型：',
  modalSentimentLabel: '情感：',
  modalTimestampLabel: '时间戳：',
  modalStrengthLabel: '强度：',
  modalUtterancesLabel: '关键话语：',
  analysisConfigHelpTitle: '帮助：分析配置',
  analysisConfigHelpText:
    '配置发言者互动及其强度的计算方式。将鼠标悬停在选项上可查看更多详细信息。更改设置后重新生成分析。',
  mostActiveSpeakerStat: '最活跃发言者',
  avgInteractionsStat: '平均互动数',
  totalConnectionsStat: '总连接数',
  noInteractionsForTopic: '未找到此话题的互动。',
  noTopicsFound: '分析中未找到话题。',
};

// --- Merge Resources ---
const enResources = {
  ...appTranslationsEN,
  ...crmTranslationsEN,
  ...audiencePanelTranslationsEN,
  ...contentStudioTranslationsEN,
  ...spaceAnalysisTranslationsEN,
};

const zhResources = {
  ...appTranslationsZH,
  ...crmTranslationsZH,
  ...audiencePanelTranslationsZH,
  ...contentStudioTranslationsZH,
  ...spaceAnalysisTranslationsZH,
};

// --- i18next Initialization ---
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'en',
    detection: {
      order: ['path', 'navigator', 'htmlTag', 'localStorage', 'subdomain'],
      lookupFromPathIndex: 0,
    },
    interpolation: {
      escapeValue: false, // React already protects from xss
    },
    resources: {
      en: {
        translation: enResources, // Use merged resources
      },
      zh: {
        translation: zhResources, // Use merged resources
      },
    },
  });

// --- Remove post-initialization calls ---
// The following lines are no longer needed as resources are passed during init:
// i18n.addResourceBundle('en', 'translation', crmTranslationsEN, true, true);
// i18n.addResourceBundle('zh', 'translation', crmTranslationsZH, true, true);
// i18n.addResourceBundle('en', 'translation', audiencePanelTranslationsEN, true, true);
// i18n.addResourceBundle('zh', 'translation', audiencePanelTranslationsZH, true, true);
// i18n.addResourceBundle('en', 'translation', contentStudioTranslationsEN, true, true);
// i18n.addResourceBundle('zh', 'translation', contentStudioTranslationsZH, true, true);
// i18n.addResourceBundle('en', 'translation', spaceAnalysisTranslationsEN, true, true);
// i18n.addResourceBundle('zh', 'translation', spaceAnalysisTranslationsZH, true, true);

export default i18n;
