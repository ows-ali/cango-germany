"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
  const [data, setData] = useState<ScenarioData | null>(null);
  const [activeLevel, setActiveLevel] = useState(2);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((all) => {
      const found = all.find((s: { slug: string }) => s.slug === slug);
      setData(found || null);
    }).catch(() => {});
    if (session?.user?.id) {
      fetch("/api/user/profile").then((r) => r.json()).then((u) => {
        if (u.cefrLevel && LEVEL_MAP[u.cefrLevel]) setActiveLevel(LEVEL_MAP[u.cefrLevel]);
      }).catch(() => {});
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
              <span className="text-xs text-white/90">0/{currentLevel?.modules.reduce((sum, m) => sum + m.experiences.length, 0) || 0} Experiences</span>
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
                {mod.experiences.map((exp) => (
                  <Link
                    key={exp.id}
                    href={`/experience/${exp.id}`}
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">play_circle</span>
                      <span className="text-sm font-medium text-on-surface">{exp.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-on-surface-variant">{exp.duration}</span>
                      <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-semibold">START</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
