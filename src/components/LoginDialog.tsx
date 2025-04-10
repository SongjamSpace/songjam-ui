import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Box,
} from '@mui/material';
import TwitterLogin from './TwitterLogin';

interface LoginDialogProps {
  open: boolean;
  onClose?: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
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
          Connect your Twitter account to access Space analytics, audience
          insights, and AI-powered tools.
        </DialogContentText>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <TwitterLogin />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
