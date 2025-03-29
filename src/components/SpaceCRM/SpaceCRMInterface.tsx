import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Chip,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import ForumIcon from '@mui/icons-material/Forum';
import MessageIcon from '@mui/icons-material/Message';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SendIcon from '@mui/icons-material/Send';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Mock data for development
const MOCK_ATTENDEES = Array(20).fill(null).map((_, i) => ({
  id: `user${i}`,
  username: `user${i}`,
  displayName: `User ${i}`,
  profileImage: `https://i.pravatar.cc/150?u=${i}`,
  bio: `Professional in the field of ${['AI', 'Marketing', 'Design', 'Development', 'Business'][i % 5]}`,
  followersCount: Math.floor(Math.random() * 10000),
  engagement: {
    inSpaceComments: Math.floor(Math.random() * 10),
    likedPosts: Math.floor(Math.random() * 50),
    recentInteractions: Math.floor(Math.random() * 5),
  },
  interests: ['AI', 'Web3', 'Marketing', 'Technology'].slice(0, Math.floor(Math.random() * 4) + 1),
  recentPosts: Array(3).fill(null).map((_, j) => ({
    content: `This is post ${j} about ${['AI', 'Marketing', 'Technology'][j % 3]}`,
    engagement: Math.floor(Math.random() * 100),
    timestamp: new Date(Date.now() - j * 86400000).toISOString(),
  })),
}));

const AI_MODELS = [
  {
    id: 'claude',
    name: 'Claude',
    capabilities: ['Long context', 'Creative writing', 'Detailed analysis'],
    contextWindow: 200000,
    specialFeatures: ['Code generation', 'Document analysis'],
  },
  {
    id: 'grok',
    name: 'Grok',
    capabilities: ['Real-time data', 'Technical analysis', 'Interactive learning'],
    contextWindow: 50000,
    specialFeatures: ['Web browsing', 'Data visualization'],
  },
];

type CRMTab = 'audience' | 'content' | 'engagement' | 'analytics';

/**
 * SpaceCRMInterface Component
 * 
 * This is the main interface for the Space CRM functionality.
 * It extends the existing SpaceDetails component with advanced CRM capabilities.
 */
const SpaceCRMInterface: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [activeTab, setActiveTab] = useState<CRMTab>('audience');
  const [selectedModel, setSelectedModel] = useState('claude');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  
  // Filter states
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  
  // Handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: CRMTab) => {
    setActiveTab(newValue);
  };
  
  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModel(event.target.value as string);
  };
  
  const handlePromptSubmit = () => {
    // This would integrate with the AI model API
    console.log(`Sending prompt to ${selectedModel}: ${aiPrompt}`);
    setAiPrompt('');
  };
  
  const handleAttendeeSelect = (attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };
  
  // Filter the attendees based on current filters
  const filteredAttendees = MOCK_ATTENDEES.filter(attendee => {
    // Filter by engagement level
    if (filterEngagement === 'high' && attendee.engagement.recentInteractions < 3) return false;
    if (filterEngagement === 'medium' && 
        (attendee.engagement.recentInteractions < 1 || attendee.engagement.recentInteractions > 3)) return false;
    if (filterEngagement === 'low' && attendee.engagement.recentInteractions > 1) return false;
    
    // Filter by interests
    if (filterInterests.length > 0 && 
        !filterInterests.some(interest => attendee.interests.includes(interest))) return false;
    
    return true;
  });

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
      {/* LEFT PANEL - Space Info & Navigation */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ 
          p: 2, 
          height: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Space #{spaceId}</Typography>
          
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderRight: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab 
              icon={<PeopleIcon />} 
              label="Audience" 
              value="audience" 
              sx={{ alignItems: 'flex-start', textAlign: 'left', pl: 0 }} 
            />
            <Tab 
              icon={<ForumIcon />} 
              label="Content Studio" 
              value="content" 
              sx={{ alignItems: 'flex-start', textAlign: 'left', pl: 0 }} 
            />
            <Tab 
              icon={<MessageIcon />} 
              label="Engagement" 
              value="engagement" 
              sx={{ alignItems: 'flex-start', textAlign: 'left', pl: 0 }} 
            />
            <Tab 
              icon={<InsightsIcon />} 
              label="Analytics" 
              value="analytics" 
              sx={{ alignItems: 'flex-start', textAlign: 'left', pl: 0 }} 
            />
          </Tabs>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Stats</Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2">Attendees: 153</Typography>
            <Typography variant="body2">Potential Reach: 425K</Typography>
            <Typography variant="body2">Engagement Rate: 3.2%</Typography>
          </Box>
          
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
            }}
          >
            Create Campaign
          </Button>
        </Paper>
      </Grid>
      
      {/* CENTER PANEL - Main Content */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ 
          p: 2, 
          height: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {activeTab === 'audience' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Audience Management</Typography>
                <Box>
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                  <FormControl size="small" sx={{ minWidth: 120, ml: 1 }}>
                    <InputLabel>Engagement</InputLabel>
                    <Select
                      value={filterEngagement}
                      label="Engagement"
                      onChange={(e) => setFilterEngagement(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                minHeight: 0
              }}>
                <List>
                  {filteredAttendees.map((attendee) => (
                    <ListItem 
                      key={attendee.id}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleAttendeeSelect(attendee.id)}>
                          {selectedAttendees.includes(attendee.id) ? (
                            <BookmarkIcon color="primary" />
                          ) : (
                            <BookmarkIcon />
                          )}
                        </IconButton>
                      }
                      sx={{
                        mb: 1, 
                        borderRadius: 1,
                        bgcolor: selectedAttendees.includes(attendee.id) 
                          ? 'rgba(96, 165, 250, 0.1)' 
                          : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          badgeContent={attendee.engagement.recentInteractions}
                          color={
                            attendee.engagement.recentInteractions > 3 
                              ? "success" 
                              : attendee.engagement.recentInteractions > 0 
                                ? "primary" 
                                : "default"
                          }
                        >
                          <Avatar src={attendee.profileImage} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">{attendee.displayName}</Typography>
                            <Typography variant="caption" sx={{ ml: 1, color: 'gray' }}>
                              @{attendee.username}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ color: 'gray' }}>
                              {attendee.bio}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {attendee.interests.map(interest => (
                                <Chip 
                                  key={interest} 
                                  label={interest} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(96, 165, 250, 0.1)',
                                    color: '#60a5fa',
                                    fontSize: '0.7rem',
                                  }} 
                                />
                              ))}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
          
          {activeTab === 'content' && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Content Studio</Typography>
              {/* Content Studio UI would go here */}
              <Typography variant="body2" color="text.secondary">
                Create and manage content based on space insights
              </Typography>
            </>
          )}
          
          {activeTab === 'engagement' && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Engagement Hub</Typography>
              {/* Engagement Hub UI would go here */}
              <Typography variant="body2" color="text.secondary">
                Manage interactions with space attendees
              </Typography>
            </>
          )}
          
          {activeTab === 'analytics' && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Analytics Dashboard</Typography>
              {/* Analytics Dashboard UI would go here */}
              <Typography variant="body2" color="text.secondary">
                Track performance metrics for your space and content
              </Typography>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* RIGHT PANEL - AI Assistant */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ 
          p: 2, 
          height: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>AI Assistant</Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Model</InputLabel>
            <Select
              value={selectedModel}
              label="Select Model"
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {AI_MODELS.map(model => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ 
            flex: 1, 
            mb: 2, 
            bgcolor: 'rgba(0, 0, 0, 0.2)', 
            borderRadius: 1,
            p: 1,
            overflowY: 'auto',
            minHeight: 0
          }}>
            <Typography variant="body2" sx={{ color: 'gray', fontStyle: 'italic' }}>
              AI conversation history will appear here
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            mt: 'auto'
          }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask the AI assistant..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              sx={{ mr: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={handlePromptSubmit}
              sx={{ 
                bgcolor: 'rgba(96, 165, 250, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(96, 165, 250, 0.3)',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Actions</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="Summarize Space" 
              size="small" 
              onClick={() => {}} 
              icon={<AutorenewIcon sx={{ fontSize: 16 }} />} 
            />
            <Chip 
              label="Create Thread" 
              size="small" 
              onClick={() => {}} 
              icon={<ForumIcon sx={{ fontSize: 16 }} />} 
            />
            <Chip 
              label="Engagement Ideas" 
              size="small" 
              onClick={() => {}} 
              icon={<LocalOfferIcon sx={{ fontSize: 16 }} />} 
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SpaceCRMInterface; 