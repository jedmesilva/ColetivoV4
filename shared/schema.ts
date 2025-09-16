import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, serial, bigserial, bigint, date, json, inet, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const transactionTypeEnum = pgEnum('transaction_type_enum', [
  'deposit', 'withdrawal', 'fund_contribution', 'fund_withdrawal', 
  'transfer_in', 'transfer_out', 'fee', 'refund'
]);

export const referenceTypeEnum = pgEnum('reference_type_enum', [
  'contribution', 'capital_request', 'retribution', 'transfer', 'manual'
]);

export const transactionStatusEnum = pgEnum('transaction_status_enum', [
  'pending', 'completed', 'failed', 'cancelled'
]);

export const fundImageTypeEnum = pgEnum('fund_image_type_enum', ['emoji', 'url']);
export const governanceTypeEnum = pgEnum('governance_type_enum', ['quorum', 'unanimous']);
export const votingRestrictionEnum = pgEnum('voting_restriction_enum', ['all_members', 'admins_only']);

export const memberRoleEnum = pgEnum('member_role_enum', ['admin', 'member']);
export const memberStatusEnum = pgEnum('member_status_enum', ['active', 'pending', 'blocked', 'left', 'removed']);

export const paymentMethodEnum = pgEnum('payment_method_enum', [
  'pix', 'ted', 'debit_card', 'credit_card', 'account_balance'
]);

export const urgencyLevelEnum = pgEnum('urgency_level_enum', ['low', 'medium', 'high', 'urgent']);
export const capitalRequestStatusEnum = pgEnum('capital_request_status_enum', [
  'pending', 'approved', 'rejected', 'completed', 'cancelled'
]);

export const retributionStatusEnum = pgEnum('retribution_status_enum', [
  'pending', 'paid', 'cancelled', 'overdue'
]);

export const retributionPaymentMethodEnum = pgEnum('retribution_payment_method_enum', [
  'pix', 'ted', 'debit_card', 'credit_card', 'account_balance', 'cash'
]);

// ============================================================================
// TABELAS PRINCIPAIS
// ============================================================================

// Contas dos usuários (equivale aos users)
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  cpf: varchar("cpf", { length: 11 }).unique(),
  birthDate: date("birth_date"),
  profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Fundos coletivos
export const funds = pgTable("funds", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  objective: text("objective"),
  contributionRate: decimal("contribution_rate", { precision: 5, scale: 2 }).default("100.00"),
  retributionRate: decimal("retribution_rate", { precision: 5, scale: 2 }).default("100.00"),
  isOpenForNewMembers: boolean("is_open_for_new_members").default(true),
  requiresApprovalForNewMembers: boolean("requires_approval_for_new_members").default(false),
  createdBy: uuid("created_by").references(() => accounts.id),
  fundImageType: fundImageTypeEnum("fund_image_type").default('emoji'),
  fundImageValue: varchar("fund_image_value", { length: 500 }).default('💰'),
  isActive: boolean("is_active").default(true),
  governanceType: governanceTypeEnum("governance_type").default('quorum'),
  quorumPercentage: decimal("quorum_percentage", { precision: 5, scale: 2 }).default("60.00"),
  votingRestriction: votingRestrictionEnum("voting_restriction").default('all_members'),
  proposalExpiryHours: integer("proposal_expiry_hours").default(168),
  allowMemberProposals: boolean("allow_member_proposals").default(true),
  autoExecuteApproved: boolean("auto_execute_approved").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transações das contas
export const accountTransactions = pgTable("account_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  fundId: uuid("fund_id").references(() => funds.id),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  referenceType: referenceTypeEnum("reference_type").notNull(),
  referenceId: uuid("reference_id"),
  status: transactionStatusEnum("status").default('completed'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at").defaultNow(),
});

// Membros dos fundos
export const fundMembers = pgTable("fund_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id),
  accountId: uuid("account_id").references(() => accounts.id),
  role: memberRoleEnum("role").default('member'),
  status: memberStatusEnum("status").default('active'),
  totalContributed: decimal("total_contributed", { precision: 15, scale: 2 }).default("0.00"),
  totalReceived: decimal("total_received", { precision: 15, scale: 2 }).default("0.00"),
  totalReturned: decimal("total_returned", { precision: 15, scale: 2 }).default("0.00"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  removedAt: timestamp("removed_at"),
  removedReason: text("removed_reason"),
});

// Contribuições
export const contributions = pgTable("contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id),
  accountId: uuid("account_id").references(() => accounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  paymentMethod: paymentMethodEnum("payment_method"),
  status: transactionStatusEnum("status").default('pending'),
  transactionId: varchar("transaction_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// Solicitações de capital
export const capitalRequests = pgTable("capital_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id),
  accountId: uuid("account_id").references(() => accounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  urgencyLevel: urgencyLevelEnum("urgency_level").default('medium'),
  status: capitalRequestStatusEnum("status").default('pending'),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by").references(() => accounts.id),
  disbursedAt: timestamp("disbursed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Retribuições (estrutura real no banco)
export const retributions = pgTable("retributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  retributionPlanId: uuid("retribution_plan_id"),
  accountId: uuid("account_id").references(() => accounts.id),
  fundId: uuid("fund_id").references(() => funds.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: retributionStatusEnum("status").default('pending'),
  paymentMethod: retributionPaymentMethodEnum("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// SCHEMAS DE INSERÇÃO E TIPOS
// ============================================================================

// Schemas para accounts (equivale ao insertUserSchema anterior)
export const insertAccountSchema = createInsertSchema(accounts).pick({
  email: true,
  passwordHash: true,
  fullName: true,
  phone: true,
  cpf: true,
  birthDate: true,
});

// Schemas para funds (atualizado para nova estrutura)
export const insertFundSchema = createInsertSchema(funds).pick({
  name: true,
  objective: true,
  fundImageValue: true,
  contributionRate: true,
  retributionRate: true,
  isOpenForNewMembers: true,
  requiresApprovalForNewMembers: true,
});

// Schemas para contributions (atualizado)
export const insertContributionSchema = createInsertSchema(contributions).pick({
  fundId: true,
  amount: true,
  description: true,
  paymentMethod: true,
});

// Schemas para fund_members
export const insertFundMemberSchema = createInsertSchema(fundMembers).pick({
  fundId: true,
  accountId: true,
  role: true,
});

// Schemas para capital_requests  
export const insertCapitalRequestSchema = createInsertSchema(capitalRequests).pick({
  fundId: true,
  amount: true,
  reason: true,
  urgencyLevel: true,
});

// Schemas para retributions  
export const insertRetributionSchema = createInsertSchema(retributions).pick({
  retributionPlanId: true,
  accountId: true,
  fundId: true,
  amount: true,
  installmentNumber: true,
  dueDate: true,
  paymentMethod: true,
});

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertFund = z.infer<typeof insertFundSchema>;
export type Fund = typeof funds.$inferSelect;

export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type Contribution = typeof contributions.$inferSelect;

export type InsertFundMember = z.infer<typeof insertFundMemberSchema>;
export type FundMember = typeof fundMembers.$inferSelect;

export type InsertCapitalRequest = z.infer<typeof insertCapitalRequestSchema>;
export type CapitalRequest = typeof capitalRequests.$inferSelect;

export type InsertRetribution = z.infer<typeof insertRetributionSchema>;
export type Retribution = typeof retributions.$inferSelect;

export type AccountTransaction = typeof accountTransactions.$inferSelect;

// ============================================================================
// TIPOS DE COMPATIBILIDADE (para manter a API existente)
// ============================================================================

// Manter compatibilidade com código existente
export type InsertUser = InsertAccount;
export type User = Account;