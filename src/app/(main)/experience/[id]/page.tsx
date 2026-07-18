"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStats } from "@/lib/stats-context";
import { Logo } from "@/components/Logo";

interface TranscriptLine {
  id: number; germanText: string; englishText: string;
}

interface QuestionOption {
  id: number; germanText: string; englishText: string; correct: boolean;
}

interface Question {
  id: number; type: "MCQ" | "MATCHING"; questionText: string;
  englishTranslation: string | null; options: QuestionOption[];
}

interface ChallengeItem {
  id: number; text: string; translation: string | null; order: number; correctValue: string | null;
}

interface Challenge {
  id: number; type: string; items: ChallengeItem[]; question?: string; questionEnglish?: string;
}

interface ExperienceData {
  id: number; title: string; audioUrl: string | null; duration: string;
  transcripts: TranscriptLine[]; questions: Question[]; challenges: Challenge[];
}

const CHALLENGE_TABS = ["VOCAB_MATCH", "ARRANGE_DIALOGUE", "BEST_RESPONSE"] as const;
const TAB_LABELS: Record<string, string> = {
  VOCAB_MATCH: "Match",
  ARRANGE_DIALOGUE: "Arrange Dialogue",
  BEST_RESPONSE: "Best Response",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExperiencePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refreshStats } = useStats();
  const { data: session } = useSession();
  const [data, setData] = useState<ExperienceData | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [mcqCorrect, setMcqCorrect] = useState<Record<number, boolean>>({});
  const [mcqSelected, setMcqSelected] = useState<Record<number, number | null>>({});

  // Matching
  const [matchingPairs, setMatchingPairs] = useState<{ german: string; english: string; matched: boolean }[]>([]);
  const [matchShuffledGerman, setMatchShuffledGerman] = useState<string[]>([]);
  const [matchShuffledEnglish, setMatchShuffledEnglish] = useState<string[]>([]);
  const [matchSelectedGerman, setMatchSelectedGerman] = useState<string | null>(null);
  const [matchWrong, setMatchWrong] = useState(false);

  const [xpEarned, setXpEarned] = useState(false);
  const [xpThisSession, setXpThisSession] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bonusDone, setBonusDone] = useState(false);
  const [progress, setProgress] = useState<{ completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean } | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Challenge tab state
  const [activeTab, setActiveTab] = useState(0);
  const [tabVocabCompleted, setTabVocabCompleted] = useState(false);
  const [tabArrangeCompleted, setTabArrangeCompleted] = useState(false);
  const [tabBestCompleted, setTabBestCompleted] = useState(false);

  // Vocab Match challenge
  const [vocabMatchPairs, setVocabMatchPairs] = useState<{ item: ChallengeItem; matched: boolean }[]>([]);
  const [vocabSelected, setVocabSelected] = useState<string | null>(null);
  const [vocabLeftOrder, setVocabLeftOrder] = useState<number[]>([]);
  const [vocabRightOrder, setVocabRightOrder] = useState<number[]>([]);

  // Arrange Dialogue challenge
  const [arrangeOrder, setArrangeOrder] = useState<number[]>([]);
  const [arrangeShuffled, setArrangeShuffled] = useState<ChallengeItem[]>([]);
  const [arrangeWrong, setArrangeWrong] = useState(false);
  const arrangeCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Best Response challenge
  const [bestShuffled, setBestShuffled] = useState<ChallengeItem[]>([]);
  const [bestResponseSelected, setBestResponseSelected] = useState<number | null>(null);
  const [bestResponseCorrect, setBestResponseCorrect] = useState(false);

  useEffect(() => {
    fetch(`/api/content/experience/${id}`).then((r) => r.json()).then((d) => {
      setData(d);
      const matching = d.questions?.find((q: Question) => q.type === "MATCHING");
      if (matching) {
        const pairs = matching.options.map((o: QuestionOption) => ({ german: o.germanText, english: o.englishText, matched: false }));
        setMatchingPairs(pairs);
        // Shuffle German and English independently
        const de = pairs.map((p: { german: string; english: string; matched: boolean }) => p.german).sort(() => Math.random() - 0.5);
        const en = pairs.map((p: { german: string; english: string; matched: boolean }) => p.english).sort(() => Math.random() - 0.5);
        setMatchShuffledGerman(de);
        setMatchShuffledEnglish(en);
      }
      const vocabChal = d.challenges?.find((c: Challenge) => c.type === "VOCAB_MATCH");
      if (vocabChal) {
        const pairs = vocabChal.items.map((i: ChallengeItem) => ({ item: i, matched: false }));
        setVocabMatchPairs(pairs);
        const indices = pairs.map((_: unknown, i: number) => i);
        setVocabLeftOrder([...indices].sort(() => Math.random() - 0.5));
        setVocabRightOrder([...indices].sort(() => Math.random() - 0.5));
      }
      const arrangeChal = d.challenges?.find((c: Challenge) => c.type === "ARRANGE_DIALOGUE");
      if (arrangeChal) {
        setArrangeShuffled(shuffle(arrangeChal.items));
        setArrangeOrder([]);
      }
      const bestChal = d.challenges?.find((c: Challenge) => c.type === "BEST_RESPONSE");
      if (bestChal) {
        setBestShuffled(shuffle(bestChal.items));
      }
    }).catch(() => { });
  }, [id]);

  useEffect(() => {
    if (!session?.user?.id || !id) return;
    fetch(`/api/user/experience/progress?experienceId=${id}`).then((r) => r.json()).then((p: { completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean }) => {
      setProgress(p);
      if (p.bonusXpClaimed) setBonusDone(true);
    }).catch(() => { });
  }, [session, id]);

  useEffect(() => {
    if (!waveformRef.current || !data) return;
    const bars = 60;
    const wf = waveformRef.current;
    wf.innerHTML = "";
    for (let i = 0; i < bars; i++) {
      const bar = document.createElement("div");
      const height = Math.random() * 80 + 10;
      bar.className = `w-1 rounded-t-full ${i < 20 ? "bg-primary" : "bg-primary/20"}`;
      bar.style.height = `${height}%`;
      wf.appendChild(bar);
    }
  }, [data]);

  const togglePlay = useCallback(() => {
    if (!data) return;
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const text = data.transcripts.map((t) => t.germanText).join(" ");
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [data, isPlaying]);

  // Per-tab completion (derived before early return so hooks stay ordered)
  const vocabChallengeDone = vocabMatchPairs.length > 0 && vocabMatchPairs.every((p) => p.matched);
  const bestChallengeDone = bestResponseCorrect;
  const bonusReady = tabVocabCompleted || tabArrangeCompleted || tabBestCompleted;

  useEffect(() => {
    if (vocabChallengeDone && !tabVocabCompleted) setTabVocabCompleted(true);
  }, [vocabChallengeDone]);
  useEffect(() => {
    const arrangeChal = data?.challenges?.find((c: Challenge) => c.type === "ARRANGE_DIALOGUE");
    if (!arrangeChal) return;
    const allPlaced = arrangeOrder.length === arrangeChal.items.length && arrangeOrder.length > 0;
    if (allPlaced && !tabArrangeCompleted && !arrangeWrong) {
      const isCorrect = arrangeOrder.every((idx, pos) => arrangeShuffled[idx]?.order === pos + 1);
      if (isCorrect) {
        setTabArrangeCompleted(true);
      } else {
        setArrangeWrong(true);
        if (arrangeCheckTimeout.current) clearTimeout(arrangeCheckTimeout.current);
        arrangeCheckTimeout.current = setTimeout(() => {
          setArrangeOrder([]);
          setArrangeWrong(false);
        }, 1500);
      }
    }
  }, [arrangeOrder, arrangeShuffled]);
  useEffect(() => {
    if (bestChallengeDone && !tabBestCompleted) setTabBestCompleted(true);
  }, [bestChallengeDone]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1200px] mx-auto px-margin-mobile py-6 animate-pulse space-y-6">
          <div className="h-48 bg-surface-container-highest rounded-2xl" />
          <div className="h-32 bg-white rounded-2xl border border-outline-variant/30" />
          <div className="h-64 bg-white rounded-2xl border border-outline-variant/30" />
          <div className="h-40 bg-white rounded-2xl border border-outline-variant/30" />
        </div>
      </div>
    );
  }

  const mcqQuestions = data.questions.filter((q) => q.type === "MCQ");
  const matchingQuestion = data.questions.find((q) => q.type === "MATCHING");
  const vocabMatchChallenge = data.challenges?.find((c) => c.type === "VOCAB_MATCH");
  const arrangeChallenge = data.challenges?.find((c) => c.type === "ARRANGE_DIALOGUE");
  const bestChallenge = data.challenges?.find((c) => c.type === "BEST_RESPONSE");

  const allMcqCorrect = mcqQuestions.length === 0 || mcqQuestions.every((q) => mcqCorrect[q.id]);
  const matchingComplete = matchingPairs.length === 0 || matchingPairs.every((p) => p.matched);
  const canComplete = allMcqCorrect && matchingComplete;

  const isReview = progress?.lessonXpClaimed === true;
  const bonusClaimed = bonusDone || progress?.bonusXpClaimed;

  function handleMcqSelect(qId: number, optionIndex: number, isCorrect: boolean) {
    setMcqSelected((prev) => ({ ...prev, [qId]: optionIndex }));
    if (isCorrect) setMcqCorrect((prev) => ({ ...prev, [qId]: true }));
  }

  function handleMatchingGermanSelect(german: string) {
    if (matchingPairs.find((p) => p.german === german)?.matched) return;
    setMatchSelectedGerman(german);
    setMatchWrong(false);
  }

  function handleMatchingEnglishSelect(english: string) {
    if (!matchSelectedGerman) return;
    const pair = matchingPairs.find((p) => p.german === matchSelectedGerman);
    if (!pair || pair.matched) return;
    if (pair.english === english) {
      setMatchingPairs((prev) => prev.map((p) => p.german === matchSelectedGerman ? { ...p, matched: true } : p));
      setMatchSelectedGerman(null);
      setMatchWrong(false);
    } else {
      setMatchWrong(true);
      setMatchSelectedGerman(null);
      setTimeout(() => setMatchWrong(false), 600);
    }
  }

  function handleComplete() {
    if (!canComplete || completing || !data) return;
    setCompleting(true);
    const p1 = fetch("/api/user/experience/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceId: data.id }),
    }).then((r) => r.json());

    const p2 = bonusReady && !bonusClaimed
      ? fetch("/api/user/experience/bonus-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId: data.id }),
      }).then((r) => r.json())
      : Promise.resolve({ bonusXpAwarded: false });

    Promise.all([p1, p2]).then(([res1, res2]) => {
      let earned = 0;
      if (res1.lessonXpAwarded) earned += 50;
      if (res2?.bonusXpAwarded) { setBonusDone(true); earned += 20; }
      setXpThisSession(earned);
      setXpEarned(earned > 0);
      setCompleted(true);
      refreshStats();
    }).catch(() => setCompleting(false));
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-white">check</span>
          </div>
          <h2 className="font-headline text-3xl text-on-surface mb-2">Completed!</h2>
          <p className="text-2xl font-bold text-primary mb-2">+{xpThisSession} XP</p>
          <p className="text-on-surface-variant mb-8">
            {xpThisSession === 70 ? "Great job with bonus!"
              : xpThisSession === 50 ? "Great job!"
                : xpThisSession === 20 ? "Bonus claimed!"
                  : "Reviewing"}
          </p>
          <button onClick={() => router.push("/home")} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-semibold w-full">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md px-margin-mobile h-16 flex items-center justify-between border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
          <Logo size={32} />
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant">Experience</span>
          </div>
        </div>
        {isReview && <span className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">Review</span>}
      </header>

      <main className="flex-grow flex flex-col max-w-[1200px] mx-auto w-full gap-6 px-margin-mobile py-6 pb-32">
        {/* Hero + Audio */}
        <section className="w-full space-y-6">
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary-container to-primary">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            <div className="absolute bottom-4 left-4">
              <h2 className="font-headline text-2xl text-white drop-shadow-lg">{data.title}</h2>
              <p className="text-white/80 text-sm">{data.duration}</p>
            </div>
          </div>

          {/* Waveform + Controls */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
            <div ref={waveformRef} className="flex items-end justify-between h-16 gap-1 mb-4 px-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">0:00</span>
              <div className="flex items-center gap-6">
                <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">replay_10</button>
                <button onClick={togglePlay} className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? "pause" : "play_arrow"}</span>
                </button>
                <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">forward_30</button>
              </div>
              <span className="text-xs text-on-surface-variant">{data.duration}</span>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transcript Column */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-xl text-on-surface">Transcript</h3>
                <button onClick={() => setShowTranslation(!showTranslation)} className="text-primary text-sm hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">translate</span>
                  {showTranslation ? "Hide Translations" : "Show Translations"}
                </button>
              </div>
              <div className="space-y-4">
                {data.transcripts.map((line) => (
                  <div key={line.id} className="p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                    <p className="text-base text-on-surface leading-relaxed">{line.germanText}</p>
                    {showTranslation && <p className="text-sm text-on-surface-variant mt-1">{line.englishText}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Practice Column */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full" />
              <h3 className="font-headline text-xl text-on-surface">Practice</h3>
            </div>

            {/* MCQ Questions - live feedback */}
            {mcqQuestions.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                <div className="flex items-start gap-4 mb-4">
                  <button onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(q.questionText))} className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl text-white">volume_up</span>
                  </button>
                  <div>
                    <p className="font-medium text-on-surface">{q.questionText}</p>
                    {q.englishTranslation && <p className="text-sm text-on-surface-variant">{q.englishTranslation}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = mcqSelected[q.id] === oi;
                    const isCorrectOpt = opt.correct;
                    const isAnsweredCorrectly = mcqCorrect[q.id];
                    let borderClass = "border-outline-variant";
                    if (isSelected) borderClass = isCorrectOpt ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleMcqSelect(q.id, oi, isCorrectOpt)}
                        className={`w-full flex items-center text-left p-3 bg-white border-2 rounded-xl transition-colors ${isAnsweredCorrectly && isCorrectOpt ? "border-green-500 bg-green-50" : borderClass}`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 text-sm font-semibold ${isAnsweredCorrectly && isCorrectOpt ? "bg-green-500 text-white" : isSelected && !isCorrectOpt ? "bg-red-500 text-white" : "bg-surface-container-highest text-on-surface-variant"}`}>
                          {String.fromCharCode(65 + oi)}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium">{opt.germanText}</span>
                          <span className="text-xs text-on-surface-variant ml-2">({opt.englishText})</span>
                        </div>
                        {isAnsweredCorrectly && isCorrectOpt && (
                          <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Matching Exercise - fixed: shuffled independent columns */}
            {matchingQuestion && matchingPairs.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                <h4 className="text-xs text-on-surface-variant uppercase tracking-wider mb-4 font-semibold">Vocabulary Match</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {matchShuffledGerman.map((german) => {
                      const pair = matchingPairs.find((p) => p.german === german);
                      const isSelected = matchSelectedGerman === german;
                      return (
                        <button
                          key={german}
                          onClick={() => handleMatchingGermanSelect(german)}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${pair?.matched ? "border-green-500 bg-green-50 text-green-800" : isSelected ? "border-primary bg-primary/5" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          {german}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {matchShuffledEnglish.map((english) => {
                      const pair = matchingPairs.find((p) => p.english === english);
                      const isWrong = matchWrong && matchSelectedGerman === null && pair && !pair.matched;
                      return (
                        <button
                          key={english}
                          onClick={() => handleMatchingEnglishSelect(english)}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${pair?.matched ? "border-green-500 bg-green-50 text-green-800" : isWrong ? "border-red-500 bg-red-50" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          {english}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bonus Challenge Section - placed after Practice, before Complete button */}
        <section className="max-w-[1200px] mx-auto w-full">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
            <h4 className="font-headline text-lg text-on-surface ">Bonus Challenge</h4>
            <p className=" text-sm text-on-surface mb-3">Do any one challenge and earn upto +20 XP</p>

            {/* 3-tab toggle */}
            <div className="flex p-1 bg-surface-container-high rounded-xl gap-1 mb-4">
              {CHALLENGE_TABS.map((type, i) => {
                const tabDone = type === "VOCAB_MATCH" ? tabVocabCompleted : type === "ARRANGE_DIALOGUE" ? tabArrangeCompleted : tabBestCompleted;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium text-center transition-colors flex items-center justify-center gap-1 ${activeTab === i ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-variant/50"}`}
                  >
                    {TAB_LABELS[type]}
                    {tabDone && (
                      <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {activeTab === 0 && (
              <div className="space-y-3">
                {vocabMatchPairs.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">No vocabulary match available</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        {vocabLeftOrder.map((idx) => {
                          const vp = vocabMatchPairs[idx];
                          return (
                            <button
                              key={vp.item.id}
                              onClick={() => { if (!vp.matched) setVocabSelected(vp.item.text); }}
                              className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${vp.matched ? "border-green-500 bg-green-50 text-green-800" : vocabSelected === vp.item.text ? "border-primary bg-primary/5" : "border-outline-variant bg-white hover:border-primary"}`}
                            >
                              {vp.item.text}
                            </button>
                          );
                        })}
                      </div>
                      <div className="space-y-2">
                        {vocabRightOrder.map((idx) => {
                          const vp = vocabMatchPairs[idx];
                          return (
                            <button
                              key={vp.item.id + "-en"}
                              onClick={() => {
                                if (!vocabSelected || vp.matched) return;
                                const selectedItem = vocabMatchPairs.find((p) => p.item.text === vocabSelected);
                                if (selectedItem && selectedItem.item.correctValue === vp.item.correctValue) {
                                  setVocabMatchPairs((prev) => prev.map((p) => p.item.id === selectedItem.item.id || p.item.id === vp.item.id ? { ...p, matched: true } : p));
                                }
                                setVocabSelected(null);
                              }}
                              disabled={vp.matched}
                              className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${vp.matched ? "border-green-500 bg-green-50 text-green-800" : "border-outline-variant bg-white hover:border-primary"}`}
                            >
                              {vp.item.translation}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-2">
                {!arrangeChallenge ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">No dialogue arrangement available</p>
                ) : (
                  <>
                    <p className="text-xs text-on-surface-variant mb-2">Tap lines in the correct order:</p>
                    {arrangeWrong && (
                      <p className="text-xs text-red-500 text-center mb-2">Incorrect order, try again</p>
                    )}
                    {arrangeShuffled.map((item, i) => {
                      const position = arrangeOrder.indexOf(i);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { if (position < 0 && !arrangeWrong) setArrangeOrder((prev) => [...prev, i]); }}
                          disabled={arrangeWrong}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors flex items-center gap-3 ${position >= 0 ? "border-green-500 bg-green-50" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${position >= 0 ? "bg-green-500 text-white" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {position >= 0 ? position + 1 : "?"}
                          </span>
                          <span>{item.text}</span>
                        </button>
                      );
                    })}
                    {arrangeOrder.length > 0 && !arrangeWrong && (
                      <button onClick={() => setArrangeOrder([])} className="text-xs text-primary hover:underline">Reset order</button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-2">
                {bestShuffled.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">No best response available</p>
                ) : (
                  <>
                    {bestChallenge.question && (
                      <div className="bg-surface-container-low rounded-xl p-4 mb-3 border border-outline-variant/30">
                        <p className="text-sm font-medium text-on-surface">{bestChallenge.question}</p>
                        {bestChallenge.questionEnglish && (
                          <p className="text-xs text-on-surface-variant mt-1">{bestChallenge.questionEnglish}</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-on-surface-variant mb-2">Select the best response:</p>
                    {bestShuffled.map((item, i) => {
                      const isSelected = bestResponseSelected === i;
                      const isCorrectItem = item.correctValue === "correct";
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setBestResponseSelected(i); if (isCorrectItem) setBestResponseCorrect(true); }}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${isSelected && isCorrectItem ? "border-green-500 bg-green-50" : isSelected && !isCorrectItem ? "border-red-500 bg-red-50" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          <span className="font-medium">{item.text}</span>
                          {item.translation && <span className="text-xs text-on-surface-variant ml-2">({item.translation})</span>}
                        </button>
                      );
                    })}
                    {bestResponseSelected !== null && !bestResponseCorrect && (
                      <p className="text-xs text-red-500 text-center">Not quite, try again</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Complete Lesson button - at the very end */}
        <section className="max-w-[1200px] mx-auto w-full">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
            <button
              onClick={handleComplete}
              disabled={!canComplete || completing}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              {(() => {
                let text = "Complete Lesson";
                if (completing) text = "Completing...";
                else if (!isReview) text = `Complete Lesson +${bonusReady ? "70" : "50"} XP`;
                else if (!bonusClaimed && bonusReady) text = "Claim Bonus +20 XP";
                else if (!bonusClaimed) text = "Review Complete";
                else text = "Completed \u2713";
                return text;
              })()}
            </button>
            {!isReview && !bonusReady && (
              <p className="text-xs text-on-surface-variant text-center mt-2">Complete the bonus challenge for +20 XP</p>
            )}
            {isReview && !bonusClaimed && (
              <p className="text-xs text-on-surface-variant text-center mt-2">Complete the bonus challenge to claim +20 XP</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
