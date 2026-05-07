export const MAX_POST_IMAGES = 4;
export const MAX_POST_COMMUNITIES = 5;
export const MAX_POST_CONTENT_LENGTH = 10000;
export const ALLOWED_POST_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export interface ValidationSuccess<T> {
  ok: true;
  value: T;
}

export interface ValidationFailure {
  ok: false;
  status: number;
  error: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function failure(status: number, error: string): ValidationFailure {
  return { ok: false, status, error };
}

export function validatePostContent(content: FormDataEntryValue | null): ValidationResult<string> {
  if (typeof content !== "string") {
    return failure(400, "Content is required");
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return failure(400, "Content is required");
  }

  if (trimmedContent.length > MAX_POST_CONTENT_LENGTH) {
    return failure(400, `Content must be ${MAX_POST_CONTENT_LENGTH} characters or less`);
  }

  return { ok: true, value: trimmedContent };
}

export function validatePostImages(
  images: FormDataEntryValue[]
): ValidationResult<File[]> {
  if (images.some((image) => typeof image === "string")) {
    return failure(400, "Image upload is invalid");
  }

  const fileEntries = images as File[];

  if (fileEntries.length > MAX_POST_IMAGES) {
    return failure(400, `You can upload up to ${MAX_POST_IMAGES} images`);
  }

  for (const image of fileEntries) {
    if (image.size === 0) {
      continue;
    }

    if (!ALLOWED_POST_IMAGE_TYPES.includes(image.type as (typeof ALLOWED_POST_IMAGE_TYPES)[number])) {
      return failure(400, "Only JPEG, PNG, WebP, and GIF images are allowed");
    }

    if (image.size > 5 * 1024 * 1024) {
      return failure(400, "Images must be 5MB or less");
    }
  }

  return { ok: true, value: fileEntries };
}

export function parsePostCommunityIds(
  communitiesValue: FormDataEntryValue | null
): ValidationResult<string[]> {
  if (typeof communitiesValue !== "string") {
    return failure(400, "Select at least one community");
  }

  let parsedCommunities: unknown;
  try {
    parsedCommunities = JSON.parse(communitiesValue);
  } catch {
    return failure(400, "Community selection is invalid");
  }

  if (!Array.isArray(parsedCommunities)) {
    return failure(400, "Community selection is invalid");
  }

  if (parsedCommunities.length === 0) {
    return failure(400, "Select at least one community");
  }

  if (parsedCommunities.length > MAX_POST_COMMUNITIES) {
    return failure(400, `You can post to up to ${MAX_POST_COMMUNITIES} communities`);
  }

  const communityIds = new Set<string>();
  for (const communityId of parsedCommunities) {
    if (typeof communityId !== "string") {
      return failure(400, "Community selection is invalid");
    }

    const trimmedCommunityId = communityId.trim();
    if (!trimmedCommunityId) {
      return failure(400, "Community selection is invalid");
    }

    if (communityIds.has(trimmedCommunityId)) {
      return failure(400, "Duplicate communities are not allowed");
    }

    communityIds.add(trimmedCommunityId);
  }

  return { ok: true, value: [...communityIds] };
}
