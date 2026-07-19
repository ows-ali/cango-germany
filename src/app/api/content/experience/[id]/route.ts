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
  const vocabWords = wordIds.length > 0
    ? (await supabase.from("words").select("*").in("id", wordIds)).data ?? []
    : [];

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

  return NextResponse.json({
    ...exp,
    transcripts: transcriptsResult.data,
    questions: questionsWithOptions,
    challenges: challengesWithItems,
    vocabulary: vocabWords,
  });
}
