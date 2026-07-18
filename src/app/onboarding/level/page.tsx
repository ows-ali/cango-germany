"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/Logo";

const LEVELS = [
  { id: "A2", name: "Pre-Intermediate", desc: "Can understand sentences and frequently used expressions." },
  { id: "B1", name: "Intermediate", desc: "Can deal with most situations likely to arise while travelling." },
  { id: "B2", name: "Upper Intermediate", desc: "Can interact with a degree of fluency and spontaneity." },
];

export default function LevelPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected || !session?.user?.id) return;
    setSaving(true);

    const goals = JSON.parse(sessionStorage.getItem("onboarding_goals") || "[]");

    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals, cefrLevel: selected }),
    });

    sessionStorage.removeItem("onboarding_goals");
    router.push("/home");
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center w-full px-4 md:px-16 max-w-[1280px] mx-auto h-16 sticky top-0 z-50">
        <Logo size={32} />
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined">person</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-[600px] w-full space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl text-on-surface font-bold" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
              Choose your German Level
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: "24px" }}>
              Select the proficiency that best describes your current language skills to personalize your experience.
            </p>
          </div>

          <div className="space-y-4">
            {LEVELS.map((level) => {
              const active = selected === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setSelected(level.id)}
                  className={`w-full text-left p-6 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-all duration-300 ${
                    active
                      ? "border-2 border-primary bg-surface-container-low"
                      : "border border-outline-variant bg-surface-container-lowest hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(19,27,46,0.08)]"
                  }`}
                  style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold text-xl" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {level.id}
                    </div>
                    <div>
                      <h3 className="text-lg text-on-surface font-semibold" style={{ fontFamily: "Manrope, sans-serif" }}>{level.name}</h3>
                      <p className="text-sm text-on-surface-variant">{level.desc}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-6 pt-4">
            <button
              disabled={!selected || saving}
              onClick={handleContinue}
              className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary rounded-full font-semibold text-base hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Continue"}
            </button>
            <button className="text-on-surface-variant text-sm hover:text-primary transition-colors flex items-center gap-1">
              Not sure? Take an assessment later.
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 right-0 -z-10 opacity-10 pointer-events-none hidden lg:block">
        <div className="w-[600px] h-[600px] rounded-full" style={{ background: "linear-gradient(to top left, rgba(9,20,38,0.3), transparent)", filter: "blur(120px)" }} />
      </div>
    </div>
  );
}
