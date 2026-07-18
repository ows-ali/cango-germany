"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Stats {
  totalXp: number;
  currentStreak: number;
  todayXp: number;
}

const StatsContext = createContext<{
  stats: Stats;
  refreshStats: () => void;
}>({
  stats: { totalXp: 0, currentStreak: 0, todayXp: 0 },
  refreshStats: () => {},
});

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({ totalXp: 0, currentStreak: 0, todayXp: 0 });

  const refreshStats = useCallback(() => {
    if (session?.user?.id) {
      fetch("/api/user/stats").then((r) => r.json()).then(setStats).catch(() => {});
    }
  }, [session]);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  return (
    <StatsContext.Provider value={{ stats, refreshStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export const useStats = () => useContext(StatsContext);
