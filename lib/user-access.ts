import { prisma } from "@/lib/prisma";
import { getAccountBlockMessage, isAccountActive } from "./account-status";

export interface UserAccessState {
  isActive: boolean;
  blockMessage: string | null;
}

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase();
}

export async function isActiveUser(userId: string): Promise<boolean> {
  return (await getUserAccessState(userId)).isActive;
}

export function getSignupAllowedDomains(allowedDomains: string[]): string[] {
  const normalizedDomains = allowedDomains.map(normalizeDomain).filter(Boolean);
  return Array.from(new Set(normalizedDomains));
}

export function isSignupEmailDomainAllowed(
  emailDomain: string,
  allowedDomains: string[]
): boolean {
  const normalizedDomain = normalizeDomain(emailDomain);

  if (!normalizedDomain) {
    return false;
  }

  return getSignupAllowedDomains(allowedDomains).includes(normalizedDomain);
}

export async function getUserAccessState(userId: string): Promise<UserAccessState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      status: true,
      banned: true,
      statusReason: true,
      banReason: true,
    },
  });

  if (!user) {
    return {
      isActive: false,
      blockMessage: null,
    };
  }

  const isActive = isAccountActive(user.status, user.banned);

  return {
    isActive,
    blockMessage: isActive
      ? null
      : getAccountBlockMessage(user.status, user.statusReason, user.banReason, user.banned),
  };
}
