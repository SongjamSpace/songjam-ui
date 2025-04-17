import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import {
  acceptProjectInvite,
  rejectProjectInvite,
  addMemberToProject,
  getProjectMembers,
  Project,
  ProjectDoc,
  ProjectMember,
  removeUserFromMembers,
  getProjectsByIds,
  createProject,
} from '../services/db/projects.service';
import {
  addProjectToUser,
  updateUserDefaultProjectId,
} from '../services/db/user.service';
import axios from 'axios';
import {
  createProjectInvite,
  getProjectInvitesFromEmail,
  ProjectInvite,
} from '../services/db/projectInvites.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface AgentSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  project: ProjectDoc;
  onSave: (project?: Partial<Project>) => void;
  onSwitchProject: (project: ProjectDoc) => void;
}

export default function AgentSettingsDialog({
  open,
  onClose,
  project,
  onSave,
  onSwitchProject,
}: AgentSettingsDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'viewer'>('admin');
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const { user } = useAuth();
  const [projectInvites, setProjectInvites] = useState<ProjectInvite[]>([]);
  const [userProjects, setUserProjects] = useState<ProjectDoc[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [removeLoadingFor, setRemoveLoadingFor] = useState<string>('');
  const { handleLogOut } = useDynamicContext();

  const handleSave = async () => {
    if (!name || !project) {
      return;
    }
    setIsLoading(true);
    await onSave({
      name,
    });
    await refresh();
    setIsLoading(false);
    onClose();
  };

  const handleInviteMember = async () => {
    if (
      members.map((m) => m.email).includes(memberEmail) ||
      isInviting ||
      !project
    )
      return;
    setIsInviting(true);
    // TODO: Implement member invitation logic
    console.log('Inviting member:', { email: memberEmail, role: memberRole });
    const isNew = await createProjectInvite(
      project.id,
      project.name,
      memberEmail,
      {
        email: user?.email || '',
        userId: user?.uid || '',
      }
    );
    if (!isNew) {
      setIsInviting(false);
      toast.error(t('memberAlreadyInvited', 'Member already invited'));
      return;
    }
    await axios.post(
      `${import.meta.env.VITE_JAM_SERVER_URL}/send-invite-email`,
      {
        email: memberEmail,
        projectName: project.name,
      }
    );
    await addMemberToProject(project.id, {
      email: memberEmail,
      role: memberRole,
      isPending: true,
      isAccepted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: null,
    });
    setMemberEmail('');
    toast.success(t('memberInvited', 'Member invited'));
    setIsInviting(false);
    await fetchMembers(project.id);
  };
  const fetchMembers = async (projectId: string) => {
    const members = await getProjectMembers(projectId);
    setMembers(members);
    setIsAdmin(
      members.some(
        (m) =>
          m.email === user?.email &&
          (m.role === 'admin' || m.role === 'creator')
      )
    );
  };
  const fetchProjectInvites = async () => {
    if (user?.email) {
      const invites = await getProjectInvitesFromEmail(user.email);
      setProjectInvites(invites as ProjectInvite[]);
    }
  };
  const fetchUserProjects = async () => {
    if (user && user.projectIds) {
      const projects = await getProjectsByIds(user.projectIds);
      setUserProjects(projects);
    }
  };
  const refresh = async () => {
    await fetchMembers(project.id);
    await fetchProjectInvites();
    await fetchUserProjects();
  };

  useEffect(() => {
    if (open) {
      if (projectInvites.length === 0) {
        fetchProjectInvites();
      }
      if (userProjects.length === 0) {
        fetchUserProjects();
      }
    }
  }, [project, open, members, projectInvites, userProjects]);

  useEffect(() => {
    if (open && project) {
      fetchMembers(project.id);
    }
  }, [project, open]);

  // const handleDefaultOrgChange = async (orgId: string) => {
  //   if (!user?.uid || isSwitchingOrg) return;
  //   setIsSwitchingOrg(true);
  //   try {
  //     await updateUserOrgId(user.uid, orgId);
  //     toast.success(t('defaultOrgChanged', 'Default organization changed'));
  //     onClose();
  //   } catch (error) {
  //     console.error('Error changing default organization:', error);
  //     toast.error(
  //       t('defaultOrgChangeError', 'Error changing default organization')
  //     );
  //   } finally {
  //     setIsSwitchingOrg(false);
  //   }
  // };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (project) {
          onClose();
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box display="flex" gap={2} alignItems="center">
            <Typography variant="h6">
              {t('projectSettings', 'Project Settings')}
            </Typography>
            <Select
              size="small"
              color="info"
              value={project.id}
              onChange={async (e) => {
                if (!user?.uid) {
                  return;
                }
                const _project = userProjects.find(
                  (p) => p.id === e.target.value
                );
                if (_project) {
                  onSwitchProject(_project);
                  await fetchMembers(_project.id);
                }
                // await updateUserDefaultProjectId(
                //   user?.uid || '',
                //   e.target.value
                // );
                // await refresh();
              }}
            >
              {userProjects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
            {project.id !== user?.defaultProjectId && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ ml: 'auto' }}
                onClick={async () => {
                  if (!user?.uid) {
                    return;
                  }
                  await updateUserDefaultProjectId(user.uid, project.id);
                }}
              >
                Set as Default
              </Button>
            )}
          </Box>

          <Typography variant="subtitle2" color="text.secondary">
            {t('accessSpaces', 'Access all your spaces in one place')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} mt={2}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              label={t('projectName', 'Project Name')}
              value={name === null ? project.name : name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              variant="outlined"
              color="info"
              disabled={!isAdmin}
              size="small"
            />
            <LoadingButton
              loading={isLoading}
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={!name}
            >
              {t('save', 'Save')}
            </LoadingButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">{t('members', 'Members')}</Typography>

          <Box sx={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {t('email', 'Email')}
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {t('role', 'Role')}
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {t('status', 'Status')}
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {t('actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.email}>
                    <td style={{ padding: '8px' }}>{m.email}</td>
                    <td
                      style={{
                        padding: '8px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {m.role}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {m.isPending ? (
                        <HourglassEmptyRoundedIcon />
                      ) : (
                        <DoneRoundedIcon />
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <LoadingButton
                        loading={removeLoadingFor === m.email}
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={async () => {
                          setRemoveLoadingFor(m.email);
                          await removeUserFromMembers(
                            m.email,
                            project.id,
                            m.userId || ''
                          );
                          await fetchMembers(project.id);
                          setRemoveLoadingFor('');
                        }}
                        disabled={
                          user?.email === m.email || m.role === 'creator'
                        }
                      >
                        {t('remove', 'Remove')}
                      </LoadingButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {isAdmin && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                {t('inviteNewMember', 'Invite New Member')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label={t('email', 'Email')}
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  fullWidth
                  variant="outlined"
                  color="info"
                  size="small"
                  sx={{ flexBasis: '50%' }}
                />
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel color="info">{t('role', 'Role')}</InputLabel>
                  <Select
                    value={memberRole}
                    color="info"
                    label={t('role', 'Role')}
                    onChange={(e) =>
                      setMemberRole(e.target.value as 'admin' | 'viewer')
                    }
                  >
                    <MenuItem value="admin">{t('admin', 'Admin')}</MenuItem>
                    <MenuItem value="viewer">{t('viewer', 'Viewer')}</MenuItem>
                  </Select>
                </FormControl>
                <LoadingButton
                  loading={isInviting}
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={handleInviteMember}
                  disabled={!memberEmail}
                  sx={{ flexBasis: '20%' }}
                >
                  {t('invite', 'Invite')}
                </LoadingButton>
              </Box>
            </Box>
          )}

          {projectInvites.length > 0 && (
            <Stack gap={2} mt={2}>
              <Typography variant="h6">
                {t('pendingInvites', 'Pending Invites')}
              </Typography>
              {projectInvites.length === 0 && (
                <Typography variant="subtitle2" color="text.secondary">
                  {t('noPendingInvites', 'No pending invites')}
                </Typography>
              )}
              {projectInvites.map((invite) => (
                <Box
                  key={invite.projectId}
                  display="flex"
                  gap={2}
                  alignItems="center"
                >
                  <Typography variant="body1">{invite.projectName}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      if (!user?.uid) {
                        return;
                      }
                      await rejectProjectInvite(invite, user.uid);
                      await refresh();
                    }}
                  >
                    {t('decline', 'Decline')}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={async () => {
                      if (!user?.uid) {
                        return;
                      }
                      await acceptProjectInvite(invite, user.uid);
                      await refresh();
                    }}
                  >
                    {t('accept', 'Accept')}
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await handleLogOut();
            window.location.reload();
            setIsLoading(false);
          }}
          variant="contained"
          color="info"
          sx={{ mx: 'auto', px: 4 }}
        >
          {t('logout', 'Logout')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// onClick={async () => {
//   if (!user?.uid) {
//     return;
//   }
//   await createProject(
//     {
//       name: 'My Project',
//       createdAt: Date.now(),
//       createdUserId: user?.uid || '',
//     },
//     {
//       email: user?.email || '',
//       role: 'admin',
//       isPending: false,
//       isAccepted: true,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//       userId: user?.uid || '',
//     },
//     user.uid
//   );
//   await refresh();
//   // await addProjectToUser(user?.uid || '', projectId);
// }}
