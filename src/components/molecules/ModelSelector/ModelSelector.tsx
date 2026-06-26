import type { OpenRouterModel } from "@/types";
import { Badge, Button, Icon } from "@/components/atoms";
import "./ModelSelector.css";

export interface ModelSelectorProps {
  models: OpenRouterModel[];
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  /** label suffix, e.g. "free" or "paid" */
  kind: "free" | "paid";
}

/** Native <select> dressed up — keeps platform a11y, adds count + reload. */
export function ModelSelector({
  models,
  value,
  onChange,
  loading,
  error,
  onReload,
  kind,
}: ModelSelectorProps) {
  return (
    <div className="model-sel">
      <div className="model-sel__top">
        <Badge tone={kind === "free" ? "success" : "accent"}>
          {loading ? "Loading…" : `${models.length} ${kind} models`}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          iconLeft="RotateCcw"
          onClick={onReload}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="model-sel__error">
          <Icon name="AlertTriangle" size={15} /> {error}
        </p>
      ) : (
        <div className="model-sel__field">
          <select
            className="model-sel__select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading || models.length === 0}
            aria-label={`Select a ${kind} model`}
          >
            {models.length === 0 && <option value="">No models found</option>}
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <Icon name="ChevronDown" size={18} className="model-sel__chevron" />
        </div>
      )}
    </div>
  );
}
