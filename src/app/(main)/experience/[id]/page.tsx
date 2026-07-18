"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

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
  const [data, setData] = useState<ExperienceData | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({});
  const [submittedMcq, setSubmittedMcq] = useState<Record<number, boolean>>({});
  const [selectedMcq, setSelectedMcq] = useState<Record<number, number | null>>({});
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, string>>({});
  const [xpEarned, setXpEarned] = useState(false);
  const [completed, setCompleted] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/content/experience/${id}`).then((r) => r.json()).then(setData).catch(() => {});
  }, [id]);

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
  const challengeTypes = ["VOCAB_MATCH", "ARRANGE_DIALOGUE", "BEST_RESPONSE"];

  function handleMcqSubmit(qId: number) {
    setSubmittedMcq((prev) => ({ ...prev, [qId]: true }));
  }

  function handleComplete() {
    setCompleted(true);
    setXpEarned(true);
  }

  function isMcqCorrect(qId: number) {
    const q = mcqQuestions.find((mq) => mq.id === qId);
    if (!q) return false;
    const selected = selectedMcq[qId];
    if (selected === null || selected === undefined) return false;
    return q.options[selected]?.correct;
  }

  function handleMatchingSelect(german: string, english: string) {
    setMatchingSelections((prev) => ({ ...prev, [german]: english }));
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
          <p className="text-on-surface-variant mb-8">
            {!xpEarned ? "" : "Bonus available: +20 XP"}
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
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="#1e293b" strokeWidth="3" />
            <path d="M16 6V26" stroke="#1e293b" strokeWidth="3" />
          </svg>
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant">Experience</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30">
            <span className="material-symbols-outlined text-orange-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <span className="text-xs font-semibold text-on-surface">500 XP</span>
          </div>
        </div>
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

            {/* MCQ Questions */}
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
                    const isSelected = selectedMcq[q.id] === oi;
                    const isSubmitted = submittedMcq[q.id];
                    const isCorrect = opt.correct;
                    let borderClass = "border-outline-variant";
                    if (isSubmitted) {
                      borderClass = isCorrect ? "border-green-500 bg-green-50" : isSelected ? "border-red-500 bg-red-50" : "border-outline-variant";
                    } else if (isSelected) {
                      borderClass = "border-primary bg-primary/5";
                    }
                    return (
                      <button
                        key={opt.id}
                        onClick={() => !submittedMcq[q.id] && setSelectedMcq((prev) => ({ ...prev, [q.id]: oi }))}
                        className={`w-full flex items-center text-left p-3 bg-white border-2 rounded-xl transition-colors ${borderClass}`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 text-sm font-semibold ${isSubmitted && isCorrect ? "bg-green-500 text-white" : isSubmitted && isSelected ? "bg-red-500 text-white" : "bg-surface-container-highest text-on-surface-variant"}`}>
                          {String.fromCharCode(65 + oi)}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium">{opt.germanText}</span>
                          <span className="text-xs text-on-surface-variant ml-2">({opt.englishText})</span>
                        </div>
                        {isSubmitted && isCorrect && (
                          <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {!submittedMcq[q.id] && (
                  <button onClick={() => handleMcqSubmit(q.id)} className="mt-3 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold w-full">
                    Check Answer
                  </button>
                )}
              </div>
            ))}

            {/* Matching Exercise */}
            {matchingQuestion && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                <h4 className="text-xs text-on-surface-variant uppercase tracking-wider mb-4 font-semibold">Vocabulary Match</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {matchingQuestion.options.slice(0, Math.ceil(matchingQuestion.options.length / 2)).map((opt) => (
                      <button key={opt.id} className="w-full p-3 rounded-lg border border-outline-variant bg-white text-on-surface text-left text-sm hover:border-primary transition-colors">
                        {opt.germanText}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {matchingQuestion.options.slice(Math.ceil(matchingQuestion.options.length / 2)).map((opt) => (
                      <button key={opt.id} className="w-full p-3 rounded-lg border border-outline-variant bg-white text-on-surface text-left text-sm hover:border-primary transition-colors">
                        {opt.englishText}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Challenge Section */}
            {challenge && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                <h4 className="font-headline text-base text-on-surface mb-3">Bonus Challenge</h4>
                <div className="flex p-1 bg-surface-container-high rounded-xl gap-1 mb-4">
                  {challengeTypes.map((type, i) => (
                    <button
                      key={type}
                      onClick={() => setActiveChallenge(i)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium text-center transition-colors ${activeChallenge === i ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-variant/50"}`}
                    >
                      {type === "VOCAB_MATCH" ? "Match" : type === "ARRANGE_DIALOGUE" ? "Dialogue" : "Response"}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {challenge.items
                    .filter((ci) => {
                      const type = challengeTypes[activeChallenge];
                      if (type === "VOCAB_MATCH") return ci.correctValue;
                      if (type === "ARRANGE_DIALOGUE") return true;
                      return ci.translation;
                    })
                    .map((ci) => (
                      <div key={ci.id} className="p-3 rounded-lg border border-outline-variant bg-white">
                        <p className="text-sm">{ci.text}</p>
                        {ci.translation && <p className="text-xs text-on-surface-variant mt-1">{ci.translation}</p>}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Bottom Action */}
      <footer className="fixed bottom-0 left-0 w-full p-4 z-40 pointer-events-none flex justify-center">
        <button onClick={handleComplete} className="pointer-events-auto bg-primary text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform active:scale-95">
          <span className="font-headline text-lg">Complete Lesson</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
}
