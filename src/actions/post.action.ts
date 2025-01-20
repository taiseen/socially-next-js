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