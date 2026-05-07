import assert from "node:assert/strict";
import test from "node:test";
import { UserStatus } from "@prisma/client";
import { getAccountBlockMessage, isAccountActive } from "../lib/account-status";
import {
  getSignupAllowedDomains,
  isSignupEmailDomainAllowed,
} from "../lib/user-access";
import { hashRegistrationToken, normalizeEmail } from "../lib/registration-token";

test("account status helpers treat blocked and banned accounts as inactive", () => {
  assert.equal(isAccountActive(UserStatus.ACTIVE, false), true);
  assert.equal(isAccountActive(UserStatus.ACTIVE, true), false);
  assert.equal(isAccountActive(UserStatus.BLACKLISTED, false), false);
  assert.equal(isAccountActive(UserStatus.REMOVED, false), false);

  assert.equal(
    getAccountBlockMessage(UserStatus.BLACKLISTED, "Policy violation", null, false),
    "Blacklisted:Policy violation"
  );
  assert.equal(
    getAccountBlockMessage(UserStatus.REMOVED, "Account removed", null, false),
    "Removed:Account removed"
  );
  assert.equal(
    getAccountBlockMessage(UserStatus.ACTIVE, null, "Manual ban", true),
    "Blacklisted:Manual ban"
  );
});

test("registration token and email helpers normalize deterministically", () => {
  process.env.AUTH_SECRET = "test-secret-for-auth-security";

  assert.equal(normalizeEmail("  USER@Example.COM  "), "user@example.com");

  const token = "registration-token";
  const hashedToken = hashRegistrationToken(token);

  assert.equal(hashedToken, hashRegistrationToken(token));
  assert.notEqual(hashedToken, token);
});

test("signup domain helpers expose all configured domains", () => {
  assert.deepEqual(
    getSignupAllowedDomains(["corp.example", "gmail.com", "alpha.example", "alpha.example", "beta.example"]),
    ["corp.example", "gmail.com", "alpha.example", "beta.example"]
  );

  assert.equal(
    isSignupEmailDomainAllowed("alpha.example", ["corp.example", "alpha.example", "beta.example"]),
    true
  );
  assert.equal(
    isSignupEmailDomainAllowed("corp.example", ["corp.example", "alpha.example", "beta.example"]),
    true
  );
  assert.equal(
    isSignupEmailDomainAllowed("gmail.com", ["corp.example", "gmail.com", "alpha.example"]),
    true
  );
  assert.equal(
    isSignupEmailDomainAllowed("unknown.example", ["corp.example", "alpha.example", "beta.example"]),
    false
  );
});
