import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userScenarioSettings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scenarioId = parseInt(req.nextUrl.searchParams.get("scenarioId") || "");
  if (!scenarioId) {
    return NextResponse.json({ error: "Missing scenarioId" }, { status: 400 });
  }

  const [row] = await db
    .select()
    .from(userScenarioSettings)
    .where(and(
      eq(userScenarioSettings.userId, session.user.id),
      eq(userScenarioSettings.scenarioId, scenarioId),
    ))
    .limit(1);

  return NextResponse.json({ selectedLevelId: row?.selectedLevelId ?? null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scenarioId, levelId } = await req.json();
  if (!scenarioId || !levelId) {
    return NextResponse.json({ error: "Missing scenarioId or levelId" }, { status: 400 });
  }

  await db
    .insert(userScenarioSettings)
    .values({
      userId: session.user.id,
      scenarioId,
      selectedLevelId: levelId,
    })
    .onConflictDoUpdate({
      target: [userScenarioSettings.userId, userScenarioSettings.scenarioId],
      set: { selectedLevelId: levelId },
    });

  return NextResponse.json({ saved: true });
}
