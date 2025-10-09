import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Box,
  Typography,
  LinearProgress,
  Button,
  // TextField,
  // Button,
  // IconButton,
  // InputAdornment,
} from '@mui/material';
// import TwitterLogin from './TwitterLogin';
import DynamicLogin from './DynamicLogin';
import { TwitterIcon } from '@dynamic-labs/iconic';
// import SendIcon from '@mui/icons-material/Send';
// import { signInWithEmailLink } from 'firebase/auth';
// import { auth } from '../services/firebase.service';
import { useAuthContext } from '../contexts/AuthContext';
import { useSocialAccounts } from '@dynamic-labs/sdk-react-core';
import { ProviderEnum } from '@dynamic-labs/types';

interface LoginDialogProps {
  open: boolean;
  onClose?: () => void;
  showOnlyTwitter?: boolean;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  showOnlyTwitter,
}) => {
  // const [email, setEmail] = useState('');
  const { loading } = useAuthContext();
  const { error, isProcessing, signInWithSocialAccount } = useSocialAccounts();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          minWidth: { xs: '90%', sm: 400 },
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}
      >
        Welcome to Songjam
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          Sign in with your Twitter to access Space analytics, DJ, audience
          insights, and AI-powered tools.
        </DialogContentText>
        {loading || (isProcessing && <LinearProgress sx={{ mb: 3 }} />)}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* <TwitterLogin /> */}
          {/* <Box display="flex" gap={1}> */}
          {/* <TextField
            label="Email"
            size="small"
            value={email}
            sx={{ width: '250px' }}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      signInWithEmailLink(auth, email, window.location.href);
                    }}
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          /> */}
          {/* </Box> */}
          {/* <Typography>or</Typography> */}
          {showOnlyTwitter ? (
            <Button
              disabled={loading || isProcessing}
              onClick={() => signInWithSocialAccount(ProviderEnum.Twitter)}
              // variant="contained"
              // color="info"
              sx={{
                '& .MuiButton-endIcon': {
                  marginLeft: 0,
                },
                bgcolor: '#000000',
                color: '#ffffff',
                // "&:hover": {
                //   backgroundColor: "#272727",
                // },
                // borderRadius: '4px',
                padding: '0 32px',
                height: '40px',
                // width: '250px',
                maxWidth: '380px',
                textTransform: 'none',
                gap: 1,
                fontWeight: 500,
                fontSize: '14px',
              }}
              endIcon={
                <img
                  src="/logos/twitter.png"
                  alt="Twitter"
                  width={14}
                  height={14}
                />
              }
            >
              {loading ? 'Connecting...' : 'Continue with'}
            </Button>
          ) : (
            <DynamicLogin />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
