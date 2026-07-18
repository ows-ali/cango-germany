import { db } from "@/lib/db";
import { scenarios, levels, scenarioLevels, modules, experiences, transcriptLines, questions, questionOptions, challenges, challengeItems } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const allScenarios = await db.select().from(scenarios).orderBy(scenarios.order);

  const fullContent = await Promise.all(
    allScenarios.map(async (scenario) => {
      const sLevels = await db
        .select()
        .from(scenarioLevels)
        .where(eq(scenarioLevels.scenarioId, scenario.id))
        .innerJoin(levels, eq(scenarioLevels.levelId, levels.id));

      const scenarioLevelData = await Promise.all(
        sLevels.map(async ({ scenario_levels: sl, levels: l }) => {
          const mods = await db
            .select()
            .from(modules)
            .where(eq(modules.scenarioLevelId, sl.id))
            .orderBy(modules.order);

          const moduleData = await Promise.all(
            mods.map(async (mod) => {
              const exps = await db
                .select()
                .from(experiences)
                .where(eq(experiences.moduleId, mod.id))
                .orderBy(experiences.order);

              const expData = await Promise.all(
                exps.map(async (exp) => {
                  const [transcripts, quests, chals] = await Promise.all([
                    db
                      .select()
                      .from(transcriptLines)
                      .where(eq(transcriptLines.experienceId, exp.id))
                      .orderBy(transcriptLines.order),
                    db
                      .select()
                      .from(questions)
                      .where(eq(questions.experienceId, exp.id))
                      .orderBy(questions.order),
                    db
                      .select()
                      .from(challenges)
                      .where(eq(challenges.experienceId, exp.id)),
                  ]);

                  const questionsWithOptions = await Promise.all(
                    quests.map(async (q) => ({
                      ...q,
                      options: await db
                        .select()
                        .from(questionOptions)
                        .where(eq(questionOptions.questionId, q.id)),
                    }))
                  );

                  const challengesWithItems = await Promise.all(
                    chals.map(async (ch) => ({
                      ...ch,
                      items: await db
                        .select()
                        .from(challengeItems)
                        .where(eq(challengeItems.challengeId, ch.id))
                        .orderBy(challengeItems.order),
                    }))
                  );

                  return { ...exp, transcripts, questions: questionsWithOptions, challenges: challengesWithItems };
                })
              );

              return { ...mod, experiences: expData };
            })
          );

          return { level: l, modules: moduleData };
        })
      );

      return { ...scenario, levels: scenarioLevelData };
    })
  );

  return NextResponse.json(fullContent);
}
