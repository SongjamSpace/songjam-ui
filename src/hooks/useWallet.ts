import { useState, useEffect } from "react";
import { createUser } from "../services/db/user.service";

export type Chain = {
  id: number;
  name: string;
  rpcUrl: string;
};

const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${
      import.meta.env.VITE_ALCHEMY_RPC_KEY
    }`,
  },
  // {
  //   id: 8453,
  //   name: "Base",
  //   rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${
  //     import.meta.env.VITE_ALCHEMY_RPC_KEY
  //   }`,
  // },
];

export interface WalletState {
  address: string | null;
  chainId: number | null;
  provider: any | null;
  isConnecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    provider: null,
    isConnecting: false,
    error: null,
  });

  // Add this new useEffect for auto-connect
  // useEffect(() => {
  //   const checkConnection = async () => {
  //     if (!window.ethereum) return;

  //     try {
  //       // Check if we already have access to accounts
  //       const accounts = await window.ethereum.request({
  //         method: "eth_accounts",
  //       });
  //       if (accounts.length > 0) {
  //         // Get the current chainId
  //         const chainId = await window.ethereum.request({
  //           method: "eth_chainId",
  //         });

  //         setWalletState((prev) => ({
  //           ...prev,
  //           address: accounts[0],
  //           chainId: parseInt(chainId, 16),
  //           isConnecting: false,
  //           error: null,
  //         }));
  //       }
  //     } catch (error) {
  //       console.error("Error checking wallet connection:", error);
  //     }
  //   };

  //   checkConnection();
  // }, []);

  const connectWallet = async (
    chain: "eth" | "base"
  ): Promise<string | null> => {
    if (!window.ethereum) {
      alert("Please install a browser wallet such as MetaMask to connect");
      return null;
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      // Switch chain based on selection
      const chainId = chain === "eth" ? "0x1" : "0x2105"; // Base chainId
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      // await createUser({ address: accounts[0], chainId });

      setWalletState((prev) => ({
        ...prev,
        address: accounts[0],
        chainId: Number(chainId),
        isConnecting: false,
        error: null,
      }));
      return accounts[0];
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (chain === "base") {
        // If Base chain is not added, add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Base chain:", addError);
        }
      }
    } finally {
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
    }
    return null;
  };

  const switchChain = async (chainId: number) => {
    if (!window.ethereum || !walletState.provider) return;

    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
    if (!chain) {
      setWalletState((prev) => ({
        ...prev,
        error: "Unsupported chain",
      }));
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chain.name,
                rpcUrls: [chain.rpcUrl],
              },
            ],
          });
        } catch (addError) {
          setWalletState((prev) => ({
            ...prev,
            error: "Failed to add chain to wallet",
          }));
        }
      }
    }
  };

  const disconnect = () => {
    setWalletState({
      address: null,
      chainId: null,
      provider: null,
      isConnecting: false,
      error: null,
    });
  };

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (walletState.address !== accounts[0]) {
        setWalletState((prev) => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState((prev) => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [walletState.address]);

  return {
    ...walletState,
    connectWallet,
    switchChain,
    disconnect,
    isConnected: !!walletState.address,
  };
};
