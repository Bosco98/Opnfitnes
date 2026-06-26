import { Logo } from "@/components/atoms";
import { TabBar, type TabItem } from "@/components/organisms";
import { WorkoutTab } from "@/pages/WorkoutTab";
import { AnalysisTab } from "@/pages/AnalysisTab";
import { SavedTab } from "@/pages/SavedTab";
import { SettingsTab } from "@/pages/SettingsTab";
import { useTheme } from "@/hooks/useTheme";
import { useHashTab } from "@/hooks/useHashTab";
import "./App.css";

type TabId = "workout" | "analysis" | "saved" | "settings";

const TAB_IDS: TabId[] = ["workout", "analysis", "saved", "settings"];

const TABS: TabItem<TabId>[] = [
  { id: "workout", label: "Workout", icon: "Dumbbell" },
  { id: "analysis", label: "Insights", icon: "BarChart3" },
  { id: "saved", label: "Saved", icon: "Heart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

export function App() {
  useTheme();
  const [tab, setTab] = useHashTab(TAB_IDS, "workout");

  return (
    <div className="app">
      <header className="app__bar">
        <Logo />
        {/* <span className="app__bar-tag">100% on-device</span> */}
      </header>

      <main className="app__main">
        <div hidden={tab !== "workout"}>
          <WorkoutTab
            onGoToSettings={() => setTab("settings")}
            onGoToSaved={() => setTab("saved")}
          />
        </div>
        <div hidden={tab !== "analysis"}>
          <AnalysisTab onGenerate={() => setTab("workout")} />
        </div>
        <div hidden={tab !== "saved"}>
          <SavedTab onGoToWorkout={() => setTab("workout")} />
        </div>
        <div hidden={tab !== "settings"}>
          <SettingsTab />
        </div>
      </main>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
}
