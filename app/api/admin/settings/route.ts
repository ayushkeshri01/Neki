import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { parseAdminSettingsInput } from "@/lib/settings";

export async function PUT(req: NextRequest) {
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
      return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
    }

    const parsedBody = parseAdminSettingsInput(body);
    if ("error" in parsedBody) {
      return NextResponse.json({ error: parsedBody.error }, { status: 400 });
    }

    const { allowedDomains, privacyPolicyVersion, autoLogoutDays } = parsedBody.value;

    await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        allowedDomains,
        privacyPolicyVersion,
        autoLogoutDays,
      },
      update: {
        allowedDomains,
        privacyPolicyVersion,
        autoLogoutDays,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
