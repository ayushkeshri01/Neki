import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { buildCommunitySlug, validateCommunityCreateBody } from "./validation";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body is invalid" },
        { status: 400 }
      );
    }

    const validation = validateCommunityCreateBody(body);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const { name, description, image } = validation.value;
    const slug = buildCommunitySlug(name);

    if (!slug) {
      return NextResponse.json(
        { error: "Community name must contain letters or numbers" },
        { status: 400 }
      );
    }

    const existing = await prisma.community.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Community with this name already exists" },
        { status: 400 }
      );
    }

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        image,
        adminId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}
