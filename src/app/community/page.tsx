'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { mockCommunities, mockProposals } from '@/lib/mock-data';
import { CommunityCard } from '@/components/community/CommunityCard';
import { ProposalCard } from '@/components/community/ProposalCard';
import { CreateCommunityModal, CommunityFormData } from '@/components/community/CreateCommunityModal';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useCustomWalletModal } from '@/providers/SolanaWalletProvider';
import { Sparkles, Vote, Users, TrendingUp, Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CommunityPage() {
  const { communities, setCommunities, proposals, setProposals, joinedCommunities, voteOnProposal } = useStore();
  const { connected, shortAddress, balance, disconnect } = useSolanaWallet();
  const { setVisible } = useCustomWalletModal();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateCommunity = (data: CommunityFormData) => {
    // TODO: Connect to blockchain to create community
    console.log("Creating community:", data);
    // For now, just show success message
    alert(`Community "${data.name}" for ${data.artistName} will be created on Solana!`);
  };

  useEffect(() => {
    // Fetch communities from database via API, fallback to mock
    const fetchData = async () => {
      try {
        const res = await fetch('/api/communities');
        if (res.ok) {
          const data = await res.json();
          setCommunities(data.length > 0 ? data : mockCommunities);
        } else {
          setCommunities(mockCommunities);
        }
      } catch {
        setCommunities(mockCommunities);
      }
      setProposals(mockProposals);
    };
    fetchData();
  }, [setCommunities, setProposals]);

  const activeProposals = proposals.filter(p => p.status === 'active');

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative border-b-4 border-white bg-linear-to-br from-zinc-900 to-black">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#ccff00]" />
            <span className="text-[#ccff00] font-bold tracking-widest text-sm">
              POWERED BY SOLANA
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase">
            Fan Communities
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mb-8">
            Join exclusive artist communities. Vote on setlists, merch designs, and tour dates.
            Earn POAPs and reputation. All powered by Solana blockchain.
          </p>

          {!connected ? (
            <div className="p-6 bg-zinc-900 border-4 border-[#ccff00] max-w-xl">
              <p className="text-white font-bold mb-4">
                ⚡ Connect your Solana wallet to access communities
              </p>
              <p className="text-sm text-zinc-400 mb-4">
                You&apos;ll need a Solana wallet (Phantom, Solflare) to join communities, vote on proposals, and earn rewards.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full mb-4"
                onClick={() => setVisible(true)}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Solana Wallet
              </Button>
              <div className="flex gap-4 text-sm">
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ccff00] hover:underline"
                >
                  Get Phantom →
                </a>
                <a
                  href="https://solflare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ccff00] hover:underline"
                >
                  Get Solflare →
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-zinc-900 border-4 border-[#ccff00] max-w-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-[#ccff00] font-bold">Wallet Connected</p>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-sm text-zinc-400 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              </div>
              <p className="text-white font-mono text-lg mb-2">{shortAddress}</p>
              <p className="text-sm text-zinc-400">
                Balance: {(balance / 1e9).toFixed(4)} SOL
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-zinc-900 border-4 border-white p-6">
              <Users className="w-8 h-8 text-[#ccff00] mb-3" />
              <div className="text-3xl font-black text-white mb-1">
                {communities.reduce((acc, c) => acc + c.memberCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-zinc-400 uppercase tracking-wide">
                Total Members
              </div>
            </div>

            <div className="bg-zinc-900 border-4 border-white p-6">
              <Vote className="w-8 h-8 text-[#ccff00] mb-3" />
              <div className="text-3xl font-black text-white mb-1">
                {proposals.reduce((acc, p) => acc + p.totalVotes, 0).toLocaleString()}
              </div>
              <div className="text-sm text-zinc-400 uppercase tracking-wide">
                Votes Cast
              </div>
            </div>

            <div className="bg-zinc-900 border-4 border-white p-6">
              <TrendingUp className="w-8 h-8 text-[#ccff00] mb-3" />
              <div className="text-3xl font-black text-white mb-1">
                {activeProposals.length}
              </div>
              <div className="text-sm text-zinc-400 uppercase tracking-wide">
                Active Proposals
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Proposals */}
      {activeProposals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Active Votes
            </h2>
            <div className="px-4 py-2 bg-[#ccff00] text-black font-bold text-sm">
              {activeProposals.length} LIVE
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProposals.slice(0, 4).map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVote={(optionId) => voteOnProposal(proposal.id, optionId)}
                hasVoted={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Communities */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">
            All Communities
          </h2>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ccff00] text-black hover:bg-[#dfff00] font-black"
          >
            <Plus className="w-5 h-5" />
            Create Community
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              isMember={joinedCommunities.includes(community.id)}
            />
          ))}
        </div>

        {communities.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏗️</div>
            <p className="text-xl text-zinc-400">
              Communities coming soon...
            </p>
          </div>
        )}
      </section>

      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCommunity}
      />
    </div>
  );
}
