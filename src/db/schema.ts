import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  boolean,
  real,
} from "drizzle-orm/pg-core";

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  matchDate: text("match_date").notNull(),
  matchTime: text("match_time").notNull(),
  league: text("league").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  tip: text("tip").notNull(),
  confidenceScore: real("confidence_score").notNull().default(0),
  isTopPick: boolean("is_top_pick").notNull().default(false),
  pickRank: integer("pick_rank"),
  reasoning: text("reasoning"),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
});

export const sourcePredictions = pgTable("source_predictions", {
  id: serial("id").primaryKey(),

  matchDate: text("match_date").notNull(),
  matchTime: text("match_time").notNull(),

  league: text("league").notNull(),

  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),

  source: text("source").notNull(),
  tip: text("tip").notNull(),

  homeGoals: integer("home_goals"),
  awayGoals: integer("away_goals"),

  isCorrect: boolean("is_correct"),

  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),

  resultCheckedAt: timestamp("result_checked_at"),
});

