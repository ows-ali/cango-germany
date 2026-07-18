"use client";

import { useStats } from "@/lib/stats-context";
import { Logo } from "@/components/Logo";

export default function Header() {
  const { stats } = useStats();

  return (
    <header className="bg-surface sticky top-0 z-40 border-b border-surface-container">
      <div className="flex justify-between items-center w-full px-margin-mobile h-16 max-w-[1280px] mx-auto">
        <Logo size={82} />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-full">
            <span className="text-xs font-semibold text-on-surface">{stats.totalXp} XP</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary-container px-2 py-1 rounded-full">
            <span className="text-xs font-semibold text-on-secondary-container">{stats.currentStreak} 🔥</span>
          </div>
        </div>
      </div>
    </header>
  );
}