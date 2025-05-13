import {
  Button,
  Chip,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useNavigate } from 'react-router-dom';
// const ProjectDropdown = ({ user }: { user: SongjamUser }) => {
//   const [showAgentSettings, setShowAgentSettings] = useState(false);
//   const [projects, loadingProjects, errorProjects] = useCollection(
//     query(
//       collection(db, 'projects'),
//       where(documentId(), 'in', user.projectIds)
//     )
//   );
//   const [defaultProject, setDefaultProject] = useState<ProjectDoc | null>(null);

//   useEffect(() => {
//     if (projects?.docs.length) {
//       setDefaultProject(
//         (projects.docs
//           .find((doc) => doc.id === user.defaultProjectId)
//           ?.data() || projects.docs[0].data()) as ProjectDoc
//       );
//     }
//   }, [projects]);

//   if (loadingProjects) {
//     return (
//       <Skeleton
//         variant="rounded"
//         width={140}
//         height={32}
//         sx={{
//           bgcolor: 'rgba(255, 255, 255, 0.05)',
//           borderRadius: '16px',
//         }}
//       />
//     );
//   }
//   if (errorProjects) {
//     return <Typography>Error loading projects</Typography>;
//   }
//   if (projects?.docs.length === 0) {
//     return <Typography>No projects found</Typography>;
//   }
//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//       <Chip
//         label={defaultProject?.name}
//         sx={{
//           background: 'rgba(255, 255, 255, 0.05)',
//           backdropFilter: 'blur(10px)',
//           border: '1px solid rgba(255, 255, 255, 0.1)',
//           '&:hover': {
//             background: 'rgba(255, 255, 255, 0.1)',
//           },
//         }}
//         deleteIcon={<ExpandMoreRoundedIcon />}
//         onDelete={() => setShowAgentSettings(true)}
//       />
//       {defaultProject && (
//         <AgentSettingsDialog
//           open={showAgentSettings}
//           onClose={() => setShowAgentSettings(false)}
//           project={defaultProject}
//           onSave={() => {}}
//           onSwitchProject={(project: ProjectDoc) => setDefaultProject(project)}
//         />
//       )}
//     </Box>
//   );
// };

const LoginDisplayBtn = ({
  setShowAuthDialog,
}: {
  setShowAuthDialog: (show: boolean) => void;
}) => {
  const { user, loading } = useAuthContext();
  const { handleLogOut } = useDynamicContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
  if (user)
    return (
      <>
        <Chip
          label={user.email}
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          deleteIcon={<ExpandMoreRoundedIcon />}
          onDelete={handleClick}
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              marginTop: '8px',
              minWidth: '180px',
              '& .MuiMenuItem-root': {
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              navigate('/dashboard');
            }}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              navigate('/settings');
            }}
          >
            Settings
          </MenuItem>
          <MenuItem
            onClick={async () => {
              handleClose();
              await handleLogOut();
              window.location.reload();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </>
    );

  return (
    <Button variant="contained" onClick={() => setShowAuthDialog(true)}>
      Login
    </Button>
  );
};

export default LoginDisplayBtn;
