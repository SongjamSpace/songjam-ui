import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
} from '@mui/material';
import { SpaceDoc } from '../../services/db/spaces.service';
import SpaceForm, { SpaceFormData } from './SpaceForm';
import { useState } from 'react';
import { createCampaign } from '../../services/db/campaign.service';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { extractSpaceId } from '../../utils';

type Props = {
  space?: SpaceDoc;
  isNew: boolean;
  onClose: () => void;
};

const AddCampaignDialog = ({ space, isNew, onClose }: Props) => {
  const [campaignType, setCampaignType] = useState<'speakers' | 'listeners'>(
    'speakers'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledStart, setScheduledStart] = useState<Date>(new Date());
  const [topics, setTopics] = useState<string[]>(['']);
  const [hostHandle, setHostHandle] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [spaceUrl, setSpaceUrl] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData: SpaceFormData) => {
    if (!user?.uid || !user?.defaultProjectId) return;
    setActionLoading(true);
    try {
      const campaign = await createCampaign({
        ctaType: 'space',
        ctaTarget: formData.title,
        spaceId: space?.id || extractSpaceId(spaceUrl) || '',
        spaceTitle: formData.title,
        projectId: user.defaultProjectId,
        userId: user.uid,
        status: 'DRAFT',
        createdAt: Date.now(),
        description: formData.description,
        topics: formData.topics,
        scheduledStart: space?.scheduledStart || 0,
        hostHandle: formData.hostHandle,
        addedType: 'NEW',
        campaignType: formData.campaignType,
      });
      if (campaign) {
        navigate(`/campaigns/${campaign.id}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2,
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(90deg, #60A5FA, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          Create New Campaign
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <SpaceForm
          space={space}
          spaceUrl={spaceUrl}
          setSpaceUrl={setSpaceUrl}
          onSubmit={handleSubmit}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          scheduledStart={scheduledStart}
          setScheduledStart={setScheduledStart}
          topics={topics}
          setTopics={setTopics}
          hostHandle={hostHandle}
          setHostHandle={setHostHandle}
          actionLoading={actionLoading}
          campaignType={campaignType}
          setCampaignType={setCampaignType}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCampaignDialog;
