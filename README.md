# FanFirst
# FanFirst - Fair Ticketing for Real Fans

An AI-powered NFT ticketing platform built with Next.js that prioritizes real fans over bots and scalpers.

## Features

- 🎯 **Anti-Bot Protection** - AI behavioral analysis blocks automated scripts
- 🎵 **Spotify Integration** - Prove your fandom with listening history
- 🤝 **Community Vouching** - Build trust through social reputation
- 🎫 **NFT Tickets** - Blockchain-based tickets on Polygon
- 🔄 **Fair Resale Market** - Price-capped secondary market with artist royalties
- 📱 **Dynamic QR Codes** - Rotating verification codes prevent screenshots

## Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── events/      # Event-related components
│   ├── layout/      # Layout components
│   └── ui/          # UI components
└── lib/             # Utilities and types
    ├── types.ts     # TypeScript types
    ├── utils.ts     # Utility functions
    ├── store.ts     # Zustand state management
    └── mock-data.ts # Demo data
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs)
