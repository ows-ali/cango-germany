import Header from "./_components/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 bg-surface border-t border-outline-variant z-50 md:hidden rounded-t-xl">
        {[
          { href: "/home", icon: "home", label: "Home", filled: true },
          { href: "/vocabulary", icon: "menu_book", label: "Vocab" },
          { href: "/progress", icon: "leaderboard", label: "Stats" },
          { href: "/profile", icon: "person", label: "Profile" },
        ].map((item) => (
          <a key={item.href} href={item.href} className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: item.filled ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
