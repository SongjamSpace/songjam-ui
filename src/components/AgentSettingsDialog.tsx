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
  acceptOrgInvite,
  rejectOrgInvite,
  addMemberToOrganization,
  getOrganizationMembers,
  Organization,
  OrganizationDoc,
  OrganizationMember,
  removeUserFromMembers,
  getOrganizationsByIds,
  createOrganization,
} from '../services/db/organization.service';
import { updateUserOrgId } from '../services/db/user.service';
import axios from 'axios';
import {
  createOrganizationInvite,
  getOrganizationInvitesFromEmail,
  OrganizationInvite,
} from '../services/db/organizationInvites.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface AgentSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  agentOrg: OrganizationDoc | null;
  onSave: (agentId?: string, agentOrg?: Partial<Organization>) => void;
}

export default function AgentSettingsDialog({
  open,
  onClose,
  agentOrg,
  onSave,
}: AgentSettingsDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'viewer'>('admin');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const { user } = useAuth();
  const [orgInvites, setOrgInvites] = useState<OrganizationInvite[]>([]);
  const [userOrgs, setUserOrgs] = useState<OrganizationDoc[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [removeLoadingFor, setRemoveLoadingFor] = useState<string>('');
  const [isSwitchingOrg, setIsSwitchingOrg] = useState(false);
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  // const [email, setEmail] = useState('');
  // const [twoFactorSecret, setTwoFactorSecret] = useState('');
  // const [showPassword, setShowPassword] = useState(false);

  const handleSave = async () => {
    if (!name || !agentOrg) {
      return;
    }
    setIsLoading(true);
    await onSave(agentOrg.id, {
      name,
    });
    setIsLoading(false);
    onClose();
  };

  const handleInviteMember = async () => {
    if (
      members.map((m) => m.email).includes(memberEmail) ||
      isInviting ||
      !agentOrg
    )
      return;
    setIsInviting(true);
    // TODO: Implement member invitation logic
    console.log('Inviting member:', { email: memberEmail, role: memberRole });
    const isNew = await createOrganizationInvite(
      agentOrg.id,
      agentOrg.name,
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
        organizationName: agentOrg.name,
      }
    );
    await addMemberToOrganization(agentOrg.id, {
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
    await fetchMembers();
  };
  const fetchMembers = async () => {
    if (agentOrg) {
      const members = await getOrganizationMembers(agentOrg.id);
      setMembers(members);
      setIsAdmin(
        members.some(
          (m) =>
            m.email === user?.email &&
            (m.role === 'admin' || m.role === 'creator')
        )
      );
    }
  };
  const fetchOrgInvites = async () => {
    if (user?.email) {
      const invites = await getOrganizationInvitesFromEmail(user.email);
      setOrgInvites(invites as OrganizationInvite[]);
    }
  };
  // const fetchUserOrgs = async () => {
  //   if (user && user.organizationIds) {
  //     const orgs = await getOrganizationsByIds(user.organizationIds);
  //     setUserOrgs(orgs);
  //   }
  // };
  const refresh = () => {
    fetchMembers();
    fetchOrgInvites();
    // fetchUserOrgs();
  };

  useEffect(() => {
    if (open) {
      if (members.length === 0) {
        fetchMembers();
      }
      if (orgInvites.length === 0) {
        fetchOrgInvites();
      }
      // if (userOrgs.length === 0) {
      //   fetchUserOrgs();
      // }
    }
  }, [agentOrg, open, members, orgInvites, userOrgs]);

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
        if (agentOrg) {
          onClose();
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6">
            {agentOrg
              ? t('agentSettings', 'Agent Settings')
              : t('setupAgent', 'Setup Your Agent')}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {t('accessSpaces', 'Access all your spaces in one place')}
          </Typography>
          {(!user?.organizationIds || user?.organizationIds.length === 0) &&
            orgInvites.length === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  const orgId = await createOrganization(
                    {
                      name: 'My Organization',
                      createdAt: Date.now(),
                      createdUserId: user?.uid || '',
                    },
                    [
                      {
                        email: user?.email || '',
                        role: 'admin',
                        isPending: false,
                        isAccepted: true,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        userId: user?.uid || '',
                      },
                    ]
                  );
                  await updateUserOrgId(user?.uid || '', orgId);
                }}
              >
                {t('setupOrganization', 'Setup Organization')}
              </Button>
            )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {agentOrg ? (
          <Stack gap={2} mt={2}>
            <TextField
              label={t('agentName', 'Agent Name')}
              value={name === null ? agentOrg.name : name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              variant="outlined"
              disabled={!isAdmin}
            />
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
                          variant="contained"
                          size="small"
                          onClick={async () => {
                            setRemoveLoadingFor(m.email);
                            await removeUserFromMembers(
                              m.email,
                              agentOrg.id,
                              m.userId || ''
                            );
                            await fetchMembers();
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
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {t('inviteNewMember', 'Invite New Member')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label={t('email', 'Email')}
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ flexBasis: '50%' }}
                  />
                  <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>{t('role', 'Role')}</InputLabel>
                    <Select
                      value={memberRole}
                      label={t('role', 'Role')}
                      onChange={(e) =>
                        setMemberRole(e.target.value as 'admin' | 'viewer')
                      }
                    >
                      <MenuItem value="admin">{t('admin', 'Admin')}</MenuItem>
                      <MenuItem value="viewer">
                        {t('viewer', 'Viewer')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <LoadingButton
                    loading={isInviting}
                    variant="contained"
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
          </Stack>
        ) : (
          <Stack gap={2} mt={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('pendingInvites', 'Pending Invites')}
            </Typography>
            {orgInvites.length === 0 && (
              <Typography variant="subtitle2" color="text.secondary">
                {t('noPendingInvites', 'No pending invites')}
              </Typography>
            )}
            {orgInvites.map((invite) => (
              <Box
                key={invite.organizationId}
                display="flex"
                gap={2}
                alignItems="center"
              >
                <Typography variant="body1">
                  {invite.organizationName}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    if (!user?.uid) {
                      return;
                    }
                    console.log('Removing member:', invite);
                    await rejectOrgInvite(invite, user.uid);
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
                    await acceptOrgInvite(invite, user.uid);
                    await refresh();
                  }}
                >
                  {t('accept', 'Accept')}
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      {isAdmin && (
        <DialogActions>
          <Button onClick={onClose}>{t('cancel', 'Cancel')}</Button>
          <LoadingButton
            loading={isLoading}
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!name}
          >
            {t('save', 'Save')}
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
}
