"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", icon: "home", label: "Home" },
  { href: "/vocabulary", icon: "menu_book", label: "Vocab" },
  { href: "/progress", icon: "leaderboard", label: "Stats" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 bg-surface border-t border-outline-variant z-50 md:hidden rounded-t-xl">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
              active ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
