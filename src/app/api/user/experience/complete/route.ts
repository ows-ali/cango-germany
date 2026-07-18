import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userExperienceProgress, userStats, userActivity, experiences } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

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

  const [existing] = await db
    .select()
    .from(userExperienceProgress)
    .where(and(
      eq(userExperienceProgress.userId, uid),
      eq(userExperienceProgress.experienceId, experienceId),
    ))
    .limit(1);

  if (existing?.lessonXpClaimed) {
    return NextResponse.json({ lessonXpAwarded: false, bonusXpClaimed: existing.bonusXpClaimed });
  }

  const [exp] = await db
    .select({ xpReward: experiences.xpReward })
    .from(experiences)
    .where(eq(experiences.id, experienceId))
    .limit(1);

  const xpReward = exp?.xpReward ?? 50;

  await db.transaction(async (tx) => {
    await tx
      .insert(userExperienceProgress)
      .values({
        userId: uid,
        experienceId,
        completed: true,
        completedAt: new Date(),
        lessonXpClaimed: true,
      })
      .onConflictDoUpdate({
        target: [userExperienceProgress.userId, userExperienceProgress.experienceId],
        set: { completed: true, completedAt: new Date(), lessonXpClaimed: true },
      });

    await tx
      .update(userStats)
      .set({ totalXp: sql`${userStats.totalXp} + ${xpReward}` })
      .where(eq(userStats.userId, uid));

    const today = new Date().toISOString().slice(0, 10);
    const [existingActivity] = await tx
      .select()
      .from(userActivity)
      .where(and(eq(userActivity.userId, uid), eq(userActivity.date, today)))
      .limit(1);
    if (existingActivity) {
      await tx
        .update(userActivity)
        .set({ xpEarned: sql`${userActivity.xpEarned} + ${xpReward}` })
        .where(and(eq(userActivity.userId, uid), eq(userActivity.date, today)));
    } else {
      await tx
        .insert(userActivity)
        .values({ userId: uid, date: today, xpEarned: xpReward });
    }

    const [stats] = await tx
      .select()
      .from(userStats)
      .where(eq(userStats.userId, uid))
      .limit(1);

    if (stats) {
      const prevDate = stats.lastActivityDate;
      const todayDate = today;
      let newStreak = stats.currentStreak;
      if (prevDate) {
        const prev = new Date(prevDate);
        const diff = Math.floor((new Date(todayDate).getTime() - prev.getTime()) / 86400000);
        if (diff === 1) newStreak += 1;
        else if (diff > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }
      const longest = Math.max(stats.longestStreak, newStreak);
      await tx
        .update(userStats)
        .set({ currentStreak: newStreak, longestStreak: longest, lastActivityDate: todayDate })
        .where(eq(userStats.userId, uid));
    }
  });

  return NextResponse.json({ lessonXpAwarded: true, bonusXpClaimed: existing?.bonusXpClaimed ?? false });
}
