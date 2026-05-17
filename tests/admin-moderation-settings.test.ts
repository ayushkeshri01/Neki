import assert from "node:assert/strict";
import test from "node:test";
import {
  parseAdminSettingsInput,
  sanitizeAllowedDomains,
  sanitizeAppSettings,
} from "../lib/settings";
import { recordModerationEvent } from "../lib/moderation-events";

interface ModerationAuditRecord {
  actionType: string;
  actorUserId: string;
  targetUserId?: string | null;
  targetPostId?: string | null;
  reason?: string | null;
  metadata?: unknown;
  idempotencyKey?: string | null;
}

interface MockTransaction {
  moderationAudit: {
    upsert(args: {
      where: {
        actorUserId_idempotencyKey: {
          actorUserId: string;
          idempotencyKey: string;
        };
      };
      create: ModerationAuditRecord;
      update: Record<string, never>;
    }): Promise<{ id: string }>;
    create(args: { data: ModerationAuditRecord }): Promise<{ id: string }>;
  };
  userNotice: {
    upsert(args: {
      where: {
        userId_auditId_noticeType: {
          userId: string;
          auditId: string;
          noticeType: string;
        };
      };
      create: {
        userId: string;
        noticeType: string;
        title: string;
        body: string;
        payload?: unknown;
        auditId: string;
        visibleFromLoginAt?: Date;
      };
      update: {
        title: string;
        body: string;
        payload?: unknown;
        visibleFromLoginAt?: Date;
      };
    }): Promise<{ id: string }>;
  };
}

test("admin settings helpers normalize domains and accept valid input", () => {
  assert.deepEqual(
    sanitizeAllowedDomains([" Example.COM ", "EXAMPLE.com", "Team.org", "", "team.org"]),
    ["example.com", "team.org"]
  );

  const validInput = parseAdminSettingsInput({
    allowedDomains: [" Example.com ", "team.org"],
    privacyPolicyVersion: " v2 ",
  });

  assert.deepEqual(validInput, {
    value: {
      allowedDomains: ["example.com", "team.org"],
      privacyPolicyVersion: "v2",
      autoLogoutDays: null,
    },
  });

  const invalidInput = parseAdminSettingsInput({
    allowedDomains: ["not a domain"],
  });

  assert.ok("error" in invalidInput);
  assert.equal(invalidInput.error, "Invalid allowed domain: not a domain");
});

test("sanitizeAppSettings preserves valid persisted values", () => {
  assert.deepEqual(
    sanitizeAppSettings({
      allowedDomains: [" Main.Example.com ", "main.example.com", "support.example.org"],
      privacyPolicyVersion: "v3",
      autoLogoutDays: null,
    }),
    {
      allowedDomains: ["main.example.com", "support.example.org"],
      privacyPolicyVersion: "v3",
      autoLogoutDays: null,
    }
  );
});

test("recordModerationEvent uses idempotent writes when a retry key is present", async () => {
  const calls: string[] = [];

  const tx = {
    moderationAudit: {
      async upsert({ where, create, update }) {
        calls.push("audit-upsert");
        assert.deepEqual(where, {
          actorUserId_idempotencyKey: {
            actorUserId: "admin-1",
            idempotencyKey: "retry-key",
          },
        });
        assert.deepEqual(update, {});
        assert.equal(create.actionType, "ADMIN_BLACKLIST_USER");
        return { id: "audit-1" };
      },
      async create() {
        throw new Error("audit create should not be used when an idempotency key is present");
      },
    },
    userNotice: {
      async upsert({ where, create, update }) {
        calls.push("notice-upsert");
        assert.deepEqual(where, {
          userId_auditId_noticeType: {
            userId: "user-1",
            auditId: "audit-1",
            noticeType: "ACCOUNT_BLACKLISTED",
          },
        });
        assert.equal(create.auditId, "audit-1");
        assert.equal(update.body, "Policy violation");
        return { id: "notice-1" };
      },
    },
  } satisfies MockTransaction;

  const audit = await recordModerationEvent(tx as unknown as Parameters<typeof recordModerationEvent>[0], {
    actionType: "ADMIN_BLACKLIST_USER",
    actorUserId: "admin-1",
    targetUserId: "user-1",
    reason: "Policy violation",
    idempotencyKey: "retry-key",
    notice: {
      userId: "user-1",
      noticeType: "ACCOUNT_BLACKLISTED",
      title: "Blacklisted",
      body: "Policy violation",
      visibleFromLoginAt: new Date("2026-04-21T00:00:00.000Z"),
    },
  });

  assert.equal(audit.id, "audit-1");
  assert.deepEqual(calls, ["audit-upsert", "notice-upsert"]);
});

test("recordModerationEvent creates a fresh audit when no retry key is present", async () => {
  const calls: string[] = [];

  const tx = {
    moderationAudit: {
      async create({ data }) {
        calls.push("audit-create");
        assert.equal(data.idempotencyKey, null);
        assert.equal(data.reason, "Manual review");
        return { id: "audit-2" };
      },
      async upsert() {
        throw new Error("audit upsert should not be used without an idempotency key");
      },
    },
    userNotice: {
      async upsert({ where, create }) {
        calls.push("notice-upsert");
        assert.equal(where.userId_auditId_noticeType.auditId, "audit-2");
        assert.equal(create.title, "Message");
        return { id: "notice-2" };
      },
    },
  } satisfies MockTransaction;

  const audit = await recordModerationEvent(tx as unknown as Parameters<typeof recordModerationEvent>[0], {
    actionType: "ADMIN_REMOVE_USER",
    actorUserId: "admin-2",
    targetUserId: "user-2",
    reason: "Manual review",
    notice: {
      userId: "user-2",
      noticeType: "ACCOUNT_REMOVED",
      title: "Message",
      body: "Manual review",
    },
  });

  assert.equal(audit.id, "audit-2");
  assert.deepEqual(calls, ["audit-create", "notice-upsert"]);
});
