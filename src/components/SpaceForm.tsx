import React, { useState, useEffect } from 'react';
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
import { Space, TwitterUser } from '../services/db/spaces.service';

interface SpaceFormProps {
  space?: Space;
  onSubmit: (formData: SpaceFormData) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  agenda: string[];
  setAgenda: (agenda: string[]) => void;
  scheduledStart: Date;
  setScheduledStart: (scheduledStart: Date) => void;
  speakers: TwitterUser[];
  setSpeakers: (speakers: TwitterUser[]) => void;
}

export interface SpaceFormData {
  title: string;
  description?: string;
  scheduledStart: Date;
  agenda: string[];
  speakers: TwitterUser[];
}

const SpaceForm: React.FC<SpaceFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  agenda,
  setAgenda,
  scheduledStart,
  setScheduledStart,
  speakers,
  setSpeakers,
  onSubmit,
}) => {
  const handleAgendaChange = (index: number, value: string) => {
    const newAgenda = [...agenda];
    newAgenda[index] = value;
    setAgenda(newAgenda);
  };

  const addAgendaItem = () => {
    setAgenda([...agenda, '']);
  };

  const removeAgendaItem = (index: number) => {
    const newAgenda = agenda.filter((_, i) => i !== index);
    setAgenda(newAgenda);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledStart) return;

    onSubmit({
      title,
      description,
      scheduledStart,
      agenda: agenda.filter((item) => item.trim() !== ''),
      speakers,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
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
            label="Description (Optional)"
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
              Agenda List
            </Typography>
            <List>
              {agenda.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <TextField
                    value={item}
                    onChange={(e) => handleAgendaChange(index, e.target.value)}
                    fullWidth
                    placeholder="Enter agenda item"
                  />
                  <IconButton
                    onClick={() => removeAgendaItem(index)}
                    disabled={agenda.length === 1}
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

          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            sx={{ mt: 2 }}
          >
            Source Speakers
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SpaceForm;
