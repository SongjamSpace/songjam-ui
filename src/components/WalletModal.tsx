import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onSelectChain: (chain: "eth" | "base") => void;
  isConnected: boolean;
  onDisconnect: () => void;
}

export const WalletModal = ({
  open,
  onClose,
  onSelectChain,
  isConnected,
  onDisconnect,
}: WalletModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Select Network
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} py={2}>
          <Button
            variant="contained"
            onClick={() => onSelectChain("eth")}
            fullWidth
            sx={{ height: 56 }}
          >
            Ethereum
          </Button>
          <Button
            variant="contained"
            onClick={() => onSelectChain("base")}
            fullWidth
            sx={{ height: 56 }}
          >
            Base
          </Button>

          {isConnected && (
            <>
              <Divider sx={{ my: 1 }} />
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                fullWidth
                sx={{ height: 56 }}
              >
                Disconnect Wallet
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
