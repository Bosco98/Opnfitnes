import { Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/cn";
import "./TabBar.css";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon: IconName;
}

export interface TabBarProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
}

/** Sticky bottom navigation. The app's primary wayfinding. */
export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: TabBarProps<T>) {
  return (
    <nav className="tabbar" aria-label="Primary">
      <ul className="tabbar__list">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.id} className="tabbar__item">
              <button
                type="button"
                className={cn("tabbar__btn", isActive && "tabbar__btn--active")}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onChange(tab.id)}
              >
                <span className="tabbar__icon">
                  <Icon
                    name={tab.icon}
                    size={22}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                </span>
                <span className="tabbar__label">{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
