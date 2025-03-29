import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { AI_MODELS, generateContent } from '../../services/ai.service';
import { getFullTranscription } from '../../services/db/spaces.service';
import { useParams } from 'react-router-dom';

type ContentType = 'thread' | 'post' | 'reply' | 'dm';

// Mock data for templates
const CONTENT_TEMPLATES = {
  thread: [
    { id: 't1', name: 'Key Insights Thread', prompt: 'Create a thread with 5 key insights from the space discussion on [TOPIC]' },
    { id: 't2', name: 'Q&A Summary', prompt: 'Summarize the Q&A session from the space in a concise thread with 7 tweets' },
    { id: 't3', name: 'Hot Takes', prompt: 'Create a controversial but thoughtful thread with hot takes based on the discussion about [TOPIC]' },
  ],
  post: [
    { id: 'p1', name: 'Insight Highlight', prompt: 'Share the most insightful point from [SPEAKER] about [TOPIC]' },
    { id: 'p2', name: 'Quote Tweet', prompt: 'Create a quote tweet highlighting what [SPEAKER] said about [TOPIC]' },
    { id: 'p3', name: 'Announcement', prompt: 'Announce the key outcome from the space discussion' },
  ],
  reply: [
    { id: 'r1', name: 'Thoughtful Response', prompt: 'Write a thoughtful response to [USER] who commented on [TOPIC]' },
    { id: 'r2', name: 'Add Context', prompt: 'Add important context to [USER]\'s comment about [TOPIC]' },
    { id: 'r3', name: 'Counterpoint', prompt: 'Offer a respectful counterpoint to [USER]\'s view on [TOPIC]' },
  ],
  dm: [
    { id: 'd1', name: 'Follow-up', prompt: 'Send a follow-up DM to [USER] who asked about [TOPIC] during the space' },
    { id: 'd2', name: 'Connection Request', prompt: 'Reach out to [USER] who showed interest in [TOPIC] to explore collaboration' },
    { id: 'd3', name: 'Resource Share', prompt: 'Share additional resources with [USER] related to their question about [TOPIC]' },
  ],
};

/**
 * ContentStudio Component
 * 
 * This component provides a workspace for creating and refining
 * content for posts, threads, replies, and DMs.
 */
const ContentStudio: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [contentType, setContentType] = useState<ContentType>('thread');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok');
  const [savedContent, setSavedContent] = useState<{ id: string; title: string; content: string; type: ContentType }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleContentTypeChange = (_: React.SyntheticEvent, newValue: ContentType) => {
    setContentType(newValue);
    setSelectedTemplateId('');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = CONTENT_TEMPLATES[contentType].find(t => t.id === templateId);
    if (template) {
      setCustomPrompt(template.prompt);
    }
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
  };

  const handleGenerate = async () => {
    if (!customPrompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedContent(''); // Clear previous content
    
    try {
      // Get space transcription for context
      let context = '';
      if (spaceId) {
        const transcription = await getFullTranscription(spaceId);
        if (transcription) {
          context = `You are an AI assistant helping create content for a Twitter Space. Here's the transcription of the space:\n\n${transcription}\n\nPlease help create the following type of content: ${contentType}`;
        }
      }
      
      const response = await generateContent(
        selectedModel, 
        customPrompt, 
        context,
        (chunk) => {
          setGeneratedContent(prev => prev + chunk);
        }
      );
      
      if (response.error) {
        setError(response.error);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = () => {
    if (!generatedContent.trim()) return;
    
    const newContent = {
      id: `saved-${Date.now()}`,
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} - ${new Date().toLocaleString()}`,
      content: generatedContent,
      type: contentType,
    };
    
    setSavedContent([newContent, ...savedContent]);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    // Would typically show a toast notification here
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Content Studio</Typography>
      
      <Tabs 
        value={contentType} 
        onChange={handleContentTypeChange}
        sx={{ mb: 3 }}
      >
        <Tab label="Thread" value="thread" />
        <Tab label="Post" value="post" />
        <Tab label="Reply" value="reply" />
        <Tab label="DM" value="dm" />
      </Tabs>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 2, 
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Templates</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {CONTENT_TEMPLATES[contentType].map((template) => (
                <Chip
                  key={template.id}
                  label={template.name}
                  onClick={() => handleTemplateSelect(template.id)}
                  sx={{ 
                    justifyContent: 'flex-start',
                    px: 1,
                    background: selectedTemplateId === template.id 
                      ? 'rgba(96, 165, 250, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                      background: 'rgba(96, 165, 250, 0.1)',
                    }
                  }}
                />
              ))}
              <Chip
                icon={<AddIcon />}
                label="Create custom template"
                onClick={() => {}}
                sx={{ 
                  justifyContent: 'flex-start',
                  px: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Saved Content</Typography>
            
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
                    }
                  }}
                />
              ))}
              {savedContent.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No saved content yet
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 2, 
            mb: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Generation Prompt</Typography>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>AI Model</InputLabel>
                <Select
                  value={selectedModel}
                  label="AI Model"
                  onChange={(e) => setSelectedModel(e.target.value)}
                  size="small"
                >
                  {AI_MODELS.map(model => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={`Write a prompt for the AI to generate a ${contentType}...`}
              value={customPrompt}
              onChange={handleCustomPromptChange}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                startIcon={<AutoFixHighIcon />}
                onClick={handleGenerate}
                disabled={isGenerating || !customPrompt.trim()}
                sx={{ 
                  background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </Button>
              
              <IconButton size="small" title="Prompt tips">
                <HelpOutlineIcon />
              </IconButton>
            </Box>
          </Paper>
          
          <Paper sx={{ 
            p: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Generated Content</Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={handleCopyContent}
                  disabled={!generatedContent}
                  title="Copy to clipboard"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  onClick={handleSaveContent}
                  disabled={!generatedContent}
                  title="Save content"
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="Generated content will appear here..."
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<AutoFixHighIcon />}
                onClick={() => {}}
                disabled={!generatedContent}
              >
                Refine
              </Button>
              
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => {}}
                disabled={!generatedContent}
                sx={{ 
                  background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)', 
                }}
              >
                Publish
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContentStudio; 