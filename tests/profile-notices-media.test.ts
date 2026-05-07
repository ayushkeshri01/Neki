import assert from "node:assert/strict";
import test, { before } from "node:test";

process.env.AUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||= "postgresql://dogood:dogood123@localhost:5432/dogood";
process.env.AWS_REGION ||= "us-east-1";
process.env.AWS_S3_BUCKET ||= "dogood-uploads";
process.env.AWS_ACCESS_KEY_ID ||= "test-access-key";
process.env.AWS_SECRET_ACCESS_KEY ||= "test-secret-key";

let profileRoute!: typeof import("../app/api/me/profile/route");
let noticesDialog!: typeof import("../components/layout/user-notices-dialog");
let s3!: typeof import("../lib/s3");

before(async () => {
  profileRoute = await import("../app/api/me/profile/route");
  noticesDialog = await import("../components/layout/user-notices-dialog");
  s3 = await import("../lib/s3");
});

test("profile fields trim whitespace and collapse blanks to null", () => {
  assert.equal(profileRoute.sanitizeInput("  <b>Ada</b>  "), "&lt;b&gt;Ada&lt;/b&gt;");
  assert.equal(profileRoute.normalizeProfileField("  Ada Lovelace  "), "Ada Lovelace");
  assert.equal(profileRoute.normalizeProfileField("   "), null);
});

test("notice acknowledgement only reports success for ok responses", async () => {
  const okResult = await noticesDialog.acknowledgeNoticeRequest(
    "notice-1",
    async () =>
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
  );

  assert.deepEqual(okResult, { ok: true });

  const failedResult = await noticesDialog.acknowledgeNoticeRequest(
    "notice-1",
    async () =>
      new Response(JSON.stringify({ error: "already handled" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      })
  );

  assert.equal(failedResult.ok, false);
  assert.equal(failedResult.error, "already handled");
});

test("S3 helpers sanitize file names and decode bucket keys safely", async () => {
  const originalSend = s3.s3Client.send;
  const recordedKeys: string[] = [];
  const mockSend = async (command: { input?: { Key?: string } }) => {
    if (command.input?.Key) {
      recordedKeys.push(command.input.Key);
    }

    return {};
  };

  (s3.s3Client as typeof s3.s3Client & { send: typeof s3.s3Client.send }).send = mockSend;

  const originalNow = Date.now;
  Date.now = () => 1700000000000;

  try {
    const uploadedUrl = await s3.uploadToS3(
      Buffer.from("avatar"),
      "../my avatar.png",
      "image/png"
    );

    assert.equal(
      uploadedUrl,
      "https://dogood-uploads.s3.us-east-1.amazonaws.com/uploads/1700000000000-my-avatar.png"
    );
    assert.equal(recordedKeys[0], "uploads/1700000000000-my-avatar.png");
    assert.equal(s3.getS3ObjectKey(uploadedUrl), "uploads/1700000000000-my-avatar.png");
    assert.equal(
      s3.getS3ObjectKey(
        "https://s3.us-east-1.amazonaws.com/dogood-uploads/uploads/1700000000000-my-avatar.png"
      ),
      "uploads/1700000000000-my-avatar.png"
    );

    const deleted = await s3.deleteFromS3(uploadedUrl);
    assert.equal(deleted, true);
    assert.equal(recordedKeys[1], "uploads/1700000000000-my-avatar.png");
  } finally {
    (s3.s3Client as typeof s3.s3Client & { send: typeof s3.s3Client.send }).send = originalSend;
    Date.now = originalNow;
  }
});
