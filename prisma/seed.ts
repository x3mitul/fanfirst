import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { PrismaClient } from "./generated/client";

const prisma = new PrismaClient();

const eventsToSeed = [
    {
        id: "evt-1",
        title: "The Midnight Tour 2026",
        artist: "The Midnight",
        artistImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        venue: "Madison Square Garden",
        location: "New York, NY",
        date: new Date("2026-03-15"),
        time: "8:00 PM",
        image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop",
        description: "Experience the synthwave sensation live! The Midnight brings their iconic sound to MSG for one unforgettable night.",
        category: "concert",
        status: "on-sale",
        totalTickets: 620,
        soldTickets: 322,
        minFandomScore: 40,
        tiers: [
            { id: "tier-1", name: "General Admission", price: 89, available: 245, total: 500, benefits: ["Floor access"] },
            { id: "tier-2", name: "VIP Experience", price: 249, available: 48, total: 100, benefits: ["Premium viewing", "Exclusive merch"] }
        ]
    },
    {
        id: "evt-2",
        title: "Electronic Dreams Festival",
        artist: "Various Artists",
        artistImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
        venue: "Coachella Valley",
        location: "Indio, CA",
        date: new Date("2026-04-20"),
        time: "2:00 PM",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop",
        description: "Three days of non-stop electronic music featuring over 50 artists across 5 stages.",
        category: "festival",
        status: "on-sale",
        totalTickets: 5500,
        soldTickets: 3800,
        tiers: [
            { id: "tier-3", name: "3-Day Pass", price: 399, available: 1200, total: 5000, benefits: ["All stage access"] }
        ]
    },
    {
        id: "evt-3",
        title: "Lakers vs Celtics",
        artist: "LA Lakers",
        artistImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop",
        venue: "Crypto.com Arena",
        location: "Los Angeles, CA",
        date: new Date("2026-02-28"),
        time: "7:30 PM",
        image: "https://images.unsplash.com/photo-1504450758481-7338bbe7524a?w=800&h=400&fit=crop",
        description: "The classic NBA rivalry continues!",
        category: "sports",
        status: "on-sale",
        totalTickets: 2840,
        soldTickets: 1826,
        tiers: [
            { id: "tier-4", name: "Upper Level", price: 125, available: 890, total: 2000, benefits: ["Seat access"] }
        ]
    },
    {
        id: "evt-4",
        title: "Arctic Monkeys World Tour",
        artist: "Arctic Monkeys",
        artistImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
        venue: "The O2 Arena",
        location: "London, UK",
        date: new Date("2026-05-10"),
        time: "7:00 PM",
        image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=400&fit=crop",
        description: "The Sheffield legends return for their highly anticipated world tour.",
        category: "concert",
        status: "sold-out",
        totalTickets: 5000,
        soldTickets: 5000,
        tiers: [
            { id: "tier-5", name: "Standing", price: 95, available: 0, total: 3000, benefits: ["Floor access"] }
        ]
    },
    {
        id: "evt-5",
        title: "Taylor Swift | Eras Tour",
        artist: "Taylor Swift",
        artistImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
        venue: "SoFi Stadium",
        location: "Los Angeles, CA",
        date: new Date("2026-06-21"),
        time: "6:30 PM",
        image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=400&fit=crop",
        description: "The phenomenon continues! Taylor Swift extends her record-breaking Eras Tour.",
        category: "concert",
        status: "on-sale",
        totalTickets: 7200,
        soldTickets: 5925,
        tiers: [
            { id: "tier-6", name: "General Admission", price: 199, available: 800, total: 4000, benefits: ["Floor access"] },
            { id: "tier-7", name: "Lower Bowl", price: 299, available: 450, total: 3000, benefits: ["Reserved seating"] }
        ]
    },
    {
        id: "evt-6",
        title: "Dave Chappelle Live",
        artist: "Dave Chappelle",
        artistImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400&h=400&fit=crop",
        venue: "Radio City Music Hall",
        location: "New York, NY",
        date: new Date("2026-04-05"),
        time: "9:00 PM",
        image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&h=400&fit=crop",
        description: "The comedy legend returns to Radio City.",
        category: "comedy",
        status: "on-sale",
        totalTickets: 2000,
        soldTickets: 1140,
        tiers: [
            { id: "tier-8", name: "Orchestra", price: 175, available: 340, total: 1200, benefits: ["Premium viewing"] }
        ]
    }
];

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
    for (const event of eventsToSeed) {
        await prisma.event.upsert({
            where: { id: event.id },
            update: {},
            create: {
                id: event.id,
                title: event.title,
                artist: event.artist,
                artistImage: event.artistImage,
                venue: event.venue,
                location: event.location,
                date: event.date,
                time: event.time,
                image: event.image,
                description: event.description,
                category: event.category,
                status: event.status,
                totalTickets: event.totalTickets,
                soldTickets: event.soldTickets,
                minFandomScore: event.minFandomScore,
                ticketTiers: {
                    create: event.tiers.map(tier => ({
                        id: tier.id,
                        name: tier.name,
                        price: tier.price,
                        currency: "USD",
                        description: "See details",
                        available: tier.available,
                        total: tier.total,
                        benefits: tier.benefits,
                    })),
                },
            },
        });
        console.log(`✅ Upserted event: ${event.title}`);
    }

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
    });
