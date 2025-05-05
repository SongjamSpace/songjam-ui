import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Chip,
  Avatar,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import { useAuthContext } from '../contexts/AuthContext';
import {
  getProjectsByIds,
  getProjectMembers,
  addMemberToProject,
  ProjectDoc,
  ProjectMember,
} from '../services/db/projects.service';
import { createProjectInvite } from '../services/db/projectInvites.service';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ProjectList: React.FC = () => {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, ProjectMember[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('admin');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.projectIds?.length) {
      getProjectsByIds(user.projectIds).then(setProjects);
    }
  }, [user]);

  const handleExpand = async (projectId: string) => {
    setExpanded(expanded === projectId ? null : projectId);
    if (!members[projectId]) {
      setLoadingMembers(projectId);
      const mems = await getProjectMembers(projectId);
      setMembers((prev) => ({ ...prev, [projectId]: mems }));
      setLoadingMembers(null);
    }
  };

  const handleInvite = async (project: ProjectDoc) => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteProjectId(project.id);
    try {
      const isNew = await createProjectInvite(
        project.id,
        project.name,
        inviteEmail,
        {
          email: user?.email || '',
          userId: user?.uid || '',
        }
      );
      if (!isNew) {
        toast.error('Member already invited');
        setInviteLoading(false);
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_JAM_SERVER_URL}/send-invite-email`,
        {
          email: inviteEmail,
          projectName: project.name,
        }
      );
      await addMemberToProject(project.id, {
        email: inviteEmail,
        role: inviteRole,
        isPending: true,
        isAccepted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: null,
      });
      setInviteEmail('');
      toast.success('Member invited');
      // Refresh members
      const mems = await getProjectMembers(project.id);
      setMembers((prev) => ({ ...prev, [project.id]: mems }));
    } catch (e) {
      toast.error('Failed to invite member');
    } finally {
      setInviteLoading(false);
      setInviteProjectId(null);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ bgcolor: '#23262f', borderRadius: 2 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>
              Project Name
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>
              Created By
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>
              Created At
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <TableRow hover selected={user?.defaultProjectId === project.id}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {project.name}
                    {user?.defaultProjectId === project.id && (
                      <Chip
                        icon={<StarIcon sx={{ color: '#ffe58f' }} />}
                        label="Default"
                        size="small"
                        sx={{
                          bgcolor: '#3a2e1a',
                          color: '#ffe58f',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  {project.createdEmail}
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleExpand(project.id)}>
                    {expanded === project.id ? (
                      <ExpandLessIcon sx={{ color: 'white' }} />
                    ) : (
                      <ExpandMoreIcon sx={{ color: 'white' }} />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ p: 0, bgcolor: '#23262f' }}>
                  <Collapse
                    in={expanded === project.id}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: 'white', fontWeight: 700, mb: 1 }}
                      >
                        Members
                      </Typography>
                      {loadingMembers === project.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <TableContainer
                          component={Paper}
                          sx={{ bgcolor: '#181a20', mb: 2 }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{ color: 'white', fontWeight: 700 }}
                                >
                                  Member
                                </TableCell>
                                <TableCell
                                  sx={{ color: 'white', fontWeight: 700 }}
                                >
                                  Role
                                </TableCell>
                                <TableCell
                                  sx={{ color: 'white', fontWeight: 700 }}
                                >
                                  Status
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {members[project.id]?.map((m) => (
                                <TableRow key={m.email}>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                      }}
                                    >
                                      {/* <Avatar sx={{ width: 32, height: 32 }}>
                                        {m.email[0]}
                                      </Avatar> */}
                                      <Typography sx={{ color: 'white' }}>
                                        {m.email}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={m.role}
                                      size="small"
                                      sx={{
                                        bgcolor: '#23262f',
                                        color: 'white',
                                        textTransform: 'capitalize',
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {m.isPending && (
                                      <Chip
                                        label="Pending"
                                        size="small"
                                        color="warning"
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      <Divider sx={{ my: 2, borderColor: '#333' }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ color: 'white', mb: 1 }}
                      >
                        Invite New Member
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          label="Email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          size="small"
                          sx={{
                            input: { color: 'white' },
                            label: { color: 'white' },
                            bgcolor: '#181a20',
                            borderRadius: 1,
                          }}
                          InputLabelProps={{ style: { color: 'white' } }}
                        />
                        <TextField
                          select
                          label="Role"
                          value={inviteRole}
                          onChange={(e) =>
                            setInviteRole(e.target.value as 'admin' | 'viewer')
                          }
                          size="small"
                          SelectProps={{ native: true }}
                          sx={{
                            minWidth: 100,
                            bgcolor: '#181a20',
                            borderRadius: 1,
                            color: 'white',
                          }}
                          InputLabelProps={{ style: { color: 'white' } }}
                        >
                          <option value="admin">Admin</option>
                          <option value="viewer">Viewer</option>
                        </TextField>
                        <Button
                          variant="contained"
                          onClick={() => handleInvite(project)}
                          disabled={
                            inviteLoading && inviteProjectId === project.id
                          }
                          sx={{
                            bgcolor: '#7ee787',
                            color: '#181a20',
                            fontWeight: 700,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#5ec16e' },
                          }}
                        >
                          {inviteLoading && inviteProjectId === project.id
                            ? 'Inviting...'
                            : 'Invite'}
                        </Button>
                      </Stack>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProjectList;
