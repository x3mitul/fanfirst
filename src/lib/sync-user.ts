"use server";

import { prisma } from "./prisma";

interface Auth0User {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}

/**
 * Syncs an Auth0 user to the PostgreSQL database.
 * Creates a new user if they don't exist, or updates their info if they do.
 */
export async function syncUser(auth0User: Auth0User) {
    return prisma.user.upsert({
        where: { auth0Id: auth0User.sub },
        update: {
            name: auth0User.name,
            avatar: auth0User.picture,
        },
        create: {
            auth0Id: auth0User.sub,
            email: auth0User.email,
            name: auth0User.name,
            avatar: auth0User.picture,
        },
    });
}

/**
 * Gets a user by their Auth0 ID.
 */
export async function getUserByAuth0Id(auth0Id: string) {
    return prisma.user.findUnique({
        where: { auth0Id },
    });
}

/**
 * Gets a user by their database ID.
 */
export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: { id },
    });
}
