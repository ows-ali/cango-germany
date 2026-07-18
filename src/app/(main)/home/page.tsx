"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useContent } from "@/lib/content-context";
import { InstallPrompt } from "@/components/InstallPrompt";

interface Scenario {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

const LEVEL_MAP: Record<string, number> = { A2: 1, B1: 2, B2: 3 };
const REVERSE_LEVEL_MAP: Record<number, string> = { 1: "A2", 2: "B1", 3: "B2" };
const HERO_IMAGES: Record<string, string> = {
  transportation: "/images/scenario-transportation.jpg",
  doctor: "/images/scenario-doctor.jpg",
  "job-interview": "/images/scenario-job-interview.jpg",
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const { content: rawScenarios, loaded } = useContent();
  const scenarios = (rawScenarios as Scenario[]) || [];
  const [userLevel, setUserLevel] = useState<string>("B1");
  const [scenarioLevels, setScenarioLevels] = useState<Record<number, string>>({});

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/profile").then((r) => r.json()).then((u) => {
      if (u.cefrLevel) setUserLevel(u.cefrLevel);
    }).catch(() => { });
    if (scenarios.length > 0) {
      const ids = scenarios.map((s) => s.id).join(",");
      fetch(`/api/user/scenario-setting/batch?ids=${ids}`)
        .then((r) => r.json())
        .then((res) => {
          const map: Record<number, string> = {};
          for (const [id, data] of Object.entries(res)) {
            const levelId = (data as { selectedLevelId: number | null }).selectedLevelId;
            if (levelId && REVERSE_LEVEL_MAP[levelId]) map[Number(id)] = REVERSE_LEVEL_MAP[levelId];
          }
          setScenarioLevels(map);
        }).catch(() => { });
    }
  }, [status, scenarios.length]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-margin-mobile py-6 pb-24">
        <InstallPrompt />

        <section className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-1">Guten Morgen!</h1>
          <p className="text-lg text-on-surface mb-3">Ready to master your next Germany experience today?</p>
          <p className="text-sm italic underline text-on-surface">Our no experience is locked and never will be.</p>
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
        <section className="flex flex-col gap-6">
          <h3 className="font-headline text-2xl text-on-surface">My Germany</h3>

          {!loaded && scenarios.length === 0 && (
            <div className="flex flex-col gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
                  <div className="h-40 bg-surface-container-highest" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-surface-container-highest rounded w-1/3" />
                    <div className="h-4 bg-surface-container-highest rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {scenarios.map((s) => (
            <Link key={s.id} href={`/scenario/${s.slug}`}>
              <div className="bg-white flex flex-col rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
                <div className="h-40 relative overflow-hidden">
                  <img src={HERO_IMAGES[s.slug] || "/images/onboarding-bg.jpg"} alt={s.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-primary border border-surface-container">
                    {scenarioLevels[s.id] || userLevel}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-bold text-on-surface mb-1">{s.name}</h4>
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

          {/* Coming Soon */}
          <div className="bg-white rounded-xl overflow-hidden border-2 border-dashed border-outline-variant/50 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">rocket_launch</span>
            <h4 className="text-lg font-bold text-on-surface mb-1">More Coming Soon</h4>
            <p className="text-sm text-on-surface-variant">Exciting new scenarios are on the way — stay tuned!</p>
          </div>
        </section>
      </div>
    </div>
  );
}
