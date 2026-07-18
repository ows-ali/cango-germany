"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="relative h-screen w-screen flex flex-col justify-between overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/20 z-10" />
        <div className="absolute inset-0 z-20" style={{ background: "radial-gradient(circle, transparent 30%, rgba(9, 20, 38, 0.6) 100%)" }} />
        <img alt="Life in Germany" src="/images/onboarding-bg.jpg" className="w-full h-full object-cover" />
      </div>

      <header className="relative z-30 pt-12 px-4 md:px-16 flex justify-center w-full" style={{ animation: "fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
        <svg width="56" height="56" viewBox="0 0 32 32" fill="none" className="mix-blend-multiply brightness-50 contrast-125">
          <rect x="6" y="6" width="20" height="20" rx="2" stroke="white" strokeWidth="3" />
          <path d="M16 6V26" stroke="white" strokeWidth="3" />
        </svg>
      </header>

      <div className="relative z-30 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto flex-grow" style={{ animation: "fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both" }}>
        <h1 className="text-3xl md:text-5xl text-white mb-6 tracking-tight drop-shadow-lg font-bold" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
          Learn German for Real Life in Germany
        </h1>
        <p className="text-lg md:text-xl text-white/95 max-w-xl mx-auto drop-shadow-md">
          Practice realistic scenarios you will actually face. Built for professionals and students in Germany.
        </p>
      </div>

      <footer className="relative z-30 pb-12 px-4 md:pb-32 flex flex-col items-center" style={{ animation: "fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.8s both" }}>
        <div className="w-full max-w-sm px-6">
          <button
            onClick={() => router.push("/onboarding/goals")}
            className="group relative w-full h-14 bg-primary text-white rounded-xl text-base flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(9,20,38,0.4)] active:scale-95 font-semibold"
          >
            <span className="relative z-10">Get Started</span>
            <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          </button>
        </div>
        <div className="mt-8 flex items-center gap-4 text-white/70 text-xs tracking-widest uppercase" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
          <span className="w-8 h-px bg-white/30" />
          Professional &bull; Academic &bull; Living
          <span className="w-8 h-px bg-white/30" />
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
