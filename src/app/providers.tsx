"use client";

import { SessionProvider } from "next-auth/react";
import { StatsProvider } from "@/lib/stats-context";
import { ContentProvider } from "@/lib/content-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StatsProvider>
        <ContentProvider>{children}</ContentProvider>
      </StatsProvider>
    </SessionProvider>
  );
}
