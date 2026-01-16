# FanFirst - Fair Ticketing for Real Fans 🎫

An AI-powered NFT ticketing platform built with Next.js that prioritizes real fans over bots and scalpers.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Polygon](https://img.shields.io/badge/Polygon-Blockchain-8247E5?logo=polygon)

## ✨ Features

- 🎯 **Anti-Bot Protection** - AI behavioral analysis blocks automated scripts
- 🎵 **Spotify Integration** - Prove your fandom with listening history
- 🤝 **Community Vouching** - Build trust through social reputation
- 🎫 **NFT Tickets** - Blockchain-based tickets on Polygon
- 🔄 **Fair Resale Market** - Price-capped secondary market with artist royalties
- 📱 **Dynamic QR Codes** - Rotating verification codes prevent screenshots
- 🏛️ **Fan Communities** - Join artist communities with governance voting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Neon DB)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Running with Socket Server

```bash
# Run both Next.js and Socket.io server
npm run dev:all
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **State** | Zustand |
| **Animation** | Framer Motion, GSAP |
| **Auth** | Auth0 |
| **Database** | PostgreSQL + Prisma ORM |
| **Blockchain** | Polygon (Ethers.js, Wagmi, RainbowKit) |
| **Real-time** | Socket.io |
| **Smart Contracts** | Solidity + Hardhat |

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── community/      # Fan communities
│   ├── dashboard/      # User dashboard
│   ├── events/         # Event listings & details
│   └── resale/         # Resale marketplace
├── components/          # React components
│   ├── community/      # Community components
│   ├── events/         # Event cards & listings
│   ├── layout/         # Navbar, Footer
│   └── ui/             # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, types, configs
└── providers/           # Context providers
```

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=your_postgres_connection_string

# Auth0
AUTH0_SECRET=your_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Blockchain
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/your-key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:all` | Start Next.js + Socket server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run hardhat:compile` | Compile smart contracts |
| `npm run hardhat:deploy:testnet` | Deploy to Polygon Amoy |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for real fans