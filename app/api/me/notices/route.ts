import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notices = await prisma.userNotice.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ notices });
  } catch (error) {
    console.error("Error fetching user notices:", error);
    return NextResponse.json(
      { error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noticeIds } = (await req.json()) as { noticeIds?: string[] };

    if (!Array.isArray(noticeIds) || noticeIds.length === 0) {
      return NextResponse.json(
        { error: "Notice ids are required" },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.userNotice.updateMany({
      where: {
        userId: session.user.id,
        id: { in: noticeIds },
        acknowledgedAt: null,
      },
      data: {
        acknowledgedAt: now,
      },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error acknowledging user notices:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge notices" },
      { status: 500 }
    );
  }
}
