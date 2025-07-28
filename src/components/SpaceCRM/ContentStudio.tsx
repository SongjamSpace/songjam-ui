import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import SendIcon from '@mui/icons-material/Send';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { AI_MODELS, generateContent } from '../../services/ai.service';
import {
  getFullTranscription,
  getTweetSummary,
  TweetSummary,
} from '../../services/db/spaces.service';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

type ContentType = 'tweetSummary' | 'thread' | 'post' | 'reply' | 'dm';

// Mock data for templates
const CONTENT_TEMPLATES = {
  tweetSummary: [],
  thread: [
    {
      id: 't1',
      name: 'Key Insights Thread',
      prompt:
        'Create a thread with 5 key insights from the space discussion on [TOPIC]',
    },
    {
      id: 't2',
      name: 'Q&A Summary',
      prompt:
        'Summarize the Q&A session from the space in a concise thread with 7 tweets',
    },
    {
      id: 't3',
      name: 'Hot Takes',
      prompt:
        'Create a controversial but thoughtful thread with hot takes based on the discussion about [TOPIC]',
    },
  ],
  post: [
    {
      id: 'p1',
      name: 'Insight Highlight',
      prompt: 'Share the most insightful point from [SPEAKER] about [TOPIC]',
    },
    {
      id: 'p2',
      name: 'Quote Tweet',
      prompt:
        'Create a quote tweet highlighting what [SPEAKER] said about [TOPIC]',
    },
    {
      id: 'p3',
      name: 'Announcement',
      prompt: 'Announce the key outcome from the space discussion',
    },
  ],
  reply: [
    {
      id: 'r1',
      name: 'Thoughtful Response',
      prompt: 'Write a thoughtful response to [USER] who commented on [TOPIC]',
    },
    {
      id: 'r2',
      name: 'Add Context',
      prompt: "Add important context to [USER]'s comment about [TOPIC]",
    },
    {
      id: 'r3',
      name: 'Counterpoint',
      prompt: "Offer a respectful counterpoint to [USER]'s view on [TOPIC]",
    },
  ],
  dm: [
    {
      id: 'd1',
      name: 'Follow-up',
      prompt:
        'Send a follow-up DM to [USER] who asked about [TOPIC] during the space',
    },
    {
      id: 'd2',
      name: 'Connection Request',
      prompt:
        'Reach out to [USER] who showed interest in [TOPIC] to explore collaboration',
    },
    {
      id: 'd3',
      name: 'Resource Share',
      prompt:
        'Share additional resources with [USER] related to their question about [TOPIC]',
    },
  ],
};

/**
 * ContentStudio Component
 *
 * This component provides a workspace for creating and refining
 * content for posts, threads, replies, and DMs.
 */
const ContentStudio: React.FC<{ onBeforeAction: () => boolean }> = ({
  onBeforeAction,
}) => {
  const { t } = useTranslation();
  const { spaceId } = useParams<{ spaceId: string }>();
  const [contentType, setContentType] = useState<ContentType>('thread');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok');
  const [savedContent, setSavedContent] = useState<
    { id: string; title: string; content: string; type: ContentType }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [tweetSummary, setTweetSummary] = useState<TweetSummary | null>(null);

  const handleContentTypeChange = (
    _: React.SyntheticEvent,
    newValue: ContentType
  ) => {
    setContentType(newValue);
    setSelectedTemplateId('');
    setCustomPrompt('');
    setGeneratedContent('');
    setError(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = CONTENT_TEMPLATES[contentType].find(
      (t) => t.id === templateId
    );
    if (template) {
      setCustomPrompt(template.prompt);
      setGeneratedContent('');
      setError(null);
    }
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
  };

  const handleGenerate = async () => {
    if (!customPrompt.trim()) return;
    if (!onBeforeAction()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');

    try {
      let context = '';
      if (spaceId) {
        const transcription = await getFullTranscription(spaceId);
        if (transcription) {
          const currentLang = i18n.language;
          context = `You are an AI assistant helping create content for a Twitter Space. Please respond in ${
            currentLang === 'zh' ? 'Chinese' : 'English'
          }. Here's the transcription of the space:\n\n${transcription}\n\nPlease help create the following type of content: ${contentType}`;
        } else {
          const currentLang = i18n.language;
          context = `You are an AI assistant helping create content for a Twitter Space. Please respond in ${
            currentLang === 'zh' ? 'Chinese' : 'English'
          }. Please help create the following type of content: ${contentType}`;
        }
      }

      const response = await generateContent(
        selectedModel,
        customPrompt,
        context,
        (chunk) => {
          setGeneratedContent((prev) => prev + chunk);
        }
      );

      if (response.error) {
        setError(t('aiErrorAlert') + ': ' + response.error);
      }
    } catch (error: any) {
      setError(t('aiFailedError') + ': ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = () => {
    if (!generatedContent.trim()) return;

    const newContent = {
      id: `saved-${Date.now()}`,
      title: `${t(contentType + 'Tab')} - ${new Date().toLocaleString()}`,
      content: generatedContent,
      type: contentType,
    };

    setSavedContent([newContent, ...savedContent]);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const confirmChange = (action: () => void) => {
    if (generatedContent.trim()) {
      setShowSaveConfirm(true);
    } else {
      action();
    }
  };

  useEffect(() => {
    if (spaceId) {
      (async () => {
        const summary = await getTweetSummary(spaceId);
        if (summary) {
          setTweetSummary(summary);
          setContentType('tweetSummary');
        }
      })();
    }
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {t('contentStudioTitle')}
      </Typography>

      <Tabs
        value={contentType}
        onChange={handleContentTypeChange}
        sx={{ mb: 3 }}
      >
        {tweetSummary && (
          <Tab label={t('Tweet Summary')} value="tweetSummary" />
        )}
        <Tab label={t('threadTab')} value="thread" />
        <Tab label={t('postTab')} value="post" />
        <Tab label={t('replyTab')} value="reply" />
        <Tab label={t('dmTab')} value="dm" />
      </Tabs>

      {contentType == 'tweetSummary' ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Paper
              sx={{
                p: 4,
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background:
                    'linear-gradient(90deg, #60a5fa, #8b5cf6, #ec4899)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        tweetSummary?.status === 'SENT' ? '#10b981' : '#f59e0b',
                      boxShadow:
                        tweetSummary?.status === 'SENT'
                          ? '0 0 12px rgba(16, 185, 129, 0.5)'
                          : '0 0 12px rgba(245, 158, 11, 0.5)',
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {t('tweetSummaryTitle', 'Summary')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {tweetSummary?.tweetId && tweetSummary?.status === 'SENT' && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        window.open(
                          `https://x.com/i/status/${tweetSummary.tweetId}`,
                          '_blank'
                        );
                      }}
                      sx={{
                        borderColor: 'rgba(96, 165, 250, 0.4)',
                        color: 'primary.main',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(96, 165, 250, 0.1)',
                          borderColor: 'primary.main',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(96, 165, 250, 0.2)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {t('viewOnX', 'View on X')}
                    </Button>
                  )}
                  <Button
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                      if (tweetSummary?.tweet) {
                        navigator.clipboard.writeText(tweetSummary.tweet);
                      }
                    }}
                    sx={{
                      background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                      color: 'white',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                    title={t('copyTweetButton')}
                  >
                    {t('copyToClipboard', 'Copy to Clipboard')}
                  </Button>
                </Box>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  background:
                    'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'text.primary',
                    fontSize: '1.1rem',
                    fontWeight: 400,
                    letterSpacing: '0.2px',
                  }}
                >
                  {tweetSummary?.tweet || t('noTweetSummaryAvailable')}
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {t('templatesTitle')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {CONTENT_TEMPLATES[contentType].map((template) => (
                  <Chip
                    key={template.id}
                    label={template.name}
                    onClick={() => handleTemplateSelect(template.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1,
                      background:
                        selectedTemplateId === template.id
                          ? 'rgba(96, 165, 250, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        background: 'rgba(96, 165, 250, 0.1)',
                      },
                    }}
                  />
                ))}
                <Chip
                  icon={<AddIcon />}
                  label={t('createCustomTemplateButton')}
                  onClick={() => {}}
                  sx={{
                    justifyContent: 'flex-start',
                    px: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {t('savedContentTitle')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {savedContent.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.title}
                    onClick={() => setGeneratedContent(item.content)}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  />
                ))}
                {savedContent.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                  >
                    {t('noSavedContentYet')}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 2,
                mb: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1">
                  {t('customPromptTitle')}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2, display: 'block' }}
              >
                <HelpOutlineIcon
                  sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }}
                />
                {t('promptHelpText')}
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={t('customPromptPlaceholder')}
                value={customPrompt}
                onChange={handleCustomPromptChange}
                sx={{ mb: 2 }}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey &&
                    customPrompt.trim() &&
                    !isGenerating
                  ) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{t('selectModelLabel')}</InputLabel>
                  <Select
                    value={selectedModel}
                    label={t('selectModelLabel')}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    {AI_MODELS.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleGenerate}
                  disabled={isGenerating || !customPrompt.trim()}
                  sx={{
                    background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                  }}
                >
                  {isGenerating ? t('generatingButton') : t('generateButton')}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {t('generatedContentTitle')}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  minHeight: 200,
                  whiteSpace: 'pre-wrap',
                  bgcolor: 'rgba(0,0,0,0.1)',
                  overflowY: 'auto',
                }}
              >
                {generatedContent ||
                  (isGenerating
                    ? t('generatingProgressText')
                    : t('generatedContentPlaceholder'))}
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyContent}
                  disabled={!generatedContent.trim()}
                  title={t('copyButton')}
                >
                  {t('copyButton')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveContent}
                  disabled={!generatedContent.trim()}
                  title={t('saveButton')}
                >
                  {t('saveButton')}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={showSaveConfirm} onClose={() => setShowSaveConfirm(false)}>
        <DialogTitle>{t('saveContentPrompt')}</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSaveConfirm(false);
            }}
          >
            {t('discardConfirmButton')}
          </Button>
          <Button
            onClick={() => {
              handleSaveContent();
              setShowSaveConfirm(false);
            }}
            autoFocus
          >
            {t('saveConfirmButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentStudio;
