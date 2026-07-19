import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const experienceId = parseInt(req.nextUrl.searchParams.get("experienceId") || "");
  if (!experienceId) {
    return NextResponse.json({ error: "Missing experienceId" }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from("user_experience_progress")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("experience_id", experienceId)
    .maybeSingle();

  if (error) throw error;

  return NextResponse.json({
    completed: row?.completed ?? false,
    lessonXpClaimed: row?.lesson_xp_claimed ?? false,
    bonusXpClaimed: row?.bonus_xp_claimed ?? false,
  });
}
