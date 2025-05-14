import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  IconButton,
  Paper,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  FormControlLabel,
  Stack,
  CircularProgress,
} from '@mui/material';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SpaceDoc, TwitterUser } from '../../services/db/spaces.service';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { extractSpaceId } from '../../utils';
import SearchIcon from '@mui/icons-material/Search';

export interface SpaceFormData {
  title: string;
  description?: string;
  scheduledStart: Date;
  topics: string[];
  hostHandle: string;
  campaignType: 'speakers' | 'listeners';
}

interface SpaceFormProps {
  onSubmit: (formData: SpaceFormData) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  scheduledStart: Date;
  setScheduledStart: (scheduledStart: Date) => void;
  speakers?: TwitterUser[];

  topics: string[];
  setTopics: Dispatch<SetStateAction<string[]>>;
  hostHandle: string;
  setHostHandle: (hostHandle: string) => void;
  actionLoading: boolean;
  campaignType: 'speakers' | 'listeners';
  setCampaignType: (campaignType: 'speakers' | 'listeners') => void;
  spaceUrl: string;
  setSpaceUrl: (spaceUrl: string) => void;
}

const SpaceForm: React.FC<SpaceFormProps> = ({
  campaignType,
  setCampaignType,
  title,
  setTitle,
  description,
  setDescription,
  scheduledStart,
  setScheduledStart,
  speakers,
  onSubmit,
  topics,
  setTopics,
  hostHandle,
  setHostHandle,
  actionLoading,
  spaceUrl,
  setSpaceUrl,
}: SpaceFormProps) => {
  const [isSpaceLoading, setIsSpaceLoading] = useState(false);

  const handleAgendaChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const addAgendaItem = () => {
    setTopics([...topics, '']);
  };

  const removeAgendaItem = (index: number) => {
    const newTopics = topics.filter((_, i) => i !== index);
    setTopics(newTopics);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      scheduledStart,
      topics: topics.filter((item) => item.trim() !== ''),
      hostHandle,
      campaignType,
    });
  };

  const fetchSpace = async (_url: string) => {
    const spaceId = extractSpaceId(_url);
    if (!spaceId) return;
    setIsSpaceLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_JAM_SERVER_URL}/get-space/${spaceId}`
      );
      if (res.data.result) {
        const metadata = res.data.result.metadata;
        const participants = res.data.result.participants;
        setTitle(metadata.title);
        setScheduledStart(new Date(metadata.scheduled_start));
        setTopics(metadata.topics.map((t: any) => t.topic.name));
        setHostHandle('@' + participants.admins[0].twitter_screen_name);
      }
    } catch (error) {
      // TODO: handle error
    } finally {
      setIsSpaceLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 800,
        mx: 'auto',
        mt: 3,
        bgcolor: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* <Stack sx={{ mb: 4 }}>
        <Typography gutterBottom sx={{ color: 'white', mb: 2 }}>
          Campaign Type
        </Typography>
        <RadioGroup
          value={campaignType}
          onChange={(e) =>
            setCampaignType(e.target.value as 'speakers' | 'listeners')
          }
          sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
        >
          <FormControlLabel
            value="speakers"
            control={<Radio />}
            label="Find Speakers"
            sx={{
              // flex: 1,
              ml: 0,
              bgcolor:
                campaignType === 'speakers'
                  ? 'rgba(96, 165, 250, 0.1)'
                  : 'transparent',
              px: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor:
                campaignType === 'speakers'
                  ? 'primary.main'
                  : 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(96, 165, 250, 0.05)',
              },
            }}
          />
          <FormControlLabel
            value="listeners"
            control={<Radio />}
            label="Invite Listeners"
            sx={{
              // flex: 1,
              bgcolor:
                campaignType === 'listeners'
                  ? 'rgba(96, 165, 250, 0.1)'
                  : 'transparent',
              px: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor:
                campaignType === 'listeners'
                  ? 'primary.main'
                  : 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(96, 165, 250, 0.05)',
              },
            }}
          />
        </RadioGroup>
      </Stack> */}
      <form onSubmit={handleSubmit}>
        {/* {campaignType === 'listeners' && ( */}
        <TextField
          label="Scheduled Space URL"
          value={spaceUrl}
          onChange={async (e) => {
            setSpaceUrl(e.target.value);
            if (e.target.value.trim()) {
              await fetchSpace(e.target.value);
            }
          }}
          fullWidth
          required={campaignType === 'listeners'}
          sx={{ mb: 3 }}
          size="small"
          InputProps={{
            endAdornment: isSpaceLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SearchIcon />
            ),
          }}
        />
        {/* )} */}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            size="small"
            // disabled={campaignType === 'listeners'}
          />
          <TextField
            label="Host"
            value={hostHandle}
            onChange={(e) => setHostHandle(e.target.value)}
            fullWidth
            required
            placeholder="@twitterhandle"
            size="small"
            // disabled={campaignType === 'listeners'}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            size="small"
          />

          {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
          {/* <DateTimePicker
            label="Date and Time"
            value={scheduledStart}
            onChange={(newValue) => setScheduledStart(newValue)}
            sx={{ width: '100%' }}
          /> */}
          {/* </LocalizationProvider> */}

          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Topics
            </Typography>
            <List>
              {topics.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <TextField
                    size="small"
                    value={item}
                    onChange={(e) => handleAgendaChange(index, e.target.value)}
                    fullWidth
                    placeholder="Enter topic"
                    // disabled={campaignType === 'listeners'}
                  />
                  <IconButton
                    onClick={() => removeAgendaItem(index)}
                    disabled={topics.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <Button
              startIcon={<AddIcon />}
              onClick={addAgendaItem}
              sx={{ mt: 1 }}
              disabled={topics.length === 3}
            >
              Add Topic
            </Button>
          </Box>

          {speakers && speakers.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                Existing Speakers
              </Typography>
              <List>
                {speakers.map((speaker, index) => (
                  <ListItem key={index}>
                    <Typography sx={{ color: 'white' }}>
                      {speaker.displayName} (@{speaker.twitterScreenName})
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <LoadingButton
            loading={actionLoading}
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            sx={{ mt: 2 }}
          >
            {campaignType === 'speakers'
              ? 'Source Speakers'
              : 'Generate Listener DMs'}
          </LoadingButton>
        </Box>
      </form>
    </Paper>
  );
};

export default SpaceForm;
