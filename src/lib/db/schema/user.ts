import { boolean, date, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { experiences, scenarios, words } from "./content";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 200 }),
  authProvider: varchar("auth_provider", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userScenarioSettings = pgTable("user_scenario_settings", {
  userId: text("user_id").notNull().references(() => users.id),
  scenarioId: integer("scenario_id").notNull().references(() => scenarios.id),
  selectedLevelId: integer("selected_level_id").notNull(),
}, (table) => ({
  uniqueUserScenario: uniqueIndex("unique_user_scenario").on(table.userId, table.scenarioId),
}));

export const userExperienceProgress = pgTable("user_experience_progress", {
  userId: text("user_id").notNull().references(() => users.id),
  experienceId: integer("experience_id").notNull().references(() => experiences.id),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  lessonXpClaimed: boolean("lesson_xp_claimed").default(false),
  bonusXpClaimed: boolean("bonus_xp_claimed").default(false),
}, (table) => ({
  uniqueUserExperience: uniqueIndex("unique_user_experience").on(table.userId, table.experienceId),
}));

export const userStats = pgTable("user_stats", {
  userId: text("user_id").primaryKey().references(() => users.id),
  totalXp: integer("total_xp").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: date("last_activity_date"),
});

export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
});

export const userVocabulary = pgTable("user_vocabulary", {
  userId: text("user_id").notNull().references(() => users.id),
  wordId: integer("word_id").notNull().references(() => words.id),
  status: varchar("status", { length: 20 }).notNull().$type<"learning" | "review" | "mastered">().default("learning"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserWord: uniqueIndex("unique_user_word").on(table.userId, table.wordId),
}));
