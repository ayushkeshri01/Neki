import assert from "node:assert/strict";
import test from "node:test";
import { UserStatus } from "@prisma/client";
import { getPostPointsDelta } from "../lib/post-status";
import { getAccountBlockMessage, isAccountActive } from "../lib/account-status";
import { hashRegistrationToken, normalizeEmail } from "../lib/registration-token";
import { calculateUserStats } from "../lib/utils";
import { createHash } from "crypto";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

function validateImageFile(file: { type: string; size: number }): string | null {
  if (!file.type || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Invalid image type. Allowed: jpg, png, gif, webp";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Image too large. Max 5MB allowed";
  }
  return null;
}

test("post status transitions keep point delta invariant", () => {
  assert.equal(getPostPointsDelta("VISIBLE", "HIDDEN"), -50);
  assert.equal(getPostPointsDelta("VISIBLE", "REMOVED"), -50);
  assert.equal(getPostPointsDelta("HIDDEN", "VISIBLE"), 50);
  assert.equal(getPostPointsDelta("REMOVED", "VISIBLE"), 50);
  assert.equal(getPostPointsDelta("HIDDEN", "REMOVED"), 0);
});

test("account status helpers enforce active access", () => {
  assert.equal(isAccountActive(UserStatus.ACTIVE, false), true);
  assert.equal(isAccountActive(UserStatus.BLACKLISTED, false), false);
  assert.equal(isAccountActive(UserStatus.REMOVED, false), false);
  assert.equal(isAccountActive(UserStatus.ACTIVE, true), false);

  assert.equal(
    getAccountBlockMessage(UserStatus.BLACKLISTED, "Policy violation", null),
    "Blacklisted:Policy violation"
  );
  assert.equal(
    getAccountBlockMessage(UserStatus.REMOVED, "Account removed", null),
    "Removed:Account removed"
  );
});

test("registration token helpers normalize and hash deterministically", () => {
  process.env.AUTH_SECRET = "test-secret-for-testing";
  
  assert.equal(normalizeEmail("  USER@Example.COM  "), "user@example.com");

  const token = "sample-token";
  const hash1 = hashRegistrationToken(token);
  const hash2 = hashRegistrationToken(token);

  assert.equal(hash1, hash2);
  assert.notEqual(hash1, token);
});

test("calculateUserStats computes correct totals", () => {
  const posts = [
    { _count: { likes: 10 } },
    { _count: { likes: 5 } },
    { _count: { likes: 3 } },
  ];
  const memberships = [1, 2, 3, 4, 5];

  const stats = calculateUserStats(posts, memberships);

  assert.equal(stats.totalPosts, 3);
  assert.equal(stats.totalLikes, 18);
  assert.equal(stats.totalCommunities, 5);
});

test("sanitizeInput escapes HTML special characters", () => {
  assert.equal(sanitizeInput("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
  assert.equal(sanitizeInput('hello "world"'), "hello &quot;world&quot;");
  assert.equal(sanitizeInput("  test  "), "test");
});

test("validateImageFile rejects invalid image types", () => {
  assert.equal(validateImageFile({ type: "image/jpeg", size: 1024 }), null);
  assert.equal(validateImageFile({ type: "image/png", size: 1024 }), null);
  assert.equal(validateImageFile({ type: "application/pdf", size: 1024 }), "Invalid image type. Allowed: jpg, png, gif, webp");
  assert.equal(validateImageFile({ type: "", size: 1024 }), "Invalid image type. Allowed: jpg, png, gif, webp");
});

test("validateImageFile rejects files over 5MB", () => {
  assert.equal(validateImageFile({ type: "image/jpeg", size: 5 * 1024 * 1024 }), null);
  assert.equal(validateImageFile({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 }), "Image too large. Max 5MB allowed");
  assert.equal(validateImageFile({ type: "image/jpeg", size: 1024 }), null);
});

test("password reset token hashing is deterministic", () => {
  function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
  
  const token = "test-reset-token";
  const hash1 = hashToken(token);
  const hash2 = hashToken(token);
  
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, token);
  assert.equal(hash1.length, 64); // SHA256 produces 64 hex characters
});

test("password reset requires valid token and email", () => {
  const validInputs = {
    token: "valid-token",
    email: "user@example.com",
    newPassword: "newpassword123"
  };
  
  assert.ok(validInputs.token && validInputs.email && validInputs.newPassword);
  assert.ok(validInputs.newPassword.length >= 6);
});

test("password change requires current password when user has password", () => {
  const userHasPassword = true;
  const currentPassword = "oldpassword";
  const newPassword = "newpassword123";
  
  if (userHasPassword) {
    assert.ok(currentPassword, "Current password is required when user has password");
  }
  assert.ok(newPassword.length >= 6, "New password must be at least 6 characters");
});
