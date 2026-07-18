"use client";

import { SessionProvider } from "next-auth/react";
import { StatsProvider } from "@/lib/stats-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StatsProvider>{children}</StatsProvider>
    </SessionProvider>
  );
}
