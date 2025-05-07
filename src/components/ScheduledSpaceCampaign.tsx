import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { SpaceDoc } from '../services/db/spaces.service';
import SpaceForm, { SpaceFormData } from './SpaceForm';
import { useEffect, useState } from 'react';
import { createCampaign } from '../services/db/campaign.service';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type Props = {
  space?: SpaceDoc;
  isNew: boolean;
};

const ScheduledSpaceCampaign = ({ space, isNew }: Props) => {
  const { user } = useAuth();

  const [title, setTitle] = useState(space?.title || '');
  const [description, setDescription] = useState('');
  const [scheduledStart, setScheduledStart] = useState<Date | null>(
    space?.scheduledStart ? new Date(space.scheduledStart) : new Date()
  );
  const [topics, setTopics] = useState<string[]>(['']);
  const [hostHandle, setHostHandle] = useState('');
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (space) {
      setTitle(space.title);
      setScheduledStart(
        space.scheduledStart ? new Date(space.scheduledStart) : new Date()
      );
    }
  }, [space]);

  const handleSubmit = async (formData: SpaceFormData) => {
    // Handle the form submission
    console.log(formData);
    setActionLoading(true);
    const campaign = await createCampaign({
      ctaType: 'space',
      ctaTarget: title,
      spaceId: space?.id || '',
      spaceTitle: title,
      projectId: user?.defaultProjectId || '',
      userId: user?.uid || '',
      status: 'DRAFT',
      addedType: 'NEW',
      createdAt: Date.now(),
      topics,
      hostHandle,
      description,
    });
    navigate(`/campaigns/${campaign.id}`);
  };

  return (
    <Dialog open={true} onClose={() => {}} fullWidth>
      <DialogTitle>Create Campaign</DialogTitle>
      <DialogContent>
        <SpaceForm
          onSubmit={handleSubmit}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          topics={topics}
          setTopics={setTopics}
          scheduledStart={scheduledStart || new Date()}
          setScheduledStart={setScheduledStart}
          speakers={space?.speakers}
          hostHandle={hostHandle}
          setHostHandle={setHostHandle}
          actionLoading={actionLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ScheduledSpaceCampaign;
