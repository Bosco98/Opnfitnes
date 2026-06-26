import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

/** Captures the browser's PWA install prompt and exposes a trigger function. */
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    // Pick up the event if it fired before React mounted
    if (window.__pwaInstallPrompt) {
      setPrompt(window.__pwaInstallPrompt);
      window.__pwaInstallPrompt = null;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setPrompt(null);
    } else {
      alert('To install: open your browser menu and choose "Add to Home Screen" or "Install app".');
    }
  };

  return { showInstall: !isStandalone, canInstall: prompt !== null, install };
}
