import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userScenarioSettings } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) return NextResponse.json({});

  const scenarioIds = ids.split(",").map(Number).filter((n) => !isNaN(n));
  if (scenarioIds.length === 0) return NextResponse.json({});

  const rows = await db
    .select()
    .from(userScenarioSettings)
    .where(and(
      eq(userScenarioSettings.userId, session.user.id),
      inArray(userScenarioSettings.scenarioId, scenarioIds),
    ));

  const map: Record<number, { selectedLevelId: number | null }> = {};
  for (const row of rows) {
    map[row.scenarioId] = { selectedLevelId: row.selectedLevelId };
  }

  return NextResponse.json(map);
}
