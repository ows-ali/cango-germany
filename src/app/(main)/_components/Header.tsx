"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStats } from "@/lib/stats-context";
import { Logo } from "@/components/Logo";

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/vocabulary", label: "Vocab" },
  { href: "/progress", label: "Stats" },
  { href: "/profile", label: "Profile" },
];

export default function Header() {
  const { stats } = useStats();
  const pathname = usePathname();

  return (
    <header className="bg-surface sticky top-0 z-40 border-b border-surface-container">
      <div className="flex justify-between items-center w-full px-margin-mobile h-16 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-6">
          <Logo size={82} />
          <nav className="hidden md:flex items-center gap-5">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm transition-colors ${active
                      ? "text-primary font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
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