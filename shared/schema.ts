import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const funds = pgTable("funds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  growthPercentage: decimal("growth_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  memberCount: integer("member_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
});

export const contributions = pgTable("contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fundId: varchar("fund_id").notNull().references(() => funds.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const insertFundSchema = createInsertSchema(funds).pick({
  name: true,
  description: true,
  emoji: true,
});

export const insertContributionSchema = createInsertSchema(contributions).pick({
  fundId: true,
  amount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFund = z.infer<typeof insertFundSchema>;
export type Fund = typeof funds.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type Contribution = typeof contributions.$inferSelect;
