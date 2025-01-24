import { getProfileByUsername, getUserPosts } from "@/actions/profile.action";
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


type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type UserPosts = Awaited<ReturnType<typeof getUserPosts>>;


export type ProfilePageClientProps = {
    user: NonNullable<User>;
    posts: UserPosts;
    likedPosts: UserPosts;
    isFollowing: boolean;
}

export type ProfilePageParamsType = {
    params: { username: string };
}