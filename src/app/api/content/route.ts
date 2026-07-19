import { supabase } from "@/lib/db-supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: allScenarios, error: scenariosError } = await supabase
    .from("scenarios")
    .select("*")
    .order("order");
  if (scenariosError) throw scenariosError;

  const fullContent = await Promise.all(
    allScenarios.map(async (scenario) => {
      const { data: sLevels, error: slError } = await supabase
        .from("scenario_levels")
        .select("*, levels(*)")
        .eq("scenario_id", scenario.id);
      if (slError) throw slError;

      const scenarioLevelData = await Promise.all(
        sLevels.map(async (sl) => {
          const { data: mods, error: modError } = await supabase
            .from("modules")
            .select("*")
            .eq("scenario_level_id", sl.id)
            .order("order");
          if (modError) throw modError;

          const moduleData = await Promise.all(
            mods.map(async (mod) => {
              const { data: exps, error: expError } = await supabase
                .from("experiences")
                .select("*")
                .eq("module_id", mod.id)
                .order("order");
              if (expError) throw expError;

              const expData = await Promise.all(
                exps.map(async (exp) => {
                  const [transcriptsResult, questsResult, chalsResult] = await Promise.all([
                    supabase.from("transcript_lines").select("*").eq("experience_id", exp.id).order("order"),
                    supabase.from("questions").select("*").eq("experience_id", exp.id).order("order"),
                    supabase.from("challenges").select("*").eq("experience_id", exp.id),
                  ]);

                  if (transcriptsResult.error) throw transcriptsResult.error;
                  if (questsResult.error) throw questsResult.error;
                  if (chalsResult.error) throw chalsResult.error;

                  const questionsWithOptions = await Promise.all(
                    questsResult.data.map(async (q) => {
                      const { data: options, error: optError } = await supabase
                        .from("question_options")
                        .select("*")
                        .eq("question_id", q.id);
                      if (optError) throw optError;
                      return { ...q, options };
                    })
                  );

                  const challengesWithItems = await Promise.all(
                    chalsResult.data.map(async (ch) => {
                      const { data: items, error: itemError } = await supabase
                        .from("challenge_items")
                        .select("*")
                        .eq("challenge_id", ch.id)
                        .order("order");
                      if (itemError) throw itemError;
                      return { ...ch, items };
                    })
                  );

                  return { ...exp, transcripts: transcriptsResult.data, questions: questionsWithOptions, challenges: challengesWithItems };
                })
              );

              return { ...mod, experiences: expData };
            })
          );

          return { level: sl.levels, modules: moduleData };
        })
      );

      return { ...scenario, levels: scenarioLevelData };
    })
  );

  return NextResponse.json(fullContent);
}
