"use client";

import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-margin-mobile py-12">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" className="mx-auto mb-6">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="#1e293b" strokeWidth="3" />
            <path d="M16 6V26" stroke="#1e293b" strokeWidth="3" />
          </svg>
          <h1 className="font-headline text-2xl text-on-surface mb-2">Sign Up for CanGo</h1>
          <p className="text-on-surface-variant">Create an account to start learning</p>
        </div>

        <div className="space-y-4">
          <button className="w-full flex items-center justify-center gap-3 bg-white border border-outline-variant rounded-xl py-3.5 font-medium text-on-surface hover:bg-surface-container-low transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 py-2">
            <span className="flex-1 h-px bg-outline-variant" />
            <span className="text-sm text-on-surface-variant">or</span>
            <span className="flex-1 h-px bg-outline-variant" />
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <input type="email" placeholder="name@example.com" className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Sign Up with Email
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
