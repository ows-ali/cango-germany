import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = session.user.id;

  const { data: stats, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();

  if (statsError) throw statsError;

  if (!stats) {
    const { data: newStats, error: insertError } = await supabase
      .from("user_stats")
      .insert({ user_id: uid })
      .select()
      .maybeSingle();

    if (insertError) throw insertError;
    var finalStats = newStats;
  } else {
    var finalStats = stats;
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayRow, error: activityError } = await supabase
    .from("user_activity")
    .select("xp_earned")
    .eq("user_id", uid)
    .eq("date", today)
    .maybeSingle();

  if (activityError) throw activityError;

  return NextResponse.json({
    totalXp: finalStats.total_xp,
    currentStreak: finalStats.current_streak,
    longestStreak: finalStats.longest_streak,
    todayXp: todayRow?.xp_earned ?? 0,
  });
}
