import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_POST_COMMUNITIES,
  MAX_POST_IMAGES,
  parsePostCommunityIds,
  validatePostContent,
  validatePostImages,
} from "../app/api/posts/validation";
import {
  buildCommunitySlug,
  validateCommunityCreateBody,
} from "../app/api/communities/validation";

function makeImage(type: string, size: number): File {
  return { type, size } as File;
}

test("validatePostContent trims content and enforces length", () => {
  const valid = validatePostContent("  hello world  ");
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.value, "hello world");
  }

  const missing = validatePostContent(null);
  assert.equal(missing.ok, false);
  if (!missing.ok) {
    assert.equal(missing.status, 400);
  }

  const tooLong = validatePostContent("a".repeat(10001));
  assert.equal(tooLong.ok, false);
  if (!tooLong.ok) {
    assert.equal(tooLong.status, 400);
  }
});

test("validatePostImages enforces image type and count limits", () => {
  const validImages = validatePostImages([
    makeImage("image/jpeg", 1024),
    makeImage("image/png", 2048),
    makeImage("image/webp", 512),
    makeImage("image/gif", 1),
  ]);
  assert.equal(validImages.ok, true);
  if (validImages.ok) {
    assert.equal(validImages.value.length, MAX_POST_IMAGES);
  }

  const invalidType = validatePostImages([makeImage("application/pdf", 1024)]);
  assert.equal(invalidType.ok, false);
  if (!invalidType.ok) {
    assert.equal(invalidType.status, 400);
  }

  const tooManyImages = validatePostImages(
    Array.from({ length: MAX_POST_IMAGES + 1 }, () => makeImage("image/jpeg", 1024))
  );
  assert.equal(tooManyImages.ok, false);
  if (!tooManyImages.ok) {
    assert.equal(tooManyImages.status, 400);
  }
});

test("parsePostCommunityIds rejects malformed payloads and duplicate communities", () => {
  const valid = parsePostCommunityIds(JSON.stringify([" community-a ", "community-b"]));
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.deepEqual(valid.value, ["community-a", "community-b"]);
  }

  const malformed = parsePostCommunityIds("not-json");
  assert.equal(malformed.ok, false);
  if (!malformed.ok) {
    assert.equal(malformed.status, 400);
  }

  const tooManyCommunities = parsePostCommunityIds(
    JSON.stringify(Array.from({ length: MAX_POST_COMMUNITIES + 1 }, (_, index) => `community-${index}`))
  );
  assert.equal(tooManyCommunities.ok, false);
  if (!tooManyCommunities.ok) {
    assert.equal(tooManyCommunities.status, 400);
  }

  const duplicates = parsePostCommunityIds(JSON.stringify(["community-a", "community-a"]));
  assert.equal(duplicates.ok, false);
  if (!duplicates.ok) {
    assert.equal(duplicates.status, 400);
  }
});

test("validateCommunityCreateBody trims values and slugifies names", () => {
  const valid = validateCommunityCreateBody({
    name: "  Neighborhood Helpers  ",
    description: "  Volunteer updates  ",
    image: "  https://example.com/image.png  ",
  });

  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.value.name, "Neighborhood Helpers");
    assert.equal(valid.value.description, "Volunteer updates");
    assert.equal(valid.value.image, "https://example.com/image.png");
  }

  const missingName = validateCommunityCreateBody({});
  assert.equal(missingName.ok, false);
  if (!missingName.ok) {
    assert.equal(missingName.status, 400);
  }

  assert.equal(buildCommunitySlug("  Neighborhood Helpers!! "), "neighborhood-helpers");
});
