import { ethers } from 'ethers';

// ERC20 ABI for balance checking and transfers
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

// Minimum staked amount required (50k ELYTRA tokens)
const MIN_STAKED_AMOUNT = ethers.parseUnits('50000', 18); // Assuming 18 decimals

// USDT Contract Addresses (Ethereum Mainnet)
const USDT_CONTRACT_ADDRESS_ETH = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
// USDT Contract Address (Base)
const USDT_CONTRACT_ADDRESS_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base (most common stablecoin)

// Your wallet address to receive payments
export const PAYMENT_WALLET_ADDRESS =
  import.meta.env.VITE_PAYMENT_WALLET_ADDRESS || '0xYourWalletAddressHere';

export interface StakingInfo {
  hasMinimumStake: boolean;
  balance: string;
  formattedBalance: string;
  symbol: string;
  name: string;
}

export interface USDTBalance {
  balance: string;
  formattedBalance: string;
  hasEnoughBalance: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export const getSangStakingStatus = async (
  walletAddress: string
): Promise<StakingInfo> => {
  const provider = new ethers.AlchemyProvider(
    8453,
    import.meta.env.VITE_ALCHEMY_API_KEY
  );
  const STACKING_CONTRACT_ADDRESS =
    '0x433584897c42db1770E50E1c93A4F20E35fFed06';
  // check if user has a balance of this contract
  const contract = new ethers.Contract(
    STACKING_CONTRACT_ADDRESS,
    ERC20_ABI,
    provider
  );
  const balance = await contract.balanceOf(walletAddress);
  if (balance > 0) {
    return {
      hasMinimumStake: balance >= MIN_STAKED_AMOUNT,
      balance: balance.toString(),
      formattedBalance: ethers.formatUnits(balance, 18),
      symbol: 'ELYTRA',
      name: 'Elytra',
    };
  }

  return {
    hasMinimumStake: false,
    balance: '0',
    formattedBalance: '0',
    symbol: 'ELYTRA',
    name: 'Elytra',
  };
};

/**
 * Get USDT balance for a wallet address
 */
export const getUSDTBalance = async (
  walletAddress: string,
  network: 'ethereum' | 'base' = 'ethereum'
): Promise<USDTBalance> => {
  try {
    const contractAddress =
      network === 'ethereum'
        ? USDT_CONTRACT_ADDRESS_ETH
        : USDT_CONTRACT_ADDRESS_BASE;

    // Use BrowserProvider for client-side wallet
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        ERC20_ABI,
        provider
      );

      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);

      return {
        balance: balance.toString(),
        formattedBalance,
        hasEnoughBalance: parseFloat(formattedBalance) >= 500,
      };
    }

    throw new Error('No Web3 provider found');
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    return {
      balance: '0',
      formattedBalance: '0',
      hasEnoughBalance: false,
    };
  }
};

/**
 * Send USDT payment for Pro plan upgrade
 */
export const sendUSDTPayment = async (
  amount: string = '500',
  network: 'ethereum' | 'base' = 'ethereum'
): Promise<PaymentResult> => {
  try {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const contractAddress =
      network === 'ethereum'
        ? USDT_CONTRACT_ADDRESS_ETH
        : USDT_CONTRACT_ADDRESS_BASE;
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);

    // Get decimals for the token
    const decimals = await contract.decimals();

    // Convert amount to token units
    const amountInTokenUnits = ethers.parseUnits(amount, decimals);

    // Check balance
    const balance = await contract.balanceOf(userAddress);
    if (balance < amountInTokenUnits) {
      throw new Error(`Insufficient balance. You need ${amount} USDT`);
    }

    // Send the transaction
    const tx = await contract.transfer(
      PAYMENT_WALLET_ADDRESS,
      amountInTokenUnits
    );

    // Wait for confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error sending USDT payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to send payment',
    };
  }
};
