import { boolean, integer, pgTable, serial, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
});

export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  languageId: integer("language_id").notNull().references(() => languages.id),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
});

export const levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 10 }).notNull().unique(),
  order: integer("order").notNull(),
});

export const scenarioLevels = pgTable("scenario_levels", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull().references(() => scenarios.id),
  levelId: integer("level_id").notNull().references(() => levels.id),
}, (table) => ({
  uniqueScenarioLevel: uniqueIndex("unique_scenario_level").on(table.scenarioId, table.levelId),
}));

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  scenarioLevelId: integer("scenario_level_id").notNull().references(() => scenarioLevels.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  audioUrl: text("audio_url"),
  imageUrl: text("image_url"),
  duration: varchar("duration", { length: 10 }),
  xpReward: integer("xp_reward").notNull().default(50),
  order: integer("order").notNull().default(0),
});

export const transcriptLines = pgTable("transcript_lines", {
  id: serial("id").primaryKey(),
  experienceId: integer("experience_id").notNull().references(() => experiences.id),
  order: integer("order").notNull().default(0),
  germanText: text("german_text").notNull(),
  englishText: text("english_text").notNull(),
});

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  germanWord: varchar("german_word", { length: 200 }).notNull(),
  englishTranslation: varchar("english_translation", { length: 200 }).notNull(),
  article: varchar("article", { length: 20 }),
  plural: varchar("plural", { length: 100 }),
});

export const experienceWords = pgTable("experience_words", {
  experienceId: integer("experience_id").notNull().references(() => experiences.id),
  wordId: integer("word_id").notNull().references(() => words.id),
}, (table) => ({
  uniqueExperienceWord: uniqueIndex("unique_experience_word").on(table.experienceId, table.wordId),
}));

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  experienceId: integer("experience_id").notNull().references(() => experiences.id),
  type: varchar("type", { length: 20 }).notNull().$type<"MCQ" | "MATCHING">(),
  questionText: text("question_text").notNull(),
  englishTranslation: text("english_translation"),
  order: integer("order").notNull().default(0),
});

export const questionOptions = pgTable("question_options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  germanText: text("german_text").notNull(),
  englishText: text("english_text").notNull(),
  correct: boolean("correct").default(false),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  experienceId: integer("experience_id").notNull().references(() => experiences.id),
  type: varchar("type", { length: 20 }).notNull().$type<"BEST_RESPONSE" | "ARRANGE_DIALOGUE" | "VOCAB_MATCH">(),
});

export const challengeItems = pgTable("challenge_items", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  text: text("text").notNull(),
  translation: text("translation"),
  order: integer("order").notNull().default(0),
  correctValue: text("correct_value"),
});
