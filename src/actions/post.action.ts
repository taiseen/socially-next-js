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

        console.log({ data });


        const post = await prisma.post.create({
            data: {
                authorId: userId,
                content,
                image,
            }
        });

        console.log(post);

        revalidatePath("/"); // purge || re-validate the cache for the home page

        return { isSuccess: true, post };

    } catch (error) {
        console.error("🔴 Failed to create post:", error);
        return { isSuccess: false, error: "Failed to create post" };
    }
}