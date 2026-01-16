import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Get Solana connection
export function getSolanaConnection(): Connection {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

// Format Solana address (truncate)
export function formatSolanaAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Validate Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

// Format SOL amount
export function formatSolAmount(lamports: number, decimals = 4): string {
  const sol = lamportsToSol(lamports);
  return `${sol.toFixed(decimals)} SOL`;
}

// Get account balance with retry logic
export async function getBalance(address: string): Promise<number> {
  try {
    const connection = getSolanaConnection();
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    // Don't spam console for network failures - these are common with public RPCs
    if (error instanceof TypeError && (error as Error).message?.includes('Failed to fetch')) {
      console.warn('Solana RPC temporarily unavailable, returning cached/zero balance');
      return 0;
    }
    console.error('Error fetching balance:', error);
    return 0;
  }
}

// Check token balance (SPL)
export async function getTokenBalance(
  walletAddress: string,
  tokenMintAddress: string
): Promise<number> {
  try {
    const connection = getSolanaConnection();
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    // Get token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tokenMintPublicKey }
    );

    if (tokenAccounts.value.length === 0) return 0;

    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

// Token-gate community access
export async function hasTokenAccess(
  walletAddress: string,
  tokenMintAddress: string,
  minimumAmount: number
): Promise<boolean> {
  try {
    const balance = await getTokenBalance(walletAddress, tokenMintAddress);
    return balance >= minimumAmount;
  } catch (error) {
    console.error('Error checking token access:', error);
    return false;
  }
}

// Check if user owns NFT from collection

export async function hasNFTFromCollection(
  walletAddress: string,
  _collectionAddress: string
): Promise<boolean> {
  try {
    const connection = getSolanaConnection();
    const walletPublicKey = new PublicKey(walletAddress);

    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    // Filter NFTs (amount = 1, decimals = 0)
    const nfts = tokenAccounts.value.filter(
      (account) => {
        const { tokenAmount } = account.account.data.parsed.info;
        return tokenAmount.decimals === 0 && tokenAmount.uiAmount === 1;
      }
    );

    // TODO: Check if any NFT belongs to the collection
    // This requires fetching metadata from Metaplex
    return nfts.length > 0;
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
    return false;
  }
}

// Create transaction for on-chain voting

export async function createVoteTransaction(
  _voterAddress: string,
  _proposalId: string,
  _optionIndex: number
): Promise<Transaction | null> {
  try {
    // TODO: Implement actual voting program interaction
    // This would interact with a deployed Solana program (Anchor)
    const transaction = new Transaction();

    // Placeholder - would add actual vote instruction
    // const voteInstruction = await createVoteInstruction(
    //   voterAddress, proposalId, optionIndex
    // );
    // transaction.add(voteInstruction);

    return transaction;
  } catch (error) {
    console.error('Error creating vote transaction:', error);
    return null;
  }
}

// Mock function for compressed NFT (cNFT) POAP minting
export async function mintPOAPBadge(
  recipientAddress: string,
  badgeMetadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  }
): Promise<string | null> {
  try {
    // TODO: Implement cNFT minting using Metaplex Bubblegum
    // This would use Merkle trees for cheap batch minting
    console.log('Minting POAP badge for:', recipientAddress, badgeMetadata);

    // Placeholder - would return actual mint signature
    return `mock-signature-${Date.now()}`;
  } catch (error) {
    console.error('Error minting POAP badge:', error);
    return null;
  }
}

// Get recent transactions for an address
export async function getRecentTransactions(
  address: string,
  limit = 10
): Promise<Array<Record<string, unknown>>> {
  try {
    const connection = getSolanaConnection();
    const publicKey = new PublicKey(address);

    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getParsedTransaction(sig.signature, 'confirmed');
        return {
          signature: sig.signature,
          timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : null,
          status: sig.confirmationStatus,
          ...tx,
        };
      })
    );

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}
