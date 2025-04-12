import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  // IconButton,
  // InputAdornment,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AgentOrg, AgentOrgDoc } from '../services/db/agent.service';
import { LoadingButton } from '@mui/lab';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface AgentSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  agentOrg: AgentOrgDoc | null;
  onSave: (agentId?: string, agentOrg?: Partial<AgentOrg>) => void;
}

export default function AgentSettingsDialog({
  open,
  onClose,
  agentOrg,
  onSave,
}: AgentSettingsDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  // const [email, setEmail] = useState('');
  // const [twoFactorSecret, setTwoFactorSecret] = useState('');
  // const [showPassword, setShowPassword] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(agentOrg?.id, {
      name,
    });
    setIsLoading(false);
    onClose();
  };

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
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label={t('agentName', 'Agent Name')}
            value={name || agentOrg?.name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            variant="outlined"
          />
          {/* <TextField
            label={t('username', 'Username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            label={t('password', 'Password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label={t('email', 'Email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            label={t('twoFactorSecret', '2FA Secret')}
            value={twoFactorSecret}
            onChange={(e) => setTwoFactorSecret(e.target.value)}
            fullWidth
            variant="outlined"
            helperText={t('twoFactorSecretHelper', 'Enter your 2FA secret key')}
          /> */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel', 'Cancel')}</Button>
        <LoadingButton
          loading={isLoading}
          onClick={handleSave}
          variant="contained"
          color="primary"
        >
          {t('save', 'Save')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
