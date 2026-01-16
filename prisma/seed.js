require("dotenv").config({ path: ".env" });

const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting database seed...");

    // Create users
    const user1 = await prisma.user.upsert({
        where: { email: "alex@example.com" },
        update: {},
        create: {
            auth0Id: "auth0|mock-user-1",
            email: "alex@example.com",
            name: "Alex Thompson",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
            fandomScore: 78,
            spotifyConnected: true,
            eventsAttended: 12,
            vouchesGiven: 3,
            vouchesReceived: 5,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: "sarah@example.com" },
        update: {},
        create: {
            auth0Id: "auth0|mock-user-2",
            email: "sarah@example.com",
            name: "Sarah Martinez",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
            fandomScore: 95,
            spotifyConnected: true,
            eventsAttended: 25,
        },
    });

    console.log("✅ Created users:", user1.name, user2.name);

    // Create events
    const event1 = await prisma.event.upsert({
        where: { id: "evt-1" },
        update: {},
        create: {
            id: "evt-1",
            title: "The Midnight Tour 2026",
            artist: "The Midnight",
            artistImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            venue: "Madison Square Garden",
            location: "New York, NY",
            date: new Date("2026-03-15"),
            time: "8:00 PM",
            image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop",
            description: "Experience the synthwave sensation live!",
            category: "concert",
            status: "on-sale",
            totalTickets: 620,
            soldTickets: 322,
            minFandomScore: 40,
            ticketTiers: {
                create: [
                    {
                        id: "tier-1",
                        name: "General Admission",
                        price: 89,
                        currency: "USD",
                        description: "Standing room on the floor",
                        available: 245,
                        total: 500,
                        benefits: ["Floor access", "Digital collectible"],
                    },
                    {
                        id: "tier-2",
                        name: "VIP Experience",
                        price: 249,
                        currency: "USD",
                        description: "Premium viewing area with perks",
                        available: 48,
                        total: 100,
                        benefits: ["Premium viewing area", "Exclusive merch", "Early entry"],
                    },
                ],
            },
        },
    });

    const event2 = await prisma.event.upsert({
        where: { id: "evt-2" },
        update: {},
        create: {
            id: "evt-2",
            title: "Electronic Dreams Festival",
            artist: "Various Artists",
            artistImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
            venue: "Coachella Valley",
            location: "Indio, CA",
            date: new Date("2026-04-20"),
            time: "2:00 PM",
            image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop",
            description: "Three days of non-stop electronic music!",
            category: "festival",
            status: "on-sale",
            totalTickets: 5500,
            soldTickets: 3800,
            ticketTiers: {
                create: [
                    {
                        id: "tier-3",
                        name: "3-Day Pass",
                        price: 399,
                        currency: "USD",
                        description: "Full festival access",
                        available: 1200,
                        total: 5000,
                        benefits: ["All stage access", "Festival grounds"],
                    },
                ],
            },
        },
    });

    console.log("✅ Created events:", event1.title, event2.title);

    // Create a community
    const community1 = await prisma.community.upsert({
        where: { id: "community-1" },
        update: {},
        create: {
            id: "community-1",
            name: "The Midnight Fans",
            artistId: "artist-1",
            artistName: "The Midnight",
            artistImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            description: "Official community for The Midnight fans",
            memberCount: 15420,
        },
    });

    console.log("✅ Created community:", community1.name);

    // Create community posts
    await prisma.communityPost.upsert({
        where: { id: "post-1" },
        update: {},
        create: {
            id: "post-1",
            communityId: community1.id,
            authorId: user1.id,
            title: "Madison Square Garden Meetup",
            content: "Can't wait for the MSG show! Anyone else going?",
            type: "discussion",
            upvotes: 234,
            downvotes: 12,
            commentCount: 45,
        },
    });

    await prisma.communityPost.upsert({
        where: { id: "post-2" },
        update: {},
        create: {
            id: "post-2",
            communityId: community1.id,
            authorId: user2.id,
            title: "New POAP Badge",
            content: "Just minted my POAP from the last show!",
            type: "photo",
            images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop"],
            upvotes: 567,
            downvotes: 4,
            commentCount: 89,
            isPinned: true,
        },
    });

    console.log("✅ Created community posts");
    console.log("🎉 Database seed completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
