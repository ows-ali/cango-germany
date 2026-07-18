import { http, HttpResponse } from "msw";
import {
  MOCK_SCENARIOS,
  MOCK_USER,
  MOCK_USER_STATS,
  MOCK_PROGRESS,
  MOCK_SCENARIO_SETTINGS,
} from "@/__tests__/fixtures";

let progressStore = { ...MOCK_PROGRESS };
let scenarioSettingStore = { ...MOCK_SCENARIO_SETTINGS };

function findExperienceById(id: number) {
  for (const scenario of MOCK_SCENARIOS) {
    for (const sl of scenario.levels) {
      for (const mod of sl.modules) {
        const exp = mod.experiences.find((e) => e.id === id);
        if (exp) return exp;
      }
    }
  }
  return null;
}

export const handlers = [
  http.get("*/api/content", () => {
    return HttpResponse.json(MOCK_SCENARIOS);
  }),

  http.get("*/api/content/experience/:id", ({ params }) => {
    const id = parseInt(params.id as string);
    const experience = findExperienceById(id);
    if (!experience)
      return HttpResponse.json({ error: "not found" }, { status: 404 });
    return HttpResponse.json(experience);
  }),

  http.get("*/api/user/profile", () => {
    return HttpResponse.json(MOCK_USER);
  }),

  http.get("*/api/user/stats", () => {
    return HttpResponse.json(MOCK_USER_STATS);
  }),

  http.get("*/api/user/experience/progress/batch", ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids")?.split(",").map(Number) || [];
    const result: Record<number, { completed: boolean; lessonXpClaimed: boolean; bonusXpClaimed: boolean }> = {};
    for (const id of ids) {
      if (progressStore[id]) result[id] = progressStore[id];
    }
    // Include all requested IDs (not just those in store)
    for (const id of ids) {
      result[id] = result[id] || { completed: false, lessonXpClaimed: false, bonusXpClaimed: false };
    }
    return HttpResponse.json(result);
  }),

  http.get("*/api/user/experience/progress", ({ request }) => {
    const url = new URL(request.url);
    const experienceId = parseInt(url.searchParams.get("experienceId") || "");
    if (!experienceId) return HttpResponse.json({ error: "Missing experienceId" }, { status: 400 });
    return HttpResponse.json(
      progressStore[experienceId] || { completed: false, lessonXpClaimed: false, bonusXpClaimed: false }
    );
  }),

  http.post("*/api/user/experience/complete", async ({ request }) => {
    const { experienceId } = await request.json();
    const existing = progressStore[experienceId];
    if (existing?.lessonXpClaimed) {
      return HttpResponse.json({ lessonXpAwarded: false, bonusXpClaimed: existing.bonusXpClaimed });
    }
    progressStore[experienceId] = {
      completed: true,
      lessonXpClaimed: true,
      bonusXpClaimed: existing?.bonusXpClaimed ?? false,
    };
    return HttpResponse.json({ lessonXpAwarded: true, bonusXpClaimed: false });
  }),

  http.post("*/api/user/experience/bonus-complete", async ({ request }) => {
    const { experienceId } = await request.json();
    const existing = progressStore[experienceId];
    if (existing?.bonusXpClaimed) {
      return HttpResponse.json({ bonusXpAwarded: false });
    }
    progressStore[experienceId] = {
      ...existing,
      completed: existing?.completed ?? true,
      lessonXpClaimed: existing?.lessonXpClaimed ?? false,
      bonusXpClaimed: true,
    };
    return HttpResponse.json({ bonusXpAwarded: true });
  }),

  http.get("*/api/user/scenario-setting", ({ request }) => {
    const url = new URL(request.url);
    const scenarioId = parseInt(url.searchParams.get("scenarioId") || "");
    if (!scenarioId) return HttpResponse.json({ error: "Missing scenarioId" }, { status: 400 });
    return HttpResponse.json(scenarioSettingStore[scenarioId] ?? { selectedLevelId: null });
  }),

  http.post("*/api/user/scenario-setting", async ({ request }) => {
    const { scenarioId, levelId } = await request.json();
    scenarioSettingStore[scenarioId] = { selectedLevelId: levelId };
    return HttpResponse.json({ saved: true });
  }),

  http.get("*/api/user/scenario-setting/batch", ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids")?.split(",").map(Number) || [];
    const result: Record<number, { selectedLevelId: number | null }> = {};
    for (const id of ids) {
      if (scenarioSettingStore[id]) result[id] = scenarioSettingStore[id];
    }
    return HttpResponse.json(result);
  }),
];

export function resetStores() {
  progressStore = { ...MOCK_PROGRESS };
  scenarioSettingStore = { ...MOCK_SCENARIO_SETTINGS };
}
