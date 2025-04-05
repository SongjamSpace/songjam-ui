import { Button, Chip, Tooltip } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

type Props = {
  onConnect: () => void;
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
    <Button
      variant="contained"
      onClick={onConnect}
      className="connect-wallet"
      disabled={isConnecting}
      size="small"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default ConnectButton;
