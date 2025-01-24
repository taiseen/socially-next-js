import ProfilePageClient from "./ProfilePageClient";
import { ProfilePageParamsType } from "@/types";
import { notFound } from "next/navigation";
import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";

export async function generateMetadata({ params }: ProfilePageParamsType) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: ProfilePageParamsType) {
  const user = await getProfileByUsername(params.username);
  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      isFollowing={isCurrentUserFollowing}
      likedPosts={likedPosts}
      posts={posts}
      user={user}
    />
  );
}

export default ProfilePageServer;
