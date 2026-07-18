"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    if (localStorage.getItem("installPromptDismissed") === "true") {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (installed || dismissed || !deferredPrompt) return null;

  return (
    <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
      <p className="text-sm text-on-surface">
        Install <span className="font-semibold">CanGo</span> for the best experience
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDismiss}
          className="text-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg transition-colors"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="bg-primary text-on-primary text-sm font-semibold px-4 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
        >
          Install
        </button>
      </div>
    </div>
  );
}
