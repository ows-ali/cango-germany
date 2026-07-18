"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  id: number; type: string; items: ChallengeItem[];
}

interface ExperienceData {
  id: number; title: string; audioUrl: string | null; duration: string;
  transcripts: TranscriptLine[]; questions: Question[]; challenges: Challenge[];
}

export default function ExperiencePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<ExperienceData | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [matchingPairs, setMatchingPairs] = useState<{ german: string; english: string; matched: boolean }[]>([]);
  const [mcqCorrect, setMcqCorrect] = useState<Record<number, boolean>>({});
  const [mcqSelected, setMcqSelected] = useState<Record<number, number | null>>({});
  const [matchSelectedGerman, setMatchSelectedGerman] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [submittingBonus, setSubmittingBonus] = useState(false);
  const [bonusDone, setBonusDone] = useState(false);
  const [progress, setProgress] = useState<{ completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean } | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Challenge state
  const [arrangeOrder, setArrangeOrder] = useState<number[]>([]);
  const [arrangeShuffled, setArrangeShuffled] = useState<ChallengeItem[]>([]);
  const [bestResponseSelected, setBestResponseSelected] = useState<number | null>(null);
  const [bestResponseCorrect, setBestResponseCorrect] = useState(false);
  const [vocabMatchPairs, setVocabMatchPairs] = useState<{ item: ChallengeItem; matched: boolean }[]>([]);
  const [vocabSelected, setVocabSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/content/experience/${id}`).then((r) => r.json()).then((d) => {
      setData(d);
      const matching = d.questions?.find((q: Question) => q.type === "MATCHING");
      if (matching) {
        setMatchingPairs(
          matching.options.map((o: QuestionOption) => ({ german: o.germanText, english: o.englishText, matched: false }))
        );
      }
      const chal = d.challenges?.[0];
      if (chal) {
        if (chal.type === "ARRANGE_DIALOGUE") {
          const shuffled = [...chal.items].sort(() => Math.random() - 0.5);
          setArrangeShuffled(shuffled);
          setArrangeOrder([]);
        }
        if (chal.type === "VOCAB_MATCH") {
          setVocabMatchPairs(chal.items.map((i: ChallengeItem) => ({ item: i, matched: false })));
        }
      }
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!session?.user?.id || !id) return;
    fetch(`/api/user/experience/progress?experienceId=${id}`).then((r) => r.json()).then(setProgress).catch(() => {});
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

  const speakGerman = useCallback(() => {
    if (!data) return;
    const text = data.transcripts.map((t) => t.germanText).join(" ");
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.85;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  const mcqQuestions = data.questions.filter((q) => q.type === "MCQ");
  const matchingQuestion = data.questions.find((q) => q.type === "MATCHING");
  const challenge = data.challenges?.[0];

  // Derived state
  const allMcqCorrect = mcqQuestions.length > 0 && mcqQuestions.every((q) => mcqCorrect[q.id]);
  const matchingComplete = matchingPairs.length > 0 && matchingPairs.every((p) => p.matched);
  const canComplete = (mcqQuestions.length === 0 || allMcqCorrect) && (matchingPairs.length === 0 || matchingComplete);

  const challengeDone = challenge
    ? challenge.type === "VOCAB_MATCH"
      ? vocabMatchPairs.length > 0 && vocabMatchPairs.every((p) => p.matched)
      : challenge.type === "ARRANGE_DIALOGUE"
        ? arrangeOrder.length === challenge.items.length
        : challenge.type === "BEST_RESPONSE"
          ? bestResponseCorrect
          : false
    : false;

  const isReview = progress?.lessonXpClaimed === true;

  function handleMcqSelect(qId: number, optionIndex: number, isCorrect: boolean) {
    setMcqSelected((prev) => ({ ...prev, [qId]: optionIndex }));
    if (isCorrect) {
      setMcqCorrect((prev) => ({ ...prev, [qId]: true }));
    }
  }

  function handleMatchingGermanSelect(german: string) {
    if (matchingPairs.find((p) => p.german === german)?.matched) return;
    setMatchSelectedGerman(german);
  }

  function handleMatchingEnglishSelect(english: string) {
    if (!matchSelectedGerman) return;
    const pair = matchingPairs.find((p) => p.german === matchSelectedGerman);
    if (!pair || pair.matched) return;
    if (pair.english === english) {
      setMatchingPairs((prev) => prev.map((p) => p.german === matchSelectedGerman ? { ...p, matched: true } : p));
    }
    setMatchSelectedGerman(null);
  }

  function handleComplete() {
    if (!canComplete || completing || !data) return;
    setCompleting(true);
    fetch("/api/user/experience/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceId: data.id }),
    }).then((r) => r.json()).then((res) => {
      setXpEarned(res.lessonXpAwarded);
      setCompleted(true);
    }).catch(() => {
      setCompleting(false);
    });
  }

  function handleBonusComplete() {
    if (submittingBonus || bonusDone || !data) return;
    setSubmittingBonus(true);
    fetch("/api/user/experience/bonus-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceId: data.id }),
    }).then((r) => r.json()).then((res) => {
      if (res.bonusXpAwarded) setBonusDone(true);
      setSubmittingBonus(false);
    }).catch(() => {
      setSubmittingBonus(false);
    });
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-white">check</span>
          </div>
          <h2 className="font-headline text-3xl text-on-surface mb-2">Completed!</h2>
          <p className="text-2xl font-bold text-primary mb-2">+{xpEarned ? "50" : "0"} XP</p>
          {bonusDone && <p className="text-lg font-semibold text-secondary mb-2">+20 Bonus XP</p>}
          <p className="text-on-surface-variant mb-8">{!xpEarned ? "Reviewing" : "Great job!"}</p>
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
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="#1e293b" strokeWidth="3" />
            <path d="M16 6V26" stroke="#1e293b" strokeWidth="3" />
          </svg>
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
            <button onClick={speakGerman} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </button>
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
                <button onClick={speakGerman} className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
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
                    {showTranslation && (
                      <p className="text-sm text-on-surface-variant mt-1">{line.englishText}</p>
                    )}
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
                    {q.englishTranslation && (
                      <p className="text-sm text-on-surface-variant">{q.englishTranslation}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = mcqSelected[q.id] === oi;
                    const isCorrectOpt = opt.correct;
                    const isAnsweredCorrectly = mcqCorrect[q.id];
                    let borderClass = "border-outline-variant";
                    if (isSelected) {
                      borderClass = isCorrectOpt ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
                    }
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

            {/* Matching Exercise */}
            {matchingQuestion && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                <h4 className="text-xs text-on-surface-variant uppercase tracking-wider mb-4 font-semibold">Vocabulary Match</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {matchingQuestion.options.slice(0, Math.ceil(matchingQuestion.options.length / 2)).map((opt) => {
                      const pair = matchingPairs.find((p) => p.german === opt.germanText);
                      const isSelected = matchSelectedGerman === opt.germanText;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleMatchingGermanSelect(opt.germanText)}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${pair?.matched ? "border-green-500 bg-green-50 text-green-800" : isSelected ? "border-primary bg-primary/5" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          {opt.germanText}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {matchingQuestion.options.slice(Math.ceil(matchingQuestion.options.length / 2)).map((opt) => {
                      const pair = matchingPairs.find((p) => p.english === opt.englishText);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleMatchingEnglishSelect(opt.englishText)}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${pair?.matched ? "border-green-500 bg-green-50 text-green-800" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          {opt.englishText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Complete Lesson button - inline */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
              <button
                onClick={handleComplete}
                disabled={!canComplete || completing}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-base shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {completing ? "Completing..." : isReview ? "Complete Review" : `Complete — 50 XP`}
              </button>
              {canComplete && !challengeDone && !isReview && (
                <p className="text-xs text-on-surface-variant text-center mt-2">Do the bonus challenge for +20 XP</p>
              )}
              {canComplete && challengeDone && !isReview && (
                <p className="text-xs text-green-600 text-center mt-2 font-medium">Bonus +20 XP ready! Complete to earn all 70 XP</p>
              )}
            </div>

            {/* Challenge Section */}
            {challenge && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                <h4 className="font-headline text-base text-on-surface mb-3">Bonus Challenge — +20 XP</h4>

                {challenge.type === "VOCAB_MATCH" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        {vocabMatchPairs.map((vp) => (
                          <button
                            key={vp.item.id}
                            onClick={() => {
                              if (vp.matched) return;
                              setVocabSelected(vp.item.text);
                            }}
                            className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${vp.matched ? "border-green-500 bg-green-50 text-green-800" : vocabSelected === vp.item.text ? "border-primary bg-primary/5" : "border-outline-variant bg-white hover:border-primary"}`}
                          >
                            {vp.item.text}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {vocabMatchPairs.map((vp) => {
                          const matchItem = vocabMatchPairs.find((p) => p.item.correctValue === vp.item.correctValue && p.matched);
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
                    {challengeDone && (
                      <button
                        onClick={handleBonusComplete}
                        disabled={submittingBonus || bonusDone}
                        className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
                      >
                        {submittingBonus ? "Claiming..." : bonusDone ? "Bonus Claimed ✓" : "Claim +20 XP"}
                      </button>
                    )}
                  </div>
                )}

                {challenge.type === "ARRANGE_DIALOGUE" && (
                  <div className="space-y-2">
                    <p className="text-xs text-on-surface-variant mb-2">Tap lines in the correct order:</p>
                    {arrangeShuffled.map((item, i) => {
                      const position = arrangeOrder.indexOf(i);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (position >= 0) return;
                            setArrangeOrder((prev) => [...prev, i]);
                          }}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors flex items-center gap-3 ${position >= 0 ? "border-green-500 bg-green-50" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${position >= 0 ? "bg-green-500 text-white" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {position >= 0 ? position + 1 : "?"}
                          </span>
                          <span>{item.text}</span>
                        </button>
                      );
                    })}
                    {arrangeOrder.length > 0 && (
                      <button
                        onClick={() => setArrangeOrder([])}
                        className="text-xs text-primary hover:underline"
                      >
                        Reset order
                      </button>
                    )}
                    {challengeDone && (
                      <button
                        onClick={handleBonusComplete}
                        disabled={submittingBonus || bonusDone}
                        className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
                      >
                        {submittingBonus ? "Claiming..." : bonusDone ? "Bonus Claimed ✓" : "Claim +20 XP"}
                      </button>
                    )}
                  </div>
                )}

                {challenge.type === "BEST_RESPONSE" && (
                  <div className="space-y-2">
                    <p className="text-xs text-on-surface-variant mb-2">Select the best response:</p>
                    {challenge.items.map((item, i) => {
                      const isSelected = bestResponseSelected === i;
                      const isCorrectItem = item.correctValue === "correct";
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setBestResponseSelected(i);
                            if (isCorrectItem) {
                              setBestResponseCorrect(true);
                            }
                          }}
                          className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${isSelected && isCorrectItem ? "border-green-500 bg-green-50" : isSelected && !isCorrectItem ? "border-red-500 bg-red-50" : "border-outline-variant bg-white hover:border-primary"}`}
                        >
                          <span className="font-medium">{item.text}</span>
                          {item.translation && <span className="text-xs text-on-surface-variant ml-2">({item.translation})</span>}
                        </button>
                      );
                    })}
                    {bestResponseCorrect && (
                      <button
                        onClick={handleBonusComplete}
                        disabled={submittingBonus || bonusDone}
                        className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
                      >
                        {submittingBonus ? "Claiming..." : bonusDone ? "Bonus Claimed ✓" : "Claim +20 XP"}
                      </button>
                    )}
                    {bestResponseSelected !== null && !bestResponseCorrect && (
                      <p className="text-xs text-red-500 text-center">Not quite, try again</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
