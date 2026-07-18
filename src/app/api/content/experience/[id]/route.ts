import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { experiences, transcriptLines, words, experienceWords, questions, questionOptions, challenges, challengeItems } from "@/lib/db/schema";
import { eq, asc, inArray } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expId = parseInt(id);
  if (isNaN(expId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const [exp] = await db.select().from(experiences).where(eq(experiences.id, expId));
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [transcripts, quests, chals, vocabLinks] = await Promise.all([
    db.select().from(transcriptLines).where(eq(transcriptLines.experienceId, expId)).orderBy(transcriptLines.order),
    db.select().from(questions).where(eq(questions.experienceId, expId)).orderBy(questions.order),
    db.select().from(challenges).where(eq(challenges.experienceId, expId)),
    db.select().from(experienceWords).where(eq(experienceWords.experienceId, expId)),
  ]);

  const wordIds = vocabLinks.map((vw) => vw.wordId);
  const vocabWords = wordIds.length > 0
    ? await db.select().from(words).where(inArray(words.id, wordIds))
    : [];

  const questionsWithOptions = await Promise.all(
    quests.map(async (q) => ({
      ...q,
      options: await db.select().from(questionOptions).where(eq(questionOptions.questionId, q.id)),
    }))
  );

  const challengesWithItems = await Promise.all(
    chals.map(async (ch) => ({
      ...ch,
      items: await db.select().from(challengeItems).where(eq(challengeItems.challengeId, ch.id)).orderBy(challengeItems.order),
    }))
  );

  return NextResponse.json({
    ...exp,
    transcripts,
    questions: questionsWithOptions,
    challenges: challengesWithItems,
    vocabulary: vocabWords,
  });
}
