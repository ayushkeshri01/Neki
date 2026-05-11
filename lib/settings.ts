import { prisma } from "@/lib/prisma";

export const DEFAULT_PRIVACY_POLICY_VERSION = "v1";

export interface AppSettingsValues {
  allowedDomains: string[];
  privacyPolicyVersion: string;
  autoLogoutDays: number | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAllowedDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^@+/, "");
}

function isValidAllowedDomain(domain: string): boolean {
  if (!domain || domain.length > 253) {
    return false;
  }

  if (domain === "localhost") {
    return true;
  }

  if (!domain.includes(".") || /\s/.test(domain)) {
    return false;
  }

  return domain.split(".").every((segment) => {
    if (!segment || segment.length > 63) {
      return false;
    }

    return /^(?!-)[a-z0-9-]+(?<!-)$/.test(segment);
  });
}

export function sanitizeAllowedDomains(allowedDomains: string[]): string[] {
  const normalizedDomains: string[] = [];
  const seen = new Set<string>();

  for (const domain of allowedDomains) {
    const normalizedDomain = normalizeAllowedDomain(domain);

    if (!normalizedDomain || !isValidAllowedDomain(normalizedDomain)) {
      continue;
    }

    if (seen.has(normalizedDomain)) {
      continue;
    }

    seen.add(normalizedDomain);
    normalizedDomains.push(normalizedDomain);
  }

  return normalizedDomains;
}

export function parseAllowedDomainsInput(
  allowedDomains: unknown
): { allowedDomains: string[]; error?: string } {
  if (!Array.isArray(allowedDomains)) {
    return { allowedDomains: [], error: "Invalid allowed domains" };
  }

  const normalizedDomains: string[] = [];
  const seen = new Set<string>();

  for (const domain of allowedDomains) {
    if (typeof domain !== "string") {
      return { allowedDomains: [], error: "Allowed domains must be strings" };
    }

    const normalizedDomain = normalizeAllowedDomain(domain);
    if (!normalizedDomain) {
      continue;
    }

    if (!isValidAllowedDomain(normalizedDomain)) {
      return {
        allowedDomains: [],
        error: `Invalid allowed domain: ${domain.trim() || domain}`,
      };
    }

    if (seen.has(normalizedDomain)) {
      continue;
    }

    seen.add(normalizedDomain);
    normalizedDomains.push(normalizedDomain);
  }

  return { allowedDomains: normalizedDomains };
}

export function normalizePrivacyPolicyVersion(value: unknown): string {
  const normalizedVersion = String(value || "").trim();
  return normalizedVersion || DEFAULT_PRIVACY_POLICY_VERSION;
}

export function normalizeAutoLogoutDays(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

export function sanitizeAppSettings(settings: {
  allowedDomains: string[];
  privacyPolicyVersion: string;
  autoLogoutDays: number | null;
}): AppSettingsValues {
  return {
    allowedDomains: sanitizeAllowedDomains(settings.allowedDomains),
    privacyPolicyVersion: normalizePrivacyPolicyVersion(settings.privacyPolicyVersion),
    autoLogoutDays: normalizeAutoLogoutDays(settings.autoLogoutDays),
  };
}

export function parseAdminSettingsInput(
  input: unknown
): { value: AppSettingsValues } | { error: string } {
  if (!isPlainObject(input)) {
    return { error: "Invalid settings payload" };
  }

  const { allowedDomains, privacyPolicyVersion, autoLogoutDays } = input;
  const parsedAllowedDomains = parseAllowedDomainsInput(allowedDomains);

  if (parsedAllowedDomains.error) {
    return { error: parsedAllowedDomains.error };
  }

  return {
    value: {
      allowedDomains: parsedAllowedDomains.allowedDomains,
      privacyPolicyVersion: normalizePrivacyPolicyVersion(privacyPolicyVersion),
      autoLogoutDays: normalizeAutoLogoutDays(autoLogoutDays),
    },
  };
}

export async function getOrCreateSettings() {
  return prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      allowedDomains: [],
      privacyPolicyVersion: DEFAULT_PRIVACY_POLICY_VERSION,
      autoLogoutDays: null,
    },
  });
}
