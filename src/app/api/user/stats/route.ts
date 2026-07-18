import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userStats, userActivity } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = session.user.id;

  let [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, uid))
    .limit(1);

  if (!stats) {
    [stats] = await db
      .insert(userStats)
      .values({ userId: uid })
      .returning();
  }

  const today = new Date().toISOString().slice(0, 10);
  const [todayRow] = await db
    .select({ xp: sql<number>`coalesce(sum(${userActivity.xpEarned}), 0)` })
    .from(userActivity)
    .where(and(eq(userActivity.userId, uid), eq(userActivity.date, today)))
    .limit(1);

  return NextResponse.json({
    totalXp: stats.totalXp,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    todayXp: todayRow?.xp ?? 0,
  });
}
