import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) return NextResponse.json({});

  const scenarioIds = ids.split(",").map(Number).filter((n) => !isNaN(n));
  if (scenarioIds.length === 0) return NextResponse.json({});

  const { data: rows, error } = await supabase
    .from("user_scenario_settings")
    .select("*")
    .eq("user_id", session.user.id)
    .in("scenario_id", scenarioIds);

  if (error) throw error;

  const map: Record<number, { selectedLevelId: number | null }> = {};
  for (const row of rows) {
    map[row.scenario_id] = { selectedLevelId: row.selected_level_id };
  }

  return NextResponse.json(map);
}
