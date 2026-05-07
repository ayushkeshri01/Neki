import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";

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
        adminId: true,
      },
    });

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (community.adminId === session.user.id) {
      return NextResponse.json(
        { error: "Admin cannot leave their own community" },
        { status: 400 }
      );
    }

    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this community" },
        { status: 400 }
      );
    }

    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });

    revalidatePath("/communities");
    revalidatePath(`/communities/${community.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving community:", error);
    return NextResponse.json(
      { error: "Failed to leave community" },
      { status: 500 }
    );
  }
}
