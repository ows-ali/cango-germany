"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative h-screen w-screen flex flex-col justify-between overflow-hidden bg-primary/10">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/20 z-10" />
        <div
          className="absolute inset-0 z-20"
          style={{ background: "radial-gradient(circle, transparent 30%, rgba(9,20,38,0.6) 100%)" }}
        />
        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-primary-container to-slate-900" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none opacity-30" />

      <header className="relative z-30 pt-12 px-margin-mobile flex justify-center w-full animate-fade-in">
        <svg width="56" height="56" viewBox="0 0 32 32" fill="none" className="opacity-80">
          <rect x="6" y="6" width="20" height="20" rx="2" stroke="white" strokeWidth="3" />
          <path d="M16 6V26" stroke="white" strokeWidth="3" />
        </svg>
      </header>

      <div className="relative z-30 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto flex-grow animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <h1 className="font-headline text-4xl md:text-5xl text-white mb-6 tracking-tight drop-shadow-lg">
          Learn German for Real Life in Germany
        </h1>
        <p className="text-lg text-white/95 max-w-xl mx-auto drop-shadow-md">
          Practice realistic scenarios you will actually face. Built for professionals and students in Germany.
        </p>
      </div>

      <footer className="relative z-30 pb-12 px-margin-mobile flex flex-col items-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <div className="w-full max-w-sm px-6">
          <Link
            href="/auth"
            className="group relative w-full h-14 bg-white text-primary rounded-xl font-headline text-lg flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(9,20,38,0.4)] active:scale-95"
          >
            <span className="relative z-10 font-semibold">Get Started</span>
            <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
        <div className="mt-8 flex items-center gap-4 text-white/70 text-xs tracking-widest uppercase">
          <span className="w-8 h-px bg-white/30" />
          Professional • Academic • Living
          <span className="w-8 h-px bg-white/30" />
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </main>
  );
}
