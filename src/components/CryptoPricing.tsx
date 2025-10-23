import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Card,
  CardContent,
  Divider,
  styled,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { SongjamUser, updateUserPlan } from '../services/db/user.service';
import {
  sendUSDTPayment,
  getUSDTBalance,
  PAYMENT_WALLET_ADDRESS,
} from '../services/blockchain.service';
import toast from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { mainnet, base } from 'viem/chains';

type Props = {
  user: SongjamUser | null;
  onSuccess?: () => void;
};

// Styled wrapper for ConnectButton to match app theme
const StyledConnectButtonWrapper = styled(Box)(({ theme }) => ({
  '& button': {
    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6) !important',
    borderRadius: '12px !important',
    border: 'none !important',
    color: 'white !important',
    fontWeight: '600 !important',
    padding: '12px 24px !important',
    transition: 'all 0.3s ease !important',
    backdropFilter: 'blur(8px) !important',
    boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3) !important',
    textTransform: 'none !important',
    fontSize: '1rem !important',
    minHeight: '48px !important',
    '&:hover': {
      background: 'linear-gradient(135deg, #3b82f6, #7c3aed) !important',
      transform: 'translateY(-2px) !important',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2) !important',
    },
    '&:active': {
      transform: 'translateY(0) !important',
    },
    '&:focus': {
      outline: 'none !important',
      boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.3) !important',
    },
  },
  '& [data-testid="connect-button"]': {
    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6) !important',
    borderRadius: '12px !important',
    border: 'none !important',
    color: 'white !important',
    fontWeight: '600 !important',
    padding: '12px 24px !important',
    transition: 'all 0.3s ease !important',
    backdropFilter: 'blur(8px) !important',
    boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3) !important',
    textTransform: 'none !important',
    fontSize: '1rem !important',
    minHeight: '48px !important',
    '&:hover': {
      background: 'linear-gradient(135deg, #3b82f6, #7c3aed) !important',
      transform: 'translateY(-2px) !important',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2) !important',
    },
    '&:active': {
      transform: 'translateY(0) !important',
    },
    '&:focus': {
      outline: 'none !important',
      boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.3) !important',
    },
  },
}));

const CryptoPricing = ({ user, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Function to fetch USDT balance
  const fetchUSDTBalance = async (address: string, chainId: number) => {
    const network = chainId === mainnet.id ? 'ethereum' : 'base';
    try {
      const balance = await getUSDTBalance(address, network);
      setUsdtBalance(balance.formattedBalance);
    } catch (error) {
      console.error('Error fetching USDT balance:', error);
      setUsdtBalance('0');
    }
  };

  // RainbowKit hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();

  // Fetch USDT balance when wallet connects or network changes
  useEffect(() => {
    if (address && isConnected) {
      fetchUSDTBalance(address, chainId);
    }
  }, [address, isConnected, chainId]);

  const handlePayment = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!user) {
      toast.error('Please login to upgrade');
      return;
    }

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      // Determine network from current chain
      const network = chainId === mainnet.id ? 'ethereum' : 'base';

      // Send payment
      const result = await sendUSDTPayment('500', network);

      if (result.success && result.transactionHash) {
        // Update user plan in database
        const now = Date.now();
        const oneMonthFromNow = now + 30 * 24 * 60 * 60 * 1000; // 30 days

        await updateUserPlan(user.uid, 'pro', now, oneMonthFromNow);

        setTransactionHash(result.transactionHash);
        setPaymentSuccess(true);

        toast.success(
          'Payment successful! Your plan has been upgraded to Pro.'
        );

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNetworkName = (id: number) => {
    switch (id) {
      case mainnet.id:
        return 'Ethereum';
      case base.id:
        return 'Base';
      default:
        return 'Unknown';
    }
  };

  if (user?.currentPlan === 'pro' || user?.currentPlan === 'business') {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          You're already on the {user.currentPlan.toUpperCase()} plan!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enjoy all the premium features.
        </Typography>
      </Box>
    );
  }

  if (paymentSuccess) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Payment Successful! 🎉
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Your account has been upgraded to Pro.
        </Typography>
        {transactionHash && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              wordBreak: 'break-all',
              mt: 2,
              p: 1.5,
              bgcolor: 'rgba(0,0,0,0.2)',
              borderRadius: 1,
              display: 'block',
            }}
          >
            Transaction: {transactionHash}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, maxWidth: '450px', mx: 'auto' }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: 'center',
          mb: 2,
          fontWeight: 700,
        }}
      >
        Upgrade to Pro Plan
      </Typography>
      <Divider />
      <Paper
        elevation={3}
        sx={{
          p: 3,
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          {/* Price Section */}
          <Box sx={{ textAlign: 'center', position: 'relative' }}>
            <Chip
              label="50% OFF"
              size="small"
              sx={{
                bgcolor: '#10b981',
                color: 'white',
                fontWeight: 'bold',
                mb: 1,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
              }}
            >
              500 USDT
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', textDecoration: 'line-through' }}
            >
              1000 USDT
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pro Plan - 30 days
            </Typography>
          </Box>

          <Box display={'flex'} justifyContent={'center'}>
            {/* Wallet Info or Connect Button */}
            {isConnected && address ? (
              <Box>
                <Alert
                  severity="info"
                  sx={{ mb: 1, py: 0.5 }}
                  action={
                    <Button
                      size="small"
                      color="error"
                      onClick={() => disconnect()}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      Disconnect
                    </Button>
                  }
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {address.slice(0, 6)}...{address.slice(-4)} •{' '}
                    {getNetworkName(chainId)}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Balance: {parseFloat(usdtBalance).toFixed(2)} USDT
                  </Typography>
                </Alert>

                {parseFloat(usdtBalance) < 500 && (
                  <Alert severity="warning" sx={{ mb: 1, py: 0.5 }}>
                    <Typography variant="caption">
                      Insufficient balance. Need 500 USDT.
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  disabled={loading || parseFloat(usdtBalance) < 500}
                  onClick={() => setShowConfirmDialog(true)}
                >
                  {loading ? <CircularProgress size={20} /> : 'Pay 500 USDT'}
                </Button>
              </Box>
            ) : (
              <StyledConnectButtonWrapper>
                <ConnectButton showBalance={false} chainStatus="icon" />
              </StyledConnectButtonWrapper>
            )}
          </Box>

          {/* Payment Address */}
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              display: 'block',
            }}
          >
            Payment to:{' '}
            <code style={{ fontSize: '0.65rem' }}>
              {PAYMENT_WALLET_ADDRESS}
            </code>
          </Typography>
        </Stack>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Confirm Payment
          <IconButton
            onClick={() => setShowConfirmDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2">
              Send 500 USDT to upgrade to Pro plan for 30 days.
            </Typography>
            <Box
              sx={{
                bgcolor: 'rgba(96, 165, 250, 0.1)',
                p: 1.5,
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" display="block">
                <strong>Amount:</strong> 500 USDT
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Network:</strong>{' '}
                {chainId === mainnet.id ? 'Ethereum' : 'Base'}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ wordBreak: 'break-all' }}
              >
                <strong>To:</strong> {PAYMENT_WALLET_ADDRESS.slice(0, 20)}...
              </Typography>
            </Box>
            <Alert severity="info" sx={{ py: 0.5 }}>
              <Typography variant="caption">
                Your account will be upgraded automatically after payment.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            disabled={loading}
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={loading}
            size="small"
          >
            {loading ? <CircularProgress size={16} /> : 'Confirm & Pay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CryptoPricing;
