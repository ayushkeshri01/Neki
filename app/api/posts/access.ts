import { prisma } from "@/lib/prisma";

export interface CommunityScopedPost {
  id: string;
  authorId: string;
  status: "VISIBLE" | "HIDDEN" | "REMOVED";
  communities: {
    communityId: string;
    community: {
      members: {
        userId: string;
      }[];
    };
  }[];
}

export interface PostAccessFailure {
  ok: false;
  status: number;
  error: string;
}

export interface PostAccessSuccess {
  ok: true;
  post: CommunityScopedPost;
}

export type PostAccessResult = PostAccessSuccess | PostAccessFailure;

function failure(status: number, error: string): PostAccessFailure {
  return { ok: false, status, error };
}

export async function requireCommunityScopedPost(
  postId: string,
  userId: string
): Promise<PostAccessResult> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      status: true,
      communities: {
        select: {
          communityId: true,
          community: {
            select: {
              members: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!post) {
    return failure(404, "Post not found");
  }

  if (post.communities.length === 0) {
    return failure(404, "Post is not available in any community");
  }

  const isMember = post.communities.some((communityPost) =>
    communityPost.community.members.some((member) => member.userId === userId)
  );

  if (!isMember) {
    return failure(403, "You must be a member of one of this post's communities");
  }

  return { ok: true, post };
}
