import { Download } from "lucide-react";
import { Screen } from "@/components/templates";
import { SettingsPanel } from "@/components/organisms";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/** Tab 3 — profile, AI config, theme, reminders, and data. */
export function SettingsTab() {
  const { showInstall, install } = useInstallPrompt();

  return (
    <Screen
      title="Setting"
      action={
        showInstall ? (
          <button
            className="screen__action-badge"
            onClick={install}
            aria-label="Install app"
          >
            <Download size={14} strokeWidth={2.5} />
            <span className="screen__action-badge-label">Install</span>
          </button>
        ) : undefined
      }
    >
      <SettingsPanel />
    </Screen>
  );
}
