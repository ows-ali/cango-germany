"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStats } from "@/lib/stats-context";

interface ScenarioData {
  id: number;
  name: string;
  description: string | null;
  levels: {
    level: { id: number; name: string; order: number };
    modules: {
      id: number;
      title: string;
      description: string | null;
      order: number;
      experiences: {
        id: number;
        title: string;
        duration: string | null;
        xpReward: number;
        order: number;
      }[];
    }[];
  }[];
}

const LEVEL_MAP: Record<string, number> = { A2: 1, B1: 2, B2: 3 };
const HERO_IMAGES: Record<string, string> = {
  transportation: "/images/scenario-transportation.jpg",
  doctor: "/images/scenario-doctor.jpg",
  "job-interview": "/images/scenario-job-interview.jpg",
};

export default function ScenarioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { refreshStats } = useStats();
  const [data, setData] = useState<ScenarioData | null>(null);
  const [activeLevel, setActiveLevel] = useState(2);
  const [expProgress, setExpProgress] = useState<Record<number, { completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean }>>({});

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((all) => {
      const found = all.find((s: { slug: string }) => s.slug === slug);
      setData(found || null);
      // After data loads, collect all experience IDs and fetch progress
      const expIds = new Set<number>();
      found?.levels?.forEach((l: { modules: { experiences: { id: number }[] }[] }) =>
        l.modules.forEach((m: { experiences: { id: number }[] }) =>
          m.experiences.forEach((e: { id: number }) => expIds.add(e.id))
        )
      );
      if (expIds.size > 0) {
        fetch(`/api/user/experience/progress/batch?ids=${[...expIds].join(",")}`)
          .then((r) => r.json()).then(setExpProgress).catch(() => {});
      }
    }).catch(() => {});
    if (session?.user?.id) {
      fetch("/api/user/profile").then((r) => r.json()).then((u) => {
        if (u.cefrLevel && LEVEL_MAP[u.cefrLevel]) setActiveLevel(LEVEL_MAP[u.cefrLevel]);
      }).catch(() => {});
      refreshStats();
    }
  }, [slug, session]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  const currentLevel = data.levels?.find((l) => l.level.id === activeLevel) || data.levels?.[0];
  const levelLabel = currentLevel?.level.name || "B1";

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* Hero */}
      <header className="relative h-64 md:h-80 w-full overflow-hidden">
        <img src={HERO_IMAGES[slug as string] || "/images/onboarding-bg.jpg"} alt={data.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-margin-mobile">
          <div className="flex justify-between items-center">
            <Link href="/home" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <button
              onClick={() => {
                const levels = data.levels || [];
                const idx = levels.findIndex((l) => l.level.id === activeLevel);
                const next = (idx + 1) % levels.length;
                setActiveLevel(levels[next].level.id);
              }}
              className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/20 text-white cursor-pointer hover:bg-white/20 transition-colors"
            >
              <span className="text-xs font-semibold">{levelLabel}</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          </div>
          <div>
            <h1 className="font-headline text-3xl md:text-4xl text-white mb-2">{data.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-white rounded-full" />
              </div>
                <span className="text-xs text-white/90">
                  {currentLevel?.modules.reduce((sum, m) =>
                    sum + m.experiences.filter((e) => expProgress[e.id]?.completed).length, 0
                  ) || 0}
                  /{currentLevel?.modules.reduce((sum, m) => sum + m.experiences.length, 0) || 0} Experiences
                </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile py-6">
        <div className="space-y-6">
          {currentLevel?.modules.map((mod, idx) => (
            <div key={mod.id} className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
              <button
                onClick={(e) => {
                  const target = e.currentTarget.nextElementSibling as HTMLElement;
                  const icon = e.currentTarget.querySelector(".accordion-icon") as HTMLElement;
                  if (target) {
                    target.classList.toggle("hidden");
                    icon?.classList.toggle("rotate-180");
                  }
                }}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">
                      {idx === 0 ? "train" : idx === 1 ? "directions_transit" : "warning"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{mod.title}</h3>
                    <p className="text-xs text-on-surface-variant">
                      {mod.experiences.length} Experiences
                    </p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 accordion-icon ${idx === 0 ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              <div className={`px-4 pb-6 space-y-3 ${idx !== 0 ? "hidden" : ""}`}>
                {mod.experiences.map((exp) => {
                  const prog = expProgress[exp.id];
                  const isCompleted = prog?.completed;
                  const hasBonus = prog?.bonusXpClaimed;
                  return (
                    <Link
                      key={exp.id}
                      href={`/experience/${exp.id}`}
                      className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${hasBonus ? "text-amber-500" : isCompleted ? "text-on-surface-variant" : "text-primary"}`}
                          style={hasBonus ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {hasBonus ? "crown" : isCompleted ? "crown" : "play_circle"}
                        </span>
                        <span className="text-sm font-medium text-on-surface">{exp.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant">{exp.duration}</span>
                        {isCompleted ? (
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${hasBonus ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                            +{exp.xpReward + (hasBonus ? 20 : 0)} XP
                          </span>
                        ) : (
                          <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-semibold">START</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
