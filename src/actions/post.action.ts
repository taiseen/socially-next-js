"use server";

// ⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕
// ⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕
// ⭕⭕⭕⭕⭕ These functions are run in the server side  ⭕⭕⭕⭕
// ⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕
// ⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕

import { getUserIdFromDB } from "./user.action";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";


export async function createPost(content: string, image: string) {

    try {
        const userId = await getUserIdFromDB();
        if (!userId) return;

        const data = {
            authorId: userId,
            content,
            image,
        }

        const post = await prisma.post.create({ data });

        revalidatePath("/"); // purge || re-validate the cache for the home page

        return { isSuccess: true, post };

    } catch (error) {
        console.error("🔴 Failed to create post:", error);
        return { isSuccess: false, error: "Failed to create post" };
    }
}



export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({

            orderBy: { createdAt: "desc" },

            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                    },
                },

                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                image: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },

                likes: {
                    select: { userId: true }
                },

                _count: {
                    select: { likes: true, comments: true },
                },
            },
        });

        return posts;

    } catch (error) {
        console.log("Error in getPosts", error);
        throw new Error("Failed to fetch posts");
    }
}



export async function createComment(postId: string, content: string) {
    try {
        const userId = await getUserIdFromDB();

        if (!userId) return;
        if (!content) throw new Error("Content is required");

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });

        if (!post) throw new Error("Post not found");

        // Create comment and notification in a transaction
        const [comment] = await prisma.$transaction(async (tx) => {
            // Create comment first
            const newComment = await tx.comment.create({
                data: {
                    content,
                    authorId: userId,
                    postId,
                },
            });

            // Create notification if commenting on someone else's post
            if (post.authorId !== userId) {
                await tx.notification.create({
                    data: {
                        type: "COMMENT",
                        userId: post.authorId,
                        creatorId: userId,
                        postId,
                        commentId: newComment.id,
                    },
                });
            }

            return [newComment];
        });

        revalidatePath(`/`);
        return { success: true, comment };
    } catch (error) {
        console.error("Failed to create comment:", error);
        return { success: false, error: "Failed to create comment" };
    }
}



export async function deletePost(postId: string) {
    try {
        const userId = await getUserIdFromDB();

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });

        if (!post) throw new Error("Post not found");
        if (post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

        await prisma.post.delete({ where: { id: postId } });

        revalidatePath("/"); // purge the cache
        return { success: true };
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { success: false, error: "Failed to delete post" };
    }
}



export async function toggleLike(postId: string) {
    try {
        const userId = await getUserIdFromDB();
        if (!userId) return;

        const userPostIdRelation = { userId, postId };

        // check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: userPostIdRelation
            },
        });

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });

        if (!post) throw new Error("Post not found");

        if (existingLike) {
            // unlike
            await prisma.like.delete({
                where: {
                    userId_postId: userPostIdRelation
                },
            });
        } else {
            // like and create notification (only if liking someone else's post)
            await prisma.$transaction([
                prisma.like.create({
                    data: userPostIdRelation
                }),
                ...(post.authorId !== userId
                    ? [
                        prisma.notification.create({
                            data: {
                                type: "LIKE",
                                userId: post.authorId, // recipient (post author)
                                creatorId: userId, // person who liked
                                postId,
                            },
                        }),
                    ]
                    : []),
            ]);
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle like:", error);
        return { success: false, error: "Failed to toggle like" };
    }
}