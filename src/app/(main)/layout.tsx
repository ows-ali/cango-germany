import Header from "./_components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <BottomNav />
    </>
  );
}
