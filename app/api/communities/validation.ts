export interface CommunityCreateInput {
  name: string;
  description: string | null;
  image: string | null;
}

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

function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

export function validateCommunityCreateBody(body: unknown): ValidationResult<CommunityCreateInput> {
  if (!body || typeof body !== "object") {
    return failure(400, "Request body is invalid");
  }

  const { name, description, image } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return failure(400, "Name is required");
  }

  const trimmedName = name.trim();
  const descriptionValue = normalizeNullableText(description);
  const imageValue = normalizeNullableText(image);

  return {
    ok: true,
    value: {
      name: trimmedName,
      description: descriptionValue,
      image: imageValue,
    },
  };
}

export function buildCommunitySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
