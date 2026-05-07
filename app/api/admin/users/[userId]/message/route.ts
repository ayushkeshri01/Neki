import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { userId } = await params;
    const { message } = await req.json();
    const trimmedMessage = String(message || "").trim();

    if (!trimmedMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (trimmedMessage.length > 500) {
      return NextResponse.json(
        { error: "Message must be 500 characters or less" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          adminMessage: trimmedMessage,
        },
      });

      await tx.userNotice.create({
        data: {
          userId,
          noticeType: "ADMIN_MESSAGE",
          title: "Message from admin",
          body: trimmedMessage,
          visibleFromLoginAt: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
