import { CachedScenario, CachedExperience } from "@/lib/cache";

export const MOCK_USER = {
  id: "test-user-1",
  email: "test@example.com",
  name: "Test User",
  cefrLevel: "B1",
  onboardingComplete: true,
  goals: ["work", "daily-life"],
};

export const MOCK_USER_STATS = {
  totalXp: 150,
  currentStreak: 3,
  longestStreak: 5,
  todayXp: 20,
};

export const MOCK_SCENARIOS: ScenarioFixture[] = [
  {
    id: 1,
    slug: "transportation",
    name: "Transportation",
    description: "Navigate public transport in Germany",
    imageUrl: null,
    order: 1,
    levels: [
      {
        level: { id: 1, name: "A2", order: 1 },
        modules: [
          {
            id: 10,
            title: "Buying Tickets",
            description: "Learn to buy tickets at the station",
            order: 1,
            experiences: [
              {
                id: 100,
                title: "At the Ticket Machine",
                duration: "5:00",
                xpReward: 50,
                order: 1,
                transcripts: [
                  { id: 1000, germanText: "Guten Tag, ich möchte eine Fahrkarte kaufen.", englishText: "Good day, I would like to buy a ticket.", order: 1 },
                ],
                questions: [
                  {
                    id: 10000,
                    type: "MCQ",
                    questionText: 'What does "Fahrkarte" mean?',
                    englishTranslation: null,
                    order: 1,
                    options: [
                      { id: 100000, germanText: "Ticket", englishText: "Ticket", correct: true },
                      { id: 100001, germanText: "Food", englishText: "Food", correct: false },
                      { id: 100002, germanText: "Map", englishText: "Map", correct: false },
                    ],
                  },
                ],
                challenges: [
                  {
                    id: 1000,
                    type: "VOCAB_MATCH",
                    items: [
                      { id: 10000, text: "die Fahrkarte", translation: "the ticket", order: 1, correctValue: "ticket" },
                      { id: 10001, text: "der Bahnhof", translation: "the train station", order: 2, correctValue: "station" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        level: { id: 2, name: "B1", order: 2 },
        modules: [
          {
            id: 11,
            title: "Delays & Announcements",
            description: "Understand train announcements",
            order: 1,
            experiences: [
              {
                id: 101,
                title: "Platform Changes",
                duration: "6:00",
                xpReward: 50,
                order: 1,
                transcripts: [],
                questions: [],
                challenges: [],
              },
            ],
          },
        ],
      },
      {
        level: { id: 3, name: "B2", order: 3 },
        modules: [
          {
            id: 12,
            title: "Complaints & Refunds",
            description: "File a complaint about delays",
            order: 1,
            experiences: [
              {
                id: 102,
                title: "Filing a Complaint",
                duration: "7:00",
                xpReward: 50,
                order: 1,
                transcripts: [],
                questions: [],
                challenges: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "doctor",
    name: "Doctor Visit",
    description: "Handle medical appointments and check-ups",
    imageUrl: null,
    order: 2,
    levels: [
      {
        level: { id: 1, name: "A2", order: 1 },
        modules: [
          {
            id: 20,
            title: "Making an Appointment",
            description: "Call to schedule a doctor visit",
            order: 1,
            experiences: [
              {
                id: 200,
                title: "Calling the Practice",
                duration: "4:00",
                xpReward: 50,
                order: 1,
                transcripts: [],
                questions: [],
                challenges: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "job-interview",
    name: "Job Interview",
    description: "Prepare for job interviews in German",
    imageUrl: null,
    order: 3,
    levels: [
      {
        level: { id: 2, name: "B1", order: 2 },
        modules: [
          {
            id: 30,
            title: "Self Introduction",
            description: "Introduce yourself professionally",
            order: 1,
            experiences: [
              {
                id: 300,
                title: "Tell Me About Yourself",
                duration: "5:30",
                xpReward: 50,
                order: 1,
                transcripts: [],
                questions: [],
                challenges: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export interface ScenarioFixture {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  levels: {
    level: { id: number; name: string; order: number };
    modules: {
      id: number;
      title: string;
      description: string | null;
      order: number;
      experiences: ExperienceFixture[];
    }[];
  }[];
}

export interface ExperienceFixture {
  id: number;
  title: string;
  duration: string | null;
  xpReward: number;
  order: number;
  transcripts: { id: number; germanText: string; englishText: string; order: number }[];
  questions: {
    id: number;
    type: string;
    questionText: string;
    englishTranslation: string | null;
    order: number;
    options: { id: number; germanText: string; englishText: string; correct: boolean }[];
  }[];
  challenges: {
    id: number;
    type: string;
    items: { id: number; text: string; translation: string | null; order: number; correctValue: string | null }[];
  }[];
}

export const MOCK_PROGRESS: Record<number, { completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean }> = {
  100: { completed: true, lessonXpClaimed: true, bonusXpClaimed: true },
  101: { completed: true, lessonXpClaimed: true, bonusXpClaimed: false },
};

export const MOCK_SCENARIO_SETTINGS: Record<number, { selectedLevelId: number | null }> = {
  1: { selectedLevelId: 2 },
  2: { selectedLevelId: null },
  3: { selectedLevelId: null },
};
