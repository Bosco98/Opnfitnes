import { Screen } from "@/components/templates";
import { SettingsPanel } from "@/components/organisms";

/** Tab 3 — profile, AI config, theme, reminders, and data. */
export function SettingsTab() {
  return (
    <Screen title="Settings">
      <SettingsPanel />
    </Screen>
  );
}
