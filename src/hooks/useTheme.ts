import { useEffect } from "react";
import { useUserSettings } from "./useSettings";

/**
 * Applies the theme preference to <html data-theme>. "system" removes the
 * attribute so the CSS `prefers-color-scheme` path takes over. Also keeps the
 * browser theme-color meta in sync for the PWA status bar.
 */
export function useTheme() {
  const { user, patch } = useUserSettings();
  const theme = user.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  return { theme, setTheme: (t: typeof theme) => patch({ theme: t }) };
}
