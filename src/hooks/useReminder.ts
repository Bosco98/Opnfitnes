import { useCallback, useEffect, useState } from "react";
import type { ReminderSettings } from "@/types";

type Permission = NotificationPermission | "unsupported";

function nextOccurrence(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

/**
 * Daily local reminder. While the app/tab is alive it schedules a timeout to the
 * next HH:MM and fires a Notification. (No backend → no push when fully closed;
 * the UI is honest about this.) Persistence of the setting lives in userStore.
 */
export function useReminder(reminder: ReminderSettings) {
  const [permission, setPermission] = useState<Permission>(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === "undefined") return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  useEffect(() => {
    if (!reminder.enabled || permission !== "granted") return;
    let timeout: number;

    const schedule = () => {
      timeout = window.setTimeout(() => {
        try {
          new Notification("Time to train 💪", {
            body: "Your OpnFitnes workout is one tap away.",
            icon: "/icon-192.png",
            tag: "fp-daily-reminder",
          });
        } catch {
          /* ignore */
        }
        schedule(); // re-arm for tomorrow
      }, nextOccurrence(reminder.time));
    };

    schedule();
    return () => window.clearTimeout(timeout);
  }, [reminder.enabled, reminder.time, permission]);

  return { permission, requestPermission };
}
