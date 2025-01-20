"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function syncUser() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (existingUser) return existingUser;

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            },
        });

        return dbUser;
    } catch (error) {
        console.log("Error in syncUser", error);
    }
}



export async function getUserByClerkId(clerkId: string) {
    // get - query by Id...
    return prisma.user.findUnique({
        where: { clerkId },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                },
            },
        },
    });
}



export async function getUserIdFromDB() {
    const { userId: clerkId } = await auth();

    if (!clerkId) return null;

    const user = await getUserByClerkId(clerkId);

    if (!user) throw new Error("User not found");

    return user.id;
}



export async function getRandomUsers() {
    try {
        const userId = await getUserIdFromDB();
        if (!userId) return [];

        // get 3 random users exclude ourselves & users that we already follow
        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { NOT: { id: userId } }, // remove self from users follow list
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userId,
                                },
                            },
                        },
                    },
                ],
            },

            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },

            take: 3,
        });

        return randomUsers;
    } catch (error) {
        console.log("Error fetching random users", error);
        return [];
    }
}



export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getUserIdFromDB();
        if (!userId) return;

        if (userId === targetUserId) throw new Error("You cannot follow yourself");

        const followIdRelation = {
            followerId: userId,
            followingId: targetUserId,
        }

        const existingFollow = await prisma.follows.findUnique({
            where: { followerId_followingId: followIdRelation }
        });

        if (existingFollow) {
            // un-follow
            await prisma.follows.delete({
                where: { followerId_followingId: followIdRelation }
            });
        } else {
            // follow

            // transaction :- all || noting...
            await prisma.$transaction([

                // ✅ task 1:- create follow relation
                prisma.follows.create({ data: followIdRelation }),

                // ✅ task 2:- create notification
                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId, // user being followed
                        creatorId: userId, // user following
                    },
                }),
            ]);
        }

        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return { success: false, error: "Error toggling follow" };
    }
}