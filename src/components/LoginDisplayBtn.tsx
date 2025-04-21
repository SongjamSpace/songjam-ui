import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../services/firebase.service';
import { collection, documentId, query, where } from 'firebase/firestore';
import { Project, ProjectDoc } from '../services/db/projects.service';
import { SongjamUser } from '../services/db/user.service';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useEffect, useState } from 'react';
import AgentSettingsDialog from './AgentSettingsDialog';

const ProjectDropdown = ({ user }: { user: SongjamUser }) => {
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [projects, loadingProjects, errorProjects] = useCollection(
    query(
      collection(db, 'projects'),
      where(documentId(), 'in', user.projectIds)
    )
  );
  const [defaultProject, setDefaultProject] = useState<ProjectDoc | null>(null);

  useEffect(() => {
    if (projects?.docs.length) {
      setDefaultProject(
        (projects.docs
          .find((doc) => doc.id === user.defaultProjectId)
          ?.data() || projects.docs[0].data()) as ProjectDoc
      );
    }
  }, [projects]);

  if (loadingProjects) {
    return (
      <Skeleton
        variant="rounded"
        width={140}
        height={32}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
        }}
      />
    );
  }
  if (errorProjects) {
    return <Typography>Error loading projects</Typography>;
  }
  if (projects?.docs.length === 0) {
    return <Typography>No projects found</Typography>;
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={defaultProject?.name}
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        deleteIcon={<ExpandMoreRoundedIcon />}
        onDelete={() => setShowAgentSettings(true)}
      />
      {defaultProject && (
        <AgentSettingsDialog
          open={showAgentSettings}
          onClose={() => setShowAgentSettings(false)}
          project={defaultProject}
          onSave={() => {}}
          onSwitchProject={(project: ProjectDoc) => setDefaultProject(project)}
        />
      )}
    </Box>
  );
};

const LoginDisplayBtn = ({
  setShowAuthDialog,
}: {
  setShowAuthDialog: (show: boolean) => void;
}) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        width={140}
        height={32}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
        }}
      />
    );
  }
  /* Project Name and Settings */
  if (user) return <ProjectDropdown user={user} />;

  return (
    <Button variant="contained" onClick={() => setShowAuthDialog(true)}>
      Login
    </Button>
  );
};

export default LoginDisplayBtn;
