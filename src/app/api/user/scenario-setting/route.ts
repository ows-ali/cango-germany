import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db-supabase";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scenarioId = parseInt(req.nextUrl.searchParams.get("scenarioId") || "");
  if (!scenarioId) {
    return NextResponse.json({ error: "Missing scenarioId" }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from("user_scenario_settings")
    .select("selected_level_id")
    .eq("user_id", session.user.id)
    .eq("scenario_id", scenarioId)
    .maybeSingle();

  if (error) throw error;

  return NextResponse.json({ selectedLevelId: row?.selected_level_id ?? null });
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

  const { error } = await supabase
    .from("user_scenario_settings")
    .upsert(
      { user_id: session.user.id, scenario_id: scenarioId, selected_level_id: levelId },
      { onConflict: "user_id, scenario_id", ignoreDuplicates: false }
    );

  if (error) throw error;

  return NextResponse.json({ saved: true });
}
