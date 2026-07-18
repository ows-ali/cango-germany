"use client";

import { useRouter } from "next/navigation";

export function ComingSoon() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-10 text-center max-w-sm w-full shadow-sm">
        <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          lock
        </span>
        <h2 className="font-headline text-2xl text-on-surface mt-4 mb-2">Coming Soon</h2>
        <p className="text-on-surface-variant text-sm mb-6">This feature is on its way.</p>
        <button
          onClick={() => router.push("/home")}
          className="bg-primary text-on-primary font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
