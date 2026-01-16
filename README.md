# FanFirst - Fair Ticketing for Real Fans 🎫

An AI-powered NFT ticketing platform built with Next.js that prioritizes real fans over bots and scalpers. **FanFirst** abstracts away the complexity of Web3 while simulating its benefits, providing an adaptive experience for every user.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Polygon](https://img.shields.io/badge/Polygon-Blockchain-8247E5?logo=polygon)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-412991?logo=openai)

---

## 🏗️ System Architecture

FanFirst combines a high-performance Next.js frontend with robust blockchain integration and AI layers.

```mermaid
graph TD
    subgraph Frontend [Next.js Client]
        UI[React UI Components]
        Signals[Behavior Tracking]
        Wallet[Privy / RainbowKit]
    end

    subgraph Backend [Server Infrastructure]
        API[Next.js API Routes]
        Socket[Socket.io Server]
        Actions[Server Actions]
    end

    subgraph Services [External Services]
        OpenAI[OpenAI Classification]
        Auth0[Auth0 Identity]
        Polygon[Polygon Blockchain]
        DB[(PostgreSQL / Prisma)]
    end

    UI -->|User Signals| Signals
    Signals -->|Analysis| OpenAI
    OpenAI -->|Comfort Level| UI
    
    UI -->|Auth| Auth0
    UI -->|Web3 Actions| Wallet
    
    Wallet -->|Transactions| Polygon
    Actions -->|Persist Data| DB
    Socket -->|Real-time Updates| UI
```

---

## 🧠 AI Adaptive User Flow

The core of FanFirst is its ability to adapt to the user's technical comfort level in real-time.

```mermaid
stateDiagram-v2
    [*] --> Tracking : User Visits Event
    Tracking --> Analysis : Collect Signals
    note right of Tracking
        - Wallet Installed?
        - Mouse Hesitation
        - Crypto Terms hovered
        - Previous History
    end note

    Analysis --> Classification : OpenAI Processing

    state Classification {
        direction LR
        Novice --> SimplifiedUI : Score < 25
        Curious --> HybridUI : Score 25-55
        Native --> Web3UI : Score > 55
    }

    SimplifiedUI --> AutoWallet : One-Click Buy
    HybridUI --> UserChoice : "Connect" or "Buy"
    Web3UI --> Metamask : Direct Connection

    AutoWallet --> Minting
    UserChoice --> Minting
    Metamask --> Minting

    Minting --> Success : Generate Art & QR
```

---

## ✨ Key Features

### 🤖 Adaptive AI Experience
- **Novice:** Sees a "Buy Ticket" button. Wallet is created invisibly in the background.
- **Curious:** Sees both options. AI Assistant offers guided help bubbles.
- **Native:** Sees full Web3 details (Hash, Gas, Wallet Connect).

### 🎨 Generative Ticket Art
Each ticket is a unique NFT visually generated based on the owner's wallet address.
- **Unique Gradient:** No two tickets look exactly alike.
- **Anti-Screenshot:** Dynamic elements verify authenticity.

### 🛡️ Anti-Bot & Scalper Protection
- **Behavioral Analysis:** AI detects non-human click patterns.
- **Resale Caps:** Smart contracts enforce maximum resale prices.
- **Royalties:** Artists get paid on every secondary sale.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 16, React | High-performance UI |
| **Styling** | Tailwind CSS 4, Framer Motion | Modern, animated aesthetics |
| **AI** | OpenAI API | Real-time user behavior classification |
| **Blockchain** | Polygon Amoy, Ethers.js | Low-cost NFT minting |
| **Wallets** | Privy, RainbowKit | Embedded & external wallet support |
| **Backend** | Node.js, Socket.io | Real-time events & updates |
| **Database** | PostgreSQL, Prisma | User data & indexing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API Key
- Auth0 Account

### Installation

```bash
# 1. Clone & Install
git clone https://github.com/your-repo/fanfirst.git
npm install

# 2. Environment Setup
cp .env.example .env.local
# (Fill in DB, Auth0, OpenAI, and Alchemy keys)

# 3. Database
npx prisma generate
npx prisma db push

# 4. Run Development
npm run dev:all
```

---

## 🔐 Environment Variables

Ensure your `.env.local` is populated:

```env
# Core
DATABASE_URL="postgresql://..."
AUTH0_SECRET="long_random_string"
AUTH0_BASE_URL="http://localhost:3000"

# Blockchain
NEXT_PUBLIC_POLYGON_RPC_URL="https://polygon-amoy.g.alchemy.com/..."

# AI & Features
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_PRIVY_APP_ID="clp..."
```

---

## 🤝 Contributing

We welcome contributions! Please fork the repo and submit a PR.
1. Fork it
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License
MIT License. Built with ❤️ for the fans.
