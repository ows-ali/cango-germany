import Dexie, { type Table } from "dexie";

export interface CachedScenario {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
}

export interface CachedModule {
  id: number;
  scenarioLevelId: number;
  title: string;
  order: number;
}

export interface CachedExperience {
  id: number;
  moduleId: number;
  title: string;
  description: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  duration: string | null;
  xpReward: number;
  order: number;
}

export interface CachedTranscriptLine {
  id: number;
  experienceId: number;
  order: number;
  germanText: string;
  englishText: string;
}

export interface CachedQuestion {
  id: number;
  experienceId: number;
  type: "MCQ" | "MATCHING";
  questionText: string;
  englishTranslation: string | null;
  order: number;
}

export interface CachedQuestionOption {
  id: number;
  questionId: number;
  germanText: string;
  englishText: string;
  correct: boolean;
}

export interface CachedChallenge {
  id: number;
  experienceId: number;
  type: string;
}

export interface CachedChallengeItem {
  id: number;
  challengeId: number;
  text: string;
  translation: string | null;
  order: number;
  correctValue: string | null;
}

class CanGoCache extends Dexie {
  scenarios!: Table<CachedScenario, number>;
  modules!: Table<CachedModule, number>;
  experiences!: Table<CachedExperience, number>;
  transcripts!: Table<CachedTranscriptLine, number>;
  questions!: Table<CachedQuestion, number>;
  questionOptions!: Table<CachedQuestionOption, number>;
  challenges!: Table<CachedChallenge, number>;
  challengeItems!: Table<CachedChallengeItem, number>;

  constructor() {
    super("CanGoCache");
    this.version(1).stores({
      scenarios: "id, slug, order",
      modules: "id, scenarioLevelId",
      experiences: "id, moduleId, order",
      transcripts: "id, experienceId, order",
      questions: "id, experienceId, type, order",
      questionOptions: "id, questionId",
      challenges: "id, experienceId, type",
      challengeItems: "id, challengeId, order",
    });
  }
}

export const cache = new CanGoCache();
