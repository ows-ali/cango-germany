import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { goals, cefrLevel } = await req.json();

  const { error } = await supabase
    .from("users")
    .update({ goals, cefr_level: cefrLevel, onboarding_complete: true })
    .eq("id", session.user.id);

  if (error) throw error;

  return NextResponse.json({ ok: true });
}
