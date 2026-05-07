import { NextResponse } from "next/server";
import { getOrCreateSettings } from "@/lib/settings";
import { getSignupAllowedDomains } from "@/lib/user-access";

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    const domains = getSignupAllowedDomains(settings.allowedDomains);
    return NextResponse.json({
      domains,
      privacyPolicyVersion: settings.privacyPolicyVersion,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
