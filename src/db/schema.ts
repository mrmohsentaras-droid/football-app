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
