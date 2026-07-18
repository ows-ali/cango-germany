"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/Logo";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-margin-mobile">
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-10 text-center max-w-sm w-full shadow-sm">
        <Logo size={64} className="mx-auto mb-4" />
        <h2 className="font-headline text-2xl text-on-surface mb-1">Profile</h2>
        <p className="text-sm text-on-surface-variant mb-8 truncate">{session?.user?.email}</p>

        <button
          onClick={() => setShowLogout(true)}
          className="flex items-center justify-center gap-2 w-full border border-outline-variant text-on-surface font-medium px-5 py-2.5 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Logout
        </button>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        onConfirm={() => signOut({ callbackUrl: "/" })}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
}
