import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

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

  if (existing?.lesson_xp_claimed) {
    return NextResponse.json({ lessonXpAwarded: false, bonusXpClaimed: existing.bonus_xp_claimed });
  }

  const { data: exp, error: expError } = await supabase
    .from("experiences")
    .select("xp_reward")
    .eq("id", experienceId)
    .maybeSingle();
  if (expError) throw expError;

  const xpReward = exp?.xp_reward ?? 50;

  const { error: upsertError } = await supabase
    .from("user_experience_progress")
    .upsert(
      {
        user_id: uid,
        experience_id: experienceId,
        completed: true,
        completed_at: new Date().toISOString(),
        lesson_xp_claimed: true,
      },
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
    const newTotalXp = (stats.total_xp ?? 0) + xpReward;

    const today = new Date().toISOString().slice(0, 10);
    const prevDate = stats.last_activity_date;
    let newStreak = stats.current_streak ?? 0;
    if (prevDate) {
      const prev = new Date(prevDate);
      const diff = Math.floor((new Date(today).getTime() - prev.getTime()) / 86400000);
      if (diff === 1) newStreak += 1;
      else if (diff > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }
    const longest = Math.max(stats.longest_streak ?? 0, newStreak);

    const { error: updateError } = await supabase
      .from("user_stats")
      .update({ total_xp: newTotalXp, current_streak: newStreak, longest_streak: longest, last_activity_date: today })
      .eq("user_id", uid);
    if (updateError) throw updateError;

    const { data: existingActivity } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", uid)
      .eq("date", today)
      .maybeSingle();

    if (existingActivity) {
      const { error: actError } = await supabase
        .from("user_activity")
        .update({ xp_earned: (existingActivity.xp_earned ?? 0) + xpReward })
        .eq("user_id", uid)
        .eq("date", today);
      if (actError) throw actError;
    } else {
      const { error: actError } = await supabase
        .from("user_activity")
        .insert({ user_id: uid, date: today, xp_earned: xpReward });
      if (actError) throw actError;
    }
  }

  return NextResponse.json({ lessonXpAwarded: true, bonusXpClaimed: existing?.bonus_xp_claimed ?? false });
}
