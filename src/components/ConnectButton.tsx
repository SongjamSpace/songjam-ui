import { Button, Chip, Tooltip, Menu, MenuItem } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useState } from "react";

type Props = {
  onConnect: (chainType: "eth" | "solana") => void;
  onDisconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
};

const ConnectButton = ({
  onConnect,
  onDisconnect,
  isConnecting,
  isConnected,
  address,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChainSelect = (chainType: "eth" | "solana") => {
    handleClose();
    onConnect(chainType);
  };

  if (isConnected)
    return (
      <Chip
        label={`${address?.slice(0, 6)}...${address?.slice(-4)}`}
        variant="outlined"
        color="primary"
        deleteIcon={
          <Tooltip title="Disconnect">
            <LogoutRoundedIcon />
          </Tooltip>
        }
        onDelete={onDisconnect}
      />
    );

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        className="connect-wallet"
        disabled={isConnecting}
        size="small"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 180,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <MenuItem
          onClick={() => handleChainSelect("eth")}
          sx={{
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <img
            src="/logos/ethereum.png"
            alt="Ethereum"
            style={{ width: 24, height: 24, marginRight: 10 }}
          />
          Ethereum
        </MenuItem>
        <MenuItem
          onClick={() => handleChainSelect("solana")}
          sx={{
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <img
            src="/logos/solana.png"
            alt="Solana"
            style={{ width: 24, height: 24, marginRight: 10 }}
          />
          Solana
        </MenuItem>
      </Menu>
    </>
  );
};

export default ConnectButton;
