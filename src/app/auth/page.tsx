"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      mode,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(mode === "signup" ? "Email already in use" : "Invalid email or password");
      return;
    }

    router.push(mode === "signup" ? "/onboarding/welcome" : "/home");
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container">
      <header className="relative z-10 w-full flex flex-col items-center py-12">
        <Logo size={100} className="" />
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
          CanGo
        </h1>
      </header>
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 md:px-0 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-outline-variant/30" style={{ boxShadow: "0 0 40px 10px rgba(19, 27, 46, 0.03)" }}>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-on-surface-variant" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: "24px" }}>
                {mode === "signup" ? "Unlock your linguistic potential today." : "Continue your German journey."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-error text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 flex items-center justify-center gap-3 bg-primary text-on-primary rounded-xl font-semibold transition-all duration-200 hover:bg-primary-container active:scale-[0.98] focus:ring-2 focus:ring-primary-fixed focus:outline-none shadow-lg shadow-primary/20 disabled:opacity-60"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: "24px" }}
              >
                <span className="material-symbols-outlined text-xl">mail</span>
                <span>{loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Log In"}</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-on-surface-variant" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: "24px" }}>
                {mode === "signup" ? (
                  <>Already have an account?{" "}</>
                ) : (
                  <>Don&apos;t have an account?{" "}</>
                )}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
                  className="text-primary font-bold hover:underline ml-1"
                >
                  {mode === "signup" ? "Log In" : "Sign Up"}
                </button>
              </p>
            </div>

            {mode === "signup" && (
              <div className="mt-10 pt-8 border-t border-outline-variant/20">
                <p className="text-center text-xs leading-relaxed text-on-surface-variant" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
                  By signing up, you agree to our <br />
                  <a href="#" className="text-primary font-bold hover:underline">Terms</a> and <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>.
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-center opacity-40">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
            </div>
          </div>
        </div>
      </main>
      <footer className="relative z-10 py-8 text-center">
        <p className="text-xs text-outline" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>&copy; 2024 CanGo Education. All rights reserved.</p>
      </footer>
    </div>
  );
}
