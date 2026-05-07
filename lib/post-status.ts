import { PostStatus } from "@prisma/client";

export function getPostPointsDelta(fromStatus: PostStatus, toStatus: PostStatus): number {
  if (fromStatus === toStatus) {
    return 0;
  }

  if (fromStatus === PostStatus.VISIBLE && toStatus === PostStatus.HIDDEN) {
    return -50;
  }

  if (fromStatus === PostStatus.VISIBLE && toStatus === PostStatus.REMOVED) {
    return -50;
  }

  if (fromStatus === PostStatus.HIDDEN && toStatus === PostStatus.VISIBLE) {
    return 50;
  }

  if (fromStatus === PostStatus.REMOVED && toStatus === PostStatus.VISIBLE) {
    return 50;
  }

  return 0;
}
