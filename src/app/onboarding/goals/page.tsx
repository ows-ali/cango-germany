"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const GOALS = [
  { key: "study", label: "Study", icon: "school" },
  { key: "work", label: "Work", icon: "work" },
  { key: "daily_life", label: "Daily Life", icon: "shopping_cart" },
  { key: "friends", label: "Making Friends", icon: "groups" },
  { key: "travel", label: "Travel", icon: "train" },
];

export default function GoalsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(GOALS.map((g) => g.key)));

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center overflow-x-hidden">
      <header className="w-full max-w-[1280px] flex justify-between items-center px-4 md:px-16 py-4 h-16">
        <Logo size={32} />
        <button onClick={() => router.push("/onboarding/level")} className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">
          Skip
        </button>
      </header>

      <main className="flex-grow w-full max-w-[640px] px-4 md:px-16 py-12 flex flex-col">
        <div className="mb-12">
          <div className="w-12 h-1 bg-surface-container rounded-full mb-6">
            <div className="w-3/4 h-full bg-primary rounded-full transition-all duration-500" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            What are your goals in Germany?
          </h1>
          <p className="text-on-surface-variant" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: "24px" }}>
            Select all that apply to personalize your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 select-none">
          {GOALS.map((goal) => {
            const active = selected.has(goal.key);
            return (
              <div
                key={goal.key}
                onClick={() => toggle(goal.key)}
                className={`group relative flex items-center p-6 bg-surface-container-lowest border rounded-xl cursor-pointer hover:border-primary transition-all duration-200 active:scale-[0.98] ${active ? "border-primary bg-surface-container-low shadow-[0_0_0_2px_#091426]" : "border-outline-variant"}`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl">{goal.icon}</span>
                </div>
                <div className="ml-4 flex-grow">
                  <span className="text-lg text-on-surface">{goal.label}</span>
                </div>
                <div className={`absolute right-6 text-primary ${active ? "flex" : "hidden"}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-12 sticky bottom-0 bg-background/80 backdrop-blur-md pb-8">
          <button
            disabled={selected.size === 0}
            onClick={() => {
              sessionStorage.setItem("onboarding_goals", JSON.stringify([...selected]));
              router.push("/onboarding/level");
            }}
            className="w-full h-14 bg-primary text-on-primary font-semibold text-base rounded-xl shadow-lg hover:bg-primary-container transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            Continue
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          <p className="text-center mt-4 text-on-surface-variant text-xs" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
            You can change these settings later in your profile.
          </p>
        </div>
      </main>
    </div>
  );
}
