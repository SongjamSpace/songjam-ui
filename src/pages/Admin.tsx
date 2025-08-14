import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import LoginDialog from '../components/LoginDialog';
import SpaceSubmissionsTable from '../components/SpaceSubmissionsTable';
import Background from '../components/Background';

type Props = {};

const whitelistedEmails = ['logesh@songjam.space', 'adam@songjam.space'];

const Admin = (props: Props) => {
  const { user, loading: authLoading } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Show login dialog if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else {
      if (whitelistedEmails.includes(user?.email || '')) {
        setShowAuthDialog(false);
      } else if (user) {
        alert('You are not authorized to access this page');
      }
    }
  }, [user, authLoading]);

  return (
    <Box sx={{ p: 3 }}>
      <Background />
      <Box sx={{ position: 'relative', zIndex: 9999 }}>
        <LoginDialog open={showAuthDialog && !authLoading} />
        {user && <SpaceSubmissionsTable />}
      </Box>
    </Box>
  );
};

export default Admin;
