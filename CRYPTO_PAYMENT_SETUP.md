# Crypto Payment Setup Guide

This guide explains how to set up the USDT crypto payment system for the Pro plan upgrade.

## Overview

The crypto payment system allows users to pay 500 USDT (50% off from 1000 USDT) to upgrade to the Pro plan. The payment can be made on either Ethereum Mainnet or Base network.

## Features

- **Wallet Connection**: Connect MetaMask or other Web3 wallets
- **Multi-Network Support**: Ethereum Mainnet and Base network
- **USDT Balance Check**: Automatic balance verification before payment
- **Automatic Upgrade**: User plan is automatically upgraded to Pro after successful payment
- **Transaction Verification**: Transaction hash is displayed for verification

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env` file:

```env
VITE_PAYMENT_WALLET_ADDRESS=0xYourWalletAddressHere
```

**Important**: Replace `0xYourWalletAddressHere` with your actual wallet address that will receive the USDT payments.

### 2. Verify Alchemy API Key

The system uses Alchemy for blockchain interactions. Make sure you have the following environment variable set:

```env
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

### 3. USDT Contract Addresses

The system is pre-configured with the following USDT contract addresses:

- **Ethereum Mainnet**: `0xdAC17F958D2ee523a2206206994597C13D831ec7` (USDT)
- **Base Network**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC - most common stablecoin on Base)

Note: Base network uses USDC as the primary stablecoin. If you prefer to use a different token on Base, update the contract address in `src/services/blockchain.service.ts`.

## Usage

### For Users

1. Navigate to `/crypto-pricing` or click "Pay with Crypto (USDT) - 50% OFF" button on the pricing page
2. Select the network (Ethereum or Base)
3. Click "Connect Wallet" and approve the connection
4. Review your balance and ensure you have at least 500 USDT
5. Click "Pay 500 USDT"
6. Confirm the transaction in your wallet
7. Wait for transaction confirmation
8. Your account will be automatically upgraded to Pro for 30 days

### Payment Flow

1. **Wallet Connection**: User connects their Web3 wallet (MetaMask, etc.)
2. **Balance Check**: System verifies the user has sufficient USDT balance
3. **Payment Confirmation**: User reviews and confirms the payment details
4. **Transaction Execution**: USDT is transferred to the payment wallet address
5. **Plan Upgrade**: Upon successful transaction, user's `currentPlan` is updated to `'pro'`
6. **Transaction Hash**: User receives the transaction hash for verification

## Security Considerations

1. **Wallet Security**: Never store private keys in the codebase
2. **Environment Variables**: Keep the `.env` file secure and never commit it to version control
3. **Transaction Verification**: Always verify transactions on a blockchain explorer
4. **Gas Fees**: Users must have enough ETH/native token for gas fees
5. **Network Verification**: System automatically checks and prompts for correct network

## Testing

### Test Networks

For testing, you can use testnets:

- **Ethereum Sepolia**: Use testnet USDT contracts
- **Base Goerli**: Use testnet stablecoin contracts

Update the contract addresses in `blockchain.service.ts` for testing.

### Testing Checklist

- [ ] Connect wallet successfully
- [ ] Check USDT balance displays correctly
- [ ] Switch between Ethereum and Base networks
- [ ] Handle insufficient balance error
- [ ] Complete payment transaction
- [ ] Verify plan upgrade in database
- [ ] Check transaction hash is displayed
- [ ] Test with different wallet providers (MetaMask, WalletConnect, etc.)

## Troubleshooting

### Common Issues

1. **"Please install MetaMask or another Web3 wallet"**

   - Install a Web3 wallet browser extension
   - Enable the wallet extension

2. **"Insufficient balance"**

   - Ensure you have at least 500 USDT in your wallet
   - Check you're on the correct network

3. **"Failed to switch network"**

   - Manually switch network in your wallet
   - Ensure the network is added to your wallet

4. **Transaction Failed**
   - Check you have enough ETH/native token for gas fees
   - Verify the payment wallet address is correct
   - Try increasing gas limit in wallet settings

## API Reference

### Key Functions

#### `connectWallet()`

Connects user's Web3 wallet and returns address and chain ID.

#### `getUSDTBalance(walletAddress, network)`

Fetches USDT balance for a given wallet address on specified network.

#### `sendUSDTPayment(amount, network)`

Sends USDT payment to the configured payment wallet address.

#### `switchNetwork(chainId)`

Switches wallet to the specified network.

#### `updateUserPlan(userId, plan, startsAt, endsAt)`

Updates user's plan in the database after successful payment.

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure the payment wallet address is valid
4. Check transaction on blockchain explorer

## Future Enhancements

Potential improvements:

- Support for more cryptocurrencies (ETH, BTC, etc.)
- Recurring subscription payments
- Payment history tracking
- Refund functionality
- Multi-currency pricing
- Payment notifications via email/webhook
