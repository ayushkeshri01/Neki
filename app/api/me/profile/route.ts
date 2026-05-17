import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromS3, uploadToS3 } from "@/lib/s3";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BIO_LENGTH = 500;
const MAX_NAME_LENGTH = 100;

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function normalizeProfileField(input: string): string | null {
  const sanitized = sanitizeInput(input);
  return sanitized.length > 0 ? sanitized : null;
}

function validateImageFile(file: File): string | null {
  if (!file.type || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Invalid image type. Allowed: jpg, png, gif, webp";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Image too large. Max 5MB allowed";
  }
  return null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        points: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  let uploadedImageUrl: string | undefined;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        image: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const bio = formData.get("bio") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (name !== null && name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be less than ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (bio !== null && bio.length > MAX_BIO_LENGTH) {
      return NextResponse.json(
        { error: `Bio must be less than ${MAX_BIO_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (imageFile && imageFile.size > 0) {
      const validationError = validateImageFile(imageFile);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const contentType = imageFile.type || "image/jpeg";
      uploadedImageUrl = await uploadToS3(buffer, imageFile.name, contentType);
    }

    const updateData: { name?: string | null; bio?: string | null; image?: string } = {};

    if (name !== null) updateData.name = normalizeProfileField(name);
    if (bio !== null) updateData.bio = normalizeProfileField(bio);
    if (uploadedImageUrl) updateData.image = uploadedImageUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No profile changes provided" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
      },
    });

    if (uploadedImageUrl && existingUser.image && existingUser.image !== uploadedImageUrl) {
      await deleteFromS3(existingUser.image);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);

    if (uploadedImageUrl) {
      await deleteFromS3(uploadedImageUrl);
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
