"use client";

import { useStats } from "@/lib/stats-context";

export default function Header() {
  const { stats } = useStats();

  return (
    <header className="bg-surface sticky top-0 z-40 border-b border-surface-container">
      <div className="flex justify-between items-center w-full px-margin-mobile h-16 max-w-[1280px] mx-auto">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="6" width="20" height="20" rx="2" stroke="#1e293b" strokeWidth="3" />
          <path d="M16 6V26" stroke="#1e293b" strokeWidth="3" />
        </svg>
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