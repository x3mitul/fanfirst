"use client";

import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { TICKET_NFT_ABI } from '@/lib/ticket-nft-abi';
import { getContractAddress } from '@/lib/contract-config';
import { parseEther } from 'viem';

export function useTicketPurchase() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const contractAddress = getContractAddress(chainId);

    const {
        writeContract,
        data: hash,
        isPending,
        error: writeError
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError
    } = useWaitForTransactionReceipt({
        hash,
    });

    const buyTicket = async (quantity: number, price: string) => {
        if (!contractAddress) throw new Error("Contract address not found for this chain");
        if (!address) throw new Error("Wallet not connected");

        writeContract({
            address: contractAddress as `0x${string}`,
            abi: TICKET_NFT_ABI,
            functionName: 'mintTickets',
            args: [address as `0x${string}`, BigInt(quantity)],
            value: parseEther(price),
        });
    };

    return {
        buyTicket,
        isPending: isPending || isConfirming,
        isSuccess: isConfirmed,
        error: writeError || confirmError,
        hash,
        isConnected,
        address,
    };
}
