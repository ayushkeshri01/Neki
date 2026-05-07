import { getOrCreateSettings } from "@/lib/settings";
import { AdminSettingsContent } from "./admin-settings-content";

export default async function AdminSettingsPage() {
  const settings = await getOrCreateSettings();

  return (
    <AdminSettingsContent
      initialSettings={{
        allowedDomains: settings.allowedDomains,
        privacyPolicyVersion: settings.privacyPolicyVersion ?? "v1",
      }}
    />
  );
}
