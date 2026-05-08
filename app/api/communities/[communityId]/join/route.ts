import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { checkAndAwardBadges } from "@/lib/badges";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { communityId } = await params;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const existing = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    await prisma.communityMember.create({
      data: {
        userId: session.user.id,
        communityId,
      },
    });

    await checkAndAwardBadges(session.user.id);

    revalidatePath("/communities");
    revalidatePath(`/communities/${community.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining community:", error);
    return NextResponse.json(
      { error: "Failed to join community" },
      { status: 500 }
    );
  }
}
