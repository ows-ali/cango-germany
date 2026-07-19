import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

const BONUS_XP = 20;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { experienceId } = await req.json();
  if (!experienceId) {
    return NextResponse.json({ error: "Missing experienceId" }, { status: 400 });
  }

  const uid = session.user.id;

  const { data: existing } = await supabase
    .from("user_experience_progress")
    .select("*")
    .eq("user_id", uid)
    .eq("experience_id", experienceId)
    .maybeSingle();

  if (existing?.bonus_xp_claimed) {
    return NextResponse.json({ bonusXpAwarded: false });
  }

  const { error: upsertError } = await supabase
    .from("user_experience_progress")
    .upsert(
      { user_id: uid, experience_id: experienceId, bonus_xp_claimed: true },
      { onConflict: "user_id, experience_id", ignoreDuplicates: false }
    );
  if (upsertError) throw upsertError;

  const { data: stats, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();
  if (statsError) throw statsError;

  if (stats) {
    const newTotalXp = (stats.total_xp ?? 0) + BONUS_XP;

    const { error: updateError } = await supabase
      .from("user_stats")
      .update({ total_xp: newTotalXp })
      .eq("user_id", uid);
    if (updateError) throw updateError;

    const today = new Date().toISOString().slice(0, 10);
    const { data: existingActivity } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", uid)
      .eq("date", today)
      .maybeSingle();

    if (existingActivity) {
      const { error: actError } = await supabase
        .from("user_activity")
        .update({ xp_earned: (existingActivity.xp_earned ?? 0) + BONUS_XP })
        .eq("user_id", uid)
        .eq("date", today);
      if (actError) throw actError;
    } else {
      const { error: actError } = await supabase
        .from("user_activity")
        .insert({ user_id: uid, date: today, xp_earned: BONUS_XP });
      if (actError) throw actError;
    }
  }

  return NextResponse.json({ bonusXpAwarded: true });
}
