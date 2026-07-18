import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userExperienceProgress } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

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

  const rows = await db
    .select()
    .from(userExperienceProgress)
    .where(and(
      eq(userExperienceProgress.userId, session.user.id),
      inArray(userExperienceProgress.experienceId, experienceIds),
    ));

  const map: Record<number, { completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean }> = {};
  for (const row of rows) {
    map[row.experienceId] = {
      completed: row.completed ?? false,
      lessonXpClaimed: row.lessonXpClaimed ?? false,
      bonusXpClaimed: row.bonusXpClaimed ?? false,
    };
  }

  return NextResponse.json(map);
}
