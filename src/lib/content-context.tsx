"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const CACHE_KEY = "cango:content";
const CACHE_TTL = 1000 * 60 * 30;

interface ContentContextValue {
  content: unknown[] | null;
  loaded: boolean;
  getScenarioBySlug: (slug: string) => unknown | null;
}

const ContentContext = createContext<ContentContextValue>({
  content: null,
  loaded: false,
  getScenarioBySlug: () => null,
});

function loadCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function saveCache(data: unknown[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<unknown[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const cached = loadCached();
      if (cached && !cancelled) {
        setContent(cached);
        setLoaded(true);
      }

      try {
        const res = await fetch("/api/content");
        const data = await res.json();
        if (!cancelled) {
          setContent(data);
          setLoaded(true);
          saveCache(data);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const getScenarioBySlug = useCallback((slug: string) => {
    if (!content) return null;
    return (content as any[]).find((s) => s.slug === slug) || null;
  }, [content]);

  return (
    <ContentContext.Provider value={{ content, loaded, getScenarioBySlug }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
