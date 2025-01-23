import { getNotifications } from "@/actions/notification.action";
import { getPosts } from "@/actions/post.action";

export type LayoutType = { children: React.ReactNode }

export type Posts = Awaited<ReturnType<typeof getPosts>>;

export type Post = Posts[number];

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
export type Notification = Notifications[number];

export type DeleteAlertDialogProps = {
    onDelete: () => Promise<void>;
    description?: string;
    isDeleting: boolean;
    title?: string;
}