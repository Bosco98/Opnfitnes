import { useState } from "react";
import { FALLBACK_MODEL_ID } from "@/lib/constants";
import { useAiSettings, useUserSettings } from "@/hooks/useSettings";
import { useModels } from "@/hooks/useModels";
import { useReminder } from "@/hooks/useReminder";
import { useHistory } from "@/hooks/useHistory";
import {
  Badge,
  Button,
  Icon,
  SegmentedControl,
  Slider,
  TextArea,
  TextField,
  Toggle,
} from "@/components/atoms";
import { FormRow, ModelSelector, Section } from "@/components/molecules";
import type { ExperienceLevel, ThemePreference } from "@/types";
import "./SettingsPanel.css";

/** All persisted preferences: profile, AI config, theme, reminders, data. Each
   slice reads/writes its own store via a hook — this organism just lays out. */
export function SettingsPanel() {
  const { user, patch: patchUser } = useUserSettings();
  const { ai, patch: patchAi, hasKey } = useAiSettings();
  const { models, free, paid, loading, error, reload } = useModels(ai.apiKey);
  const { permission, requestPermission } = useReminder(user.reminder);
  const { history, clear } = useHistory();

  const [showKey, setShowKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const activeModels = ai.usePaidModels ? paid : free;

  const handlePaidToggle = (usePaid: boolean) => {
    // moving between pools — reset the selection to a sensible default
    const pool = usePaid ? paid : free;
    patchAi({
      usePaidModels: usePaid,
      selectedModelId: pool[0]?.id ?? (usePaid ? "" : FALLBACK_MODEL_ID),
    });
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const ok = await requestPermission();
      if (!ok) return; // user denied — keep it off
    }
    patchUser({ reminder: { ...user.reminder, enabled } });
  };

  return (
    <div className="settings">
      {/* Profile */}
      <Section title="Profile" icon="PersonStanding">
        <FormRow label="Your name" htmlFor="set-name" description="Used to greet you on the workout tab.">
          <TextField
            id="set-name"
            iconLeft="PersonStanding"
            placeholder="e.g. Alex"
            value={user.name}
            maxLength={30}
            onChange={(e) => patchUser({ name: e.target.value })}
          />
        </FormRow>
        <br />
        <FormRow
          label="Fitness level"
          description="Sets your 30-day workout target — Rookie 30, Beginner 45, Advanced 60."
        >
          <SegmentedControl<ExperienceLevel>
            ariaLabel="Fitness level"
            value={user.fitnessLevel}
            onChange={(fitnessLevel) => patchUser({ fitnessLevel })}
            segments={[
              { value: "rookie", label: "Rookie" },
              { value: "beginner", label: "Beginner" },
              { value: "advanced", label: "Advanced" },
            ]}
          />
        </FormRow>
        <br />
        <FormRow
          label="Additional instructions"
          htmlFor="set-instructions"
          description={'Sent to the AI on every workout. e.g. "no jumping", "I have a bad knee".'}
        >
          <TextArea
            id="set-instructions"
            placeholder="e.g. avoid high-impact movements, keep rest periods short…"
            value={user.additionalInstructions}
            maxLength={500}
            rows={3}
            onChange={(e) => patchUser({ additionalInstructions: e.target.value })}
          />
        </FormRow>
      </Section>

      {/* AI */}
      <Section
        title="OpenRouter"
        icon="KeyRound"
        caption="Bring your own key — it never leaves this device."
      >
        <FormRow
          label="API key"
          htmlFor="set-key"
          description="Create one at openrouter.ai/keys."
        >
          <TextField
            id="set-key"
            iconLeft="KeyRound"
            type={showKey ? "text" : "password"}
            placeholder="sk-or-…"
            autoComplete="off"
            spellCheck={false}
            value={ai.apiKey}
            onChange={(e) => patchAi({ apiKey: e.target.value.trim() })}
            trailing={
              <button
                type="button"
                className="settings__reveal"
                aria-label={showKey ? "Hide key" : "Show key"}
                onClick={() => setShowKey((s) => !s)}
              >
                <Icon name={showKey ? "X" : "Sparkles"} size={16} />
              </button>
            }
          />
        </FormRow>
        <br />
        <div className="settings__status">
          {hasKey ? (
            <Badge tone="success" icon="Check">
              Key saved
            </Badge>
          ) : (
            <Badge tone="warn" icon="AlertTriangle">
              No key yet
            </Badge>
          )}
          <a
            className="settings__link"
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get a key <Icon name="ExternalLink" size={13} />
          </a>
        </div>
        <br />
        <FormRow
          label="Use paid models"
          layout="inline"
          description="Off uses free models. On unlocks GPT, Claude, Gemini & more."
        >
          <Toggle
            checked={ai.usePaidModels}
            onChange={handlePaidToggle}
            label="Use paid models"
          />
        </FormRow>
        <br />
        <FormRow label="Model" description="Picked automatically — change any time.">
          <ModelSelector
            models={activeModels}
            value={ai.selectedModelId}
            onChange={(id) => patchAi({ selectedModelId: id })}
            loading={loading}
            error={error}
            onReload={reload}
            kind={ai.usePaidModels ? "paid" : "free"}
          />
        </FormRow>
        {models.length > 0 && !ai.selectedModelId && (
          <p className="settings__hint">
            <Icon name="Info" size={14} /> No model selected — we&apos;ll use a
            free default.
          </p>
        )}
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon="Sun">
        <FormRow label="Theme" layout="inline">
          <SegmentedControl<ThemePreference>
            ariaLabel="Theme"
            value={user.theme}
            onChange={(theme) => patchUser({ theme })}
            compact
            segments={[
              { value: "system", label: "System", icon: "Monitor" },
              { value: "light", label: "Light", icon: "Sun" },
              { value: "dark", label: "Dark", icon: "Moon" },
            ]}
          />
        </FormRow>
      </Section>

      {/* Audio */}
      <Section title="Audio" icon="Volume2">
        <FormRow label="Clock volume" layout="stack">
          <Slider<number>
            stops={[0, 0.25, 0.5, 0.75, 1]}
            value={user.clockVolume}
            onChange={(clockVolume) => patchUser({ clockVolume })}
            ariaLabel="Clock volume"
            formatTick={(v) => (v === 0 ? "Off" : `${v * 100}%`)}
          />
        </FormRow>
      </Section>

      {/* Reminders */}
      <Section
        title="Daily reminder"
        icon="BellRing"
        caption="A nudge to keep your streak alive."
      >
        <FormRow label="Remind me daily" layout="inline">
          <Toggle
            checked={user.reminder.enabled}
            onChange={handleReminderToggle}
            label="Daily reminder"
            disabled={permission === "unsupported"}
          />
        </FormRow>

        {user.reminder.enabled && (
          <FormRow label="Time" htmlFor="set-reminder" layout="inline">
            <TextField
              id="set-reminder"
              type="time"
              value={user.reminder.time}
              onChange={(e) =>
                patchUser({
                  reminder: { ...user.reminder, time: e.target.value },
                })
              }
            />
          </FormRow>
        )}

        {permission === "unsupported" ? (
          <p className="settings__hint">
            <Icon name="Info" size={14} /> Notifications aren&apos;t supported on
            this browser.
          </p>
        ) : (
          <p className="settings__hint">
            <Icon name="Info" size={14} /> Reminders fire while OpnFitnes is
            open in a tab or installed as an app.
          </p>
        )}
      </Section>

      {/* Data */}
      <Section
        title="Your data"
        icon="Trash2"
        caption={`${history.length} workout${history.length === 1 ? "" : "s"} stored · last 30 days`}
      >
        {confirmClear ? (
          <div className="settings__confirm">
            <p>Delete all workout history? This can&apos;t be undone.</p>
            <div className="settings__confirm-row">
              <Button
                variant="danger"
                iconLeft="Trash2"
                onClick={() => {
                  clear();
                  setConfirmClear(false);
                }}
              >
                Delete all
              </Button>
              <Button variant="ghost" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            iconLeft="Trash2"
            disabled={history.length === 0}
            onClick={() => setConfirmClear(true)}
          >
            Clear history
          </Button>
        )}
      </Section>

      <p className="settings__foot">
        OpnFitnes runs entirely in your browser. No accounts, no servers.
      </p>
    </div>
  );
}
