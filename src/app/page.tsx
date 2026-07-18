"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const cvs = canvasRef.current!;
    const ctx = cvs.getContext("2d")!;
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * cvs.width,
      y: Math.random() * cvs.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    function animate() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = cvs.width;
        if (p.x > cvs.width) p.x = 0;
        if (p.y < 0) p.y = cvs.height;
        if (p.y > cvs.height) p.y = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

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
        <Logo size={182} className="opacity-100" />
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
