import { UserStatus } from "@prisma/client";

export function isAccountActive(status: UserStatus | null | undefined, banned: boolean): boolean {
  if (!status) {
    return !banned;
  }

  return status === UserStatus.ACTIVE && !banned;
}

export function getAccountBlockMessage(
  status: UserStatus | null | undefined,
  statusReason?: string | null,
  banReason?: string | null,
  banned = false
): string | null {
  if (status === UserStatus.BLACKLISTED) {
    return `Blacklisted:${statusReason || "Your account has been blacklisted."}`;
  }

  if (status === UserStatus.REMOVED) {
    return `Removed:${statusReason || "Your account has been removed."}`;
  }

  if (banned) {
    return `Blacklisted:${banReason || "Your account has been blacklisted."}`;
  }

  if (banReason) {
    return `Blacklisted:${banReason}`;
  }

  return null;
}
