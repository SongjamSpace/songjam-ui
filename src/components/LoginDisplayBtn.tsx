import React from 'react';
import { Button, Chip, Avatar, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/firebase.service';
import { signOut } from 'firebase/auth';

const LoginDisplayBtn = ({
  setShowAuthDialog,
}: {
  setShowAuthDialog: (show: boolean) => void;
}) => {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    if (user?.isTwitterLogin) {
      await signOut(auth);
    } else {
      // Handle Dynamic logout
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <Button variant="outlined" disabled>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <Button href="/dashboard" variant="contained" color="primary">
        Dashboard
      </Button>
    );
    // return (
    //   <Chip
    //     label={user.displayName || user.username || user.email || 'User'}
    //     avatar={user.photoURL ? <Avatar src={user.photoURL} /> : undefined}
    //     onClick={() => {
    //       if (user.isDynamicLogin) {
    //         handleLogout();
    //       } else if (user.isTwitterLogin) {
    //         signOut(auth);
    //       }
    //     }}
    //     sx={{
    //       '&:hover': {
    //         backgroundColor: 'rgba(0, 0, 0, 0.08)',
    //       },
    //     }}
    //   />
    // );
  }

  return (
    <Button variant="contained" onClick={() => setShowAuthDialog(true)}>
      Login
    </Button>
  );
};

export default LoginDisplayBtn;
