"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Scenario {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export default function HomePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then(setScenarios).catch(() => {});
  }, []);

  const levelLabels: Record<number, string> = { 1: "A2", 2: "B1", 3: "B2" };
  const icons: Record<string, string> = {
    transportation: "train",
    doctor: "medical_services",
    "job-interview": "work",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-surface sticky top-0 z-40 border-b border-surface-container">
        <div className="flex justify-between items-center w-full px-margin-mobile h-16 max-w-[1280px] mx-auto">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="#1e293b" strokeWidth="3" />
            <path d="M16 6V26" stroke="#1e293b" strokeWidth="3" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-full">
              <span className="text-xs font-semibold text-on-surface">500 XP</span>
            </div>
            <div className="flex items-center gap-1 bg-secondary-container px-2 py-1 rounded-full">
              <span className="text-xs font-semibold text-on-secondary-container">12 🔥</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-on-secondary-container">person</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-margin-mobile py-6 pb-24">
        <section className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-1">Guten Morgen!</h1>
          <p className="text-lg text-on-surface-variant">Ready to master your German scenarios today?</p>
        </section>

        {/* Daily Goal */}
        <section className="mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-outline-variant/30">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xs text-secondary uppercase tracking-wider mb-2 font-semibold">Today's Goal</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-on-surface">0</span>
                  <span className="text-base text-on-surface-variant">/ 100 XP</span>
                </div>
                <div className="mt-4 w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: "0%" }} />
                </div>
              </div>
              <button className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold shadow-sm">
                Quick Session
              </button>
            </div>
          </div>
        </section>

        {/* My Germany */}
        <section className="space-y-6">
          <h3 className="font-headline text-2xl text-on-surface">My Germany</h3>

          {scenarios.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <p>Loading scenarios...</p>
            </div>
          )}

          {scenarios.map((s) => (
            <Link key={s.id} href={`/scenario/${s.slug}`}>
              <div className="bg-white flex flex-col rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-primary-container to-primary relative flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-white/80">{icons[s.slug] || "school"}</span>
                  <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-primary border border-surface-container">
                    {levelLabels[2] || "B1"}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-xl">{icons[s.slug] || "school"}</span>
                    <h4 className="text-lg font-bold text-on-surface">{s.name}</h4>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">{s.description}</p>
                  <div className="flex items-center justify-end">
                    <span className="border border-primary text-primary px-6 py-2 rounded-lg font-semibold text-xs">
                      Start
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
