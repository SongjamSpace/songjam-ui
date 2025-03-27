import { signInWithPopup, TwitterAuthProvider } from "firebase/auth";
import { auth } from "../services/firebase.service"; // Assuming you have firebase config setup
import { FaSquareXTwitter } from "react-icons/fa6"; // You'll need to install react-icons
import { Button } from "@mui/material"; // Add this import

const TwitterLogin = () => {
  const handleTwitterLogin = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Successfully logged in
    } catch (error) {
      console.error("Error signing in with Twitter:", error);
    }
  };

  return (
    <Button
      onClick={handleTwitterLogin}
      variant="contained"
      sx={{
        backgroundColor: "#000000",
        // "&:hover": {
        //   backgroundColor: "#272727",
        // },
        borderRadius: "4px",
        padding: "0 32px",
        height: "40px",
        width: "100%",
        maxWidth: "380px",
        textTransform: "none",
        gap: 1,
        fontWeight: 500,
        fontSize: "14px",
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
      }}
      startIcon={<FaSquareXTwitter size={20} />}
    >
      Sign in with X
    </Button>
  );
};

export default TwitterLogin;
