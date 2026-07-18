"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStats } from "@/lib/stats-context";
import { useContent } from "@/lib/content-context";

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
  const { data: session, status } = useSession();
  const { refreshStats } = useStats();
  const { content: rawData, getScenarioBySlug, loaded } = useContent();
  const found = getScenarioBySlug(slug) as ScenarioData | null;
  const [data, setData] = useState<ScenarioData | null>(null);
  const [activeLevel, setActiveLevel] = useState(2);
  const [expProgress, setExpProgress] = useState<Record<number, { completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean }>>({});
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (found) setData(found);
  }, [found]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!data) return;

    // Resolve level once: saved setting > profile CEFR > default B1
    let levelId = 2;
    Promise.all([
      fetch(`/api/user/scenario-setting?scenarioId=${data.id}`).then((r) => r.json()),
      fetch("/api/user/profile").then((r) => r.json()),
    ]).then(([settingRes, profileRes]) => {
      levelId = settingRes.selectedLevelId || LEVEL_MAP[profileRes.cefrLevel] || 2;
      setActiveLevel(levelId);
    }).catch(() => {});

    // Collect all experience IDs and fetch progress
    const expIds = new Set<number>();
    data.levels?.forEach((l: { modules: { experiences: { id: number }[] }[] }) =>
      l.modules.forEach((m: { experiences: { id: number }[] }) =>
        m.experiences.forEach((e: { id: number }) => expIds.add(e.id))
      )
    );
    if (expIds.size > 0) {
      fetch(`/api/user/experience/progress/batch?ids=${[...expIds].join(",")}`)
        .then((r) => r.json()).then(setExpProgress).catch(() => {});
    }
    refreshStats();
  }, [status, data]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLevelDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1280px] mx-auto px-margin-mobile py-6 animate-pulse space-y-6">
          <div className="h-48 bg-surface-container-highest rounded-xl" />
          <div className="h-20 bg-surface-container rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-outline-variant/30" />
            ))}
          </div>
        </div>
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
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/20 text-white cursor-pointer hover:bg-white/20 transition-colors"
              >
                <span className="text-xs font-semibold">{levelLabel}</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
              {showLevelDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 min-w-[120px]">
                  {data.levels.map((l) => (
                    <button
                      key={l.level.id}
                      onClick={() => {
                        setActiveLevel(l.level.id);
                        setShowLevelDropdown(false);
                        fetch("/api/user/scenario-setting", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ scenarioId: data.id, levelId: l.level.id }),
                        }).catch(() => {});
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-surface-container-higher transition-colors ${l.level.id === activeLevel ? "bg-primary/10 text-primary" : "text-on-surface"}`}
                    >
                      {l.level.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

      {/* Per-scenario level info banner */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile pt-4 pb-0">
        <div className="bg-surface-container rounded-xl p-3 flex items-start gap-3 border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0">info</span>
          <div>
            <p className="text-sm text-on-surface font-semibold">Learn at your own comfort</p>
            <p className="text-sm text-on-surface">Set a different CEFR level for each scenario. Tap the level badge above to switch.</p>
          </div>
        </div>
      </section>

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
