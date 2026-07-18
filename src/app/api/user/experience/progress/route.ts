import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userExperienceProgress } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const experienceId = parseInt(req.nextUrl.searchParams.get("experienceId") || "");
  if (!experienceId) {
    return NextResponse.json({ error: "Missing experienceId" }, { status: 400 });
  }

  const [row] = await db
    .select()
    .from(userExperienceProgress)
    .where(and(
      eq(userExperienceProgress.userId, session.user.id),
      eq(userExperienceProgress.experienceId, experienceId),
    ))
    .limit(1);

  return NextResponse.json({
    completed: row?.completed ?? false,
    lessonXpClaimed: row?.lessonXpClaimed ?? false,
    bonusXpClaimed: row?.bonusXpClaimed ?? false,
  });
}
