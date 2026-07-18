import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userExperienceProgress, userStats, userActivity } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

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

  const [existing] = await db
    .select()
    .from(userExperienceProgress)
    .where(and(
      eq(userExperienceProgress.userId, uid),
      eq(userExperienceProgress.experienceId, experienceId),
    ))
    .limit(1);

  if (existing?.bonusXpClaimed) {
    return NextResponse.json({ bonusXpAwarded: false });
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(userExperienceProgress)
      .values({
        userId: uid,
        experienceId,
        bonusXpClaimed: true,
      })
      .onConflictDoUpdate({
        target: [userExperienceProgress.userId, userExperienceProgress.experienceId],
        set: { bonusXpClaimed: true },
      });

    await tx
      .update(userStats)
      .set({ totalXp: sql`${userStats.totalXp} + ${BONUS_XP}` })
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
        .set({ xpEarned: sql`${userActivity.xpEarned} + ${BONUS_XP}` })
        .where(and(eq(userActivity.userId, uid), eq(userActivity.date, today)));
    } else {
      await tx
        .insert(userActivity)
        .values({ userId: uid, date: today, xpEarned: BONUS_XP });
    }
  });

  return NextResponse.json({ bonusXpAwarded: true });
}
