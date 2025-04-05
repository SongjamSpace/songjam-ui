import { signInWithPopup, signOut, TwitterAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase.service'; // Assuming you have firebase config setup
import { FaSquareXTwitter } from 'react-icons/fa6'; // You'll need to install react-icons
import { Button, Chip, Avatar } from '@mui/material'; // Add this import
import { useAuthContext } from '../contexts/AuthContext';
import TwitterIcon from '@mui/icons-material/Twitter';

const TwitterLogin = () => {
  const { user, loading } = useAuthContext();
  const handleTwitterLogin = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Successfully logged in
    } catch (error) {
      console.error('Error signing in with Twitter:', error);
    }
  };

  if (user) {
    return (
      <Chip
        label={user.displayName}
        avatar={<Avatar src={user.photoURL || ''} />}
        clickable
        onClick={() => signOut(auth)}
      />
    );
  }

  return (
    <Button
      disabled={loading}
      onClick={handleTwitterLogin}
      variant="contained"
      sx={{
        backgroundColor: '#000000',
        // "&:hover": {
        //   backgroundColor: "#272727",
        // },
        borderRadius: '4px',
        padding: '0 32px',
        height: '40px',
        // width: '100%',
        maxWidth: '380px',
        textTransform: 'none',
        gap: 1,
        fontWeight: 500,
        fontSize: '14px',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
      }}
      startIcon={<TwitterIcon />}
    >
      {loading ? 'Connecting...' : 'Connect Twitter'}
    </Button>
  );
};

export default TwitterLogin;
