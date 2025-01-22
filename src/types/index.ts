import { getPosts } from "@/actions/post.action";

export type LayoutType = { children: React.ReactNode }

export type Posts = Awaited<ReturnType<typeof getPosts>>;

export type Post = Posts[number];

export type DeleteAlertDialogProps = {
    onDelete: () => Promise<void>;
    description?: string;
    isDeleting: boolean;
    title?: string;
}