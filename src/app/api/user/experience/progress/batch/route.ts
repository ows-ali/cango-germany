import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({}, { status: 200 });
  }

  const experienceIds = ids.split(",").map(Number).filter((n) => !isNaN(n));
  if (experienceIds.length === 0) {
    return NextResponse.json({}, { status: 200 });
  }

  const { data: rows, error } = await supabase
    .from("user_experience_progress")
    .select("*")
    .eq("user_id", session.user.id)
    .in("experience_id", experienceIds);

  if (error) throw error;

  const map: Record<number, { completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean }> = {};
  for (const row of rows) {
    map[row.experience_id] = {
      completed: row.completed ?? false,
      lessonXpClaimed: row.lesson_xp_claimed ?? false,
      bonusXpClaimed: row.bonus_xp_claimed ?? false,
    };
  }

  return NextResponse.json(map);
}
