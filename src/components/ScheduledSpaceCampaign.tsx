import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Space, TwitterUser } from '../services/db/spaces.service';
import SpaceForm, { SpaceFormData } from './SpaceForm';
import { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SourceSpeakers from './SourceSpeakers';

type Props = {
  space?: Space;
  isNew: boolean;
};

const ScheduledSpaceCampaign = ({ space, isNew }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  const [title, setTitle] = useState(space?.title || '');
  const [description, setDescription] = useState('');
  const [scheduledStart, setScheduledStart] = useState<Date | null>(
    space?.scheduledStart ? new Date(space.scheduledStart) : new Date()
  );
  const [agenda, setAgenda] = useState<string[]>(['']);
  const [speakers, setSpeakers] = useState<TwitterUser[]>(
    space?.speakers || []
  );

  useEffect(() => {
    if (space) {
      setTitle(space.title);
      setScheduledStart(
        space.scheduledStart ? new Date(space.scheduledStart) : new Date()
      );
      setSpeakers(space.speakers);
    }
  }, [space]);
  const handleSubmit = (formData: SpaceFormData) => {
    // Handle the form submission
    console.log(formData);
    setCurrentStep(currentStep + 1);
  };

  return (
    <Dialog open={true} onClose={() => {}} fullWidth>
      <DialogTitle>Create Campaign</DialogTitle>
      <DialogContent>
        {currentStep > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setCurrentStep(currentStep - 1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">{title}</Typography>
          </Box>
        )}
        {currentStep === 0 && (
          <SpaceForm
            onSubmit={handleSubmit}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            agenda={agenda}
            setAgenda={setAgenda}
            scheduledStart={scheduledStart || new Date()}
            setScheduledStart={setScheduledStart}
            speakers={speakers}
            setSpeakers={setSpeakers}
          />
        )}
        {currentStep === 1 && <SourceSpeakers />}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduledSpaceCampaign;
