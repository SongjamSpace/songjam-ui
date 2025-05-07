import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  IconButton,
  Paper,
} from '@mui/material';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SpaceDoc, TwitterUser } from '../services/db/spaces.service';
import { LoadingButton } from '@mui/lab';

export interface SpaceFormData {
  title: string;
  description?: string;
  scheduledStart: Date;
  topics: string[];
  hostHandle: string;
}

interface SpaceFormProps {
  space?: SpaceDoc;
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
}

const SpaceForm: React.FC<SpaceFormProps> = ({
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
}: SpaceFormProps) => {
  const [spaceUrl, setSpaceUrl] = useState('');
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
    if (!scheduledStart) return;

    onSubmit({
      title,
      description,
      scheduledStart,
      topics: topics.filter((item) => item.trim() !== ''),
      hostHandle,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <TextField
        label="Scheduled space url"
        value={spaceUrl}
        onChange={(e) => setSpaceUrl(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Typography variant="body2" sx={{ mb: 2 }} textAlign="center">
        Or
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Host"
            value={hostHandle}
            onChange={(e) => setHostHandle(e.target.value)}
            fullWidth
            required
            placeholder="@twitterhandle"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
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
            <Typography variant="h6" gutterBottom>
              Topics
            </Typography>
            <List>
              {topics.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <TextField
                    value={item}
                    onChange={(e) => handleAgendaChange(index, e.target.value)}
                    fullWidth
                    placeholder="Enter topic"
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
            >
              Add Agenda Item
            </Button>
          </Box>

          {speakers && speakers.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Existing Speakers
              </Typography>
              <List>
                {speakers.map((speaker, index) => (
                  <ListItem key={index}>
                    <Typography>
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
            Source Speakers
          </LoadingButton>
        </Box>
      </form>
    </Paper>
  );
};

export default SpaceForm;
