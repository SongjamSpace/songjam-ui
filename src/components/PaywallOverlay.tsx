import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from '../contexts/AuthContext';
import TwitterLogin from './TwitterLogin';

interface PaywallOverlayProps {
  isProcessingPayment: boolean;
  handlePayment: () => void;
}

export const PaywallOverlay: React.FC<PaywallOverlayProps> = ({
  isProcessingPayment,
  handlePayment,
}) => {
  const { user } = useAuthContext();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '25%',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        background:
          'linear-gradient(to bottom, rgba(15,23,42,0) 0%, rgba(15,23,42,1) 25%)',
        padding: 3,
        textAlign: 'center',
      }}
    >
      <Paper
        elevation={24}
        sx={{
          mt: 2,
          background: 'rgba(30, 41, 59, 0.95)',
          borderRadius: 3,
          p: 2.5,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          maxWidth: '300px',
          width: '100%',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold',
          }}
        >
          {user ? 'Unlock Full Access' : 'Sign in to Unlock'}
        </Typography>
        <Typography sx={{ mb: 3, color: '#94a3b8' }}>
          {!user
            ? 'Sign in with X to get free space credits'
            : user.spaceCredits
              ? `${user.spaceCredits} Free space credits left`
              : `Get complete access to this space for just $1 USDT`}
        </Typography>
        {!user ? (
          <TwitterLogin />
        ) : (
          <LoadingButton
            loading={isProcessingPayment}
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePayment}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {user.spaceCredits ? `Unlock for Free` : `Pay $1 USDT`}
          </LoadingButton>
        )}
      </Paper>
    </Box>
  );
};
