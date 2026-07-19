import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db-supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expId = parseInt(id);
  if (isNaN(expId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const { data: exp, error: expError } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", expId)
    .maybeSingle();
  if (expError) throw expError;
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [transcriptsResult, questsResult, chalsResult, vocabLinksResult] = await Promise.all([
    supabase.from("transcript_lines").select("*").eq("experience_id", expId).order("order"),
    supabase.from("questions").select("*").eq("experience_id", expId).order("order"),
    supabase.from("challenges").select("*").eq("experience_id", expId),
    supabase.from("experience_words").select("*").eq("experience_id", expId),
  ]);

  if (transcriptsResult.error) throw transcriptsResult.error;
  if (questsResult.error) throw questsResult.error;
  if (chalsResult.error) throw chalsResult.error;
  if (vocabLinksResult.error) throw vocabLinksResult.error;

  const wordIds = vocabLinksResult.data.map((vw) => vw.word_id);
  let vocabWords: any[] = [];
  if (wordIds.length > 0) {
    const { data, error } = await supabase.from("words").select("*").in("id", wordIds);
    if (error) throw error;
    vocabWords = (data ?? []).map((w) => ({
      id: w.id,
      germanWord: w.german_word,
      englishTranslation: w.english_translation,
      article: w.article,
      plural: w.plural,
    }));
  }

  const questionsWithOptions = await Promise.all(
    questsResult.data.map(async (q) => {
      const { data: options, error: optError } = await supabase
        .from("question_options")
        .select("*")
        .eq("question_id", q.id);
      if (optError) throw optError;
      return {
        id: q.id,
        experienceId: q.experience_id,
        type: q.type,
        questionText: q.question_text,
        englishTranslation: q.english_translation,
        order: q.order,
        options: (options ?? []).map((o) => ({
          id: o.id,
          questionId: o.question_id,
          germanText: o.german_text,
          englishText: o.english_text,
          correct: o.correct,
        })),
      };
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
      return {
        id: ch.id,
        experienceId: ch.experience_id,
        type: ch.type,
        question: ch.question,
        questionEnglish: ch.question_english,
        items: (items ?? []).map((i) => ({
          id: i.id,
          challengeId: i.challenge_id,
          text: i.text,
          translation: i.translation,
          order: i.order,
          correctValue: i.correct_value,
        })),
      };
    })
  );

  return NextResponse.json({
    id: exp.id,
    moduleId: exp.module_id,
    title: exp.title,
    description: exp.description,
    audioUrl: exp.audio_url,
    imageUrl: exp.image_url,
    duration: exp.duration,
    xpReward: exp.xp_reward,
    order: exp.order,
    transcripts: transcriptsResult.data.map((t) => ({
      id: t.id,
      experienceId: t.experience_id,
      order: t.order,
      germanText: t.german_text,
      englishText: t.english_text,
    })),
    questions: questionsWithOptions,
    challenges: challengesWithItems,
    vocabulary: vocabWords,
  });
}
