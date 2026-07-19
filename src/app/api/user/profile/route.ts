import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("name, email, cefr_level, goals")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    cefrLevel: user.cefr_level,
    goals: user.goals,
  });
}
