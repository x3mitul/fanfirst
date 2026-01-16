import { create } from "zustand";
import { User, Ticket, Event, Community, CommunityPost, GovernanceProposal, CommunityMember } from "./types";
import { mockUser, mockTickets, mockEvents } from "./mock-data";

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setWalletAddress: (address: string | undefined) => void;

  // Tickets
  userTickets: Ticket[];
  addTicket: (ticket: Ticket) => void;

  // Events
  events: Event[];
  setEvents: (events: Event[]) => void;

  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Cart
  cart: { eventId: string; tierId: string; quantity: number }[];
  addToCart: (eventId: string, tierId: string, quantity: number) => void;
  removeFromCart: (eventId: string, tierId: string) => void;
  clearCart: () => void;

  // Spotify
  spotifyConnected: boolean;
  connectSpotify: () => void;
  disconnectSpotify: () => void;
  setSpotifyConnected: (connected: boolean) => void;

  // Community (Solana-powered)
  communities: Community[];
  setCommunities: (communities: Community[]) => void;
  joinedCommunities: string[]; // Community IDs
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;

  // Community Posts
  communityPosts: CommunityPost[];
  setCommunityPosts: (posts: CommunityPost[]) => void;
  addCommunityPost: (post: CommunityPost) => void;

  // Governance
  proposals: GovernanceProposal[];
  setProposals: (proposals: GovernanceProposal[]) => void;
  voteOnProposal: (proposalId: string, optionId: string) => void;

  // Solana Wallet
  solanaWalletAddress: string | undefined;
  setSolanaWalletAddress: (address: string | undefined) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth - Start logged out, user must authenticate
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({
    user: null,
    isAuthenticated: false,
    userTickets: [],
    cart: [],
    joinedCommunities: [],
    communityPosts: [],
    spotifyConnected: false,
    solanaWalletAddress: undefined,
  }),
  setWalletAddress: (address) => set((state) => ({
    user: state.user ? { ...state.user, walletAddress: address } : null
  })),

  // Tickets
  userTickets: mockTickets,
  addTicket: (ticket) => set((state) => ({ userTickets: [...state.userTickets, ticket] })),

  // Events
  events: mockEvents,
  setEvents: (events) => set({ events }),

  // UI State
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  // Cart
  cart: [],
  addToCart: (eventId, tierId, quantity) =>
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (item) => item.eventId === eventId && item.tierId === tierId
      );
      if (existingIndex >= 0) {
        const newCart = [...state.cart];
        newCart[existingIndex].quantity += quantity;
        return { cart: newCart };
      }
      return { cart: [...state.cart, { eventId, tierId, quantity }] };
    }),
  removeFromCart: (eventId, tierId) =>
    set((state) => ({
      cart: state.cart.filter(
        (item) => !(item.eventId === eventId && item.tierId === tierId)
      ),
    })),
  clearCart: () => set({ cart: [] }),

  // Spotify
  spotifyConnected: true,
  connectSpotify: () => set({ spotifyConnected: true }),
  disconnectSpotify: () => set({ spotifyConnected: false }),
  setSpotifyConnected: (connected) => set({ spotifyConnected: connected }),

  // Community
  communities: [],
  setCommunities: (communities) => set({ communities }),
  joinedCommunities: [],
  joinCommunity: (communityId) =>
    set((state) => ({
      joinedCommunities: [...state.joinedCommunities, communityId],
    })),
  leaveCommunity: (communityId) =>
    set((state) => ({
      joinedCommunities: state.joinedCommunities.filter((id) => id !== communityId),
    })),

  // Community Posts
  communityPosts: [],
  setCommunityPosts: (posts) => set({ communityPosts: posts }),
  addCommunityPost: (post) =>
    set((state) => ({ communityPosts: [post, ...state.communityPosts] })),

  // Governance
  proposals: [],
  setProposals: (proposals) => set({ proposals }),
  voteOnProposal: (proposalId, optionId) =>
    set((state) => ({
      proposals: state.proposals.map((proposal) => {
        if (proposal.id !== proposalId) return proposal;
        return {
          ...proposal,
          options: proposal.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
          totalVotes: proposal.totalVotes + 1,
        };
      }),
    })),

  // Solana Wallet
  solanaWalletAddress: undefined,
  setSolanaWalletAddress: (address) =>
    set((state) => ({
      solanaWalletAddress: address,
      user: state.user ? { ...state.user, solanaWalletAddress: address } : null,
    })),
}));
