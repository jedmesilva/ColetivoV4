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
  'pending', 'completed', 'overdue', 'partial'
]);

export const retributionPaymentMethodEnum = pgEnum('retribution_payment_method_enum', [
  'pix', 'ted', 'debit_card', 'credit_card', 'account_balance', 'cash'
]);

export const frequencyEnum = pgEnum('frequency_enum', [
  'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom'
]);

export const retributionPlanStatusEnum = pgEnum('retribution_plan_status_enum', [
  'active', 'completed', 'overdue', 'cancelled'
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
  createdBy: uuid("created_by").references(() => accounts.id),
  fundImageType: fundImageTypeEnum("fund_image_type").default('emoji'),
  fundImageValue: varchar("fund_image_value", { length: 500 }).default('💰'),
  isActive: boolean("is_active").default(true),
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

// Planos de retribuição
export const retributionPlans = pgTable("retribution_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  capitalRequestId: uuid("capital_request_id").references(() => capitalRequests.id),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  installments: integer("installments").notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  customFrequencyDays: integer("custom_frequency_days"),
  installmentAmount: decimal("installment_amount", { precision: 15, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  nextDueDate: date("next_due_date"),
  status: retributionPlanStatusEnum("status").default('active'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Retribuições (estrutura real no banco)
export const retributions = pgTable("retributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  retributionPlanId: uuid("retribution_plan_id").references(() => retributionPlans.id),
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
// TABELAS DE CONFIGURAÇÃO DE FUNDOS (com versionamento temporal)
// ============================================================================

// Configurações de acesso e membros (estrutura real do Supabase)
export const fundAccessSettings = pgTable("fund_access_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id).notNull(),
  isOpenForNewMembers: boolean("is_open_for_new_members").default(true),
  requiresApprovalForNewMembers: boolean("requires_approval_for_new_members").default(false),
  allowsInviteLink: boolean("allows_invite_link").default(true), // Permite entrada por link de convite
  maxMembers: integer("max_members"),
  isActive: boolean("is_active").default(true),
  changedBy: uuid("changed_by").references(() => accounts.id),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Histórico de taxas de contribuição
export const fundContributionRates = pgTable("fund_contribution_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id).notNull(),
  contributionRate: decimal("contribution_rate", { precision: 5, scale: 4 }).notNull(), // Ex: 0.0500 para 5%
  isActive: boolean("is_active").default(true),
  changedBy: uuid("changed_by").references(() => accounts.id).notNull(),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Histórico de taxas de retribuição
export const fundRetributionRates = pgTable("fund_retribution_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id).notNull(),
  retributionRate: decimal("retribution_rate", { precision: 5, scale: 4 }).notNull(), // Ex: 0.1000 para 10%
  isActive: boolean("is_active").default(true),
  changedBy: uuid("changed_by").references(() => accounts.id).notNull(),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Configurações de governança e quorum
export const fundQuorumSettings = pgTable("fund_quorum_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id).notNull(),
  governanceType: governanceTypeEnum("governance_type").default('quorum'),
  quorumPercentage: decimal("quorum_percentage", { precision: 5, scale: 2 }).default("50.00"), // Ex: 50.00 para 50%
  votingRestriction: votingRestrictionEnum("voting_restriction").default('all_members'),
  isActive: boolean("is_active").default(true),
  changedBy: uuid("changed_by").references(() => accounts.id).notNull(),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Configurações de propostas e votações
export const fundProposalSettings = pgTable("fund_proposal_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").references(() => funds.id).notNull(),
  proposalExpiryHours: integer("proposal_expiry_hours").default(168), // Default: 7 dias
  allowMemberProposals: boolean("allow_member_proposals").default(true),
  autoExecuteApproved: boolean("auto_execute_approved").default(false),
  isActive: boolean("is_active").default(true),
  changedBy: uuid("changed_by").references(() => accounts.id).notNull(),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Schema estendido para criar solicitação com plano de retribuição
export const insertCapitalRequestWithPlanSchema = insertCapitalRequestSchema.extend({
  installments: z.number().min(1).max(60),
  frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']),
  firstDueDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida"),
}).refine((data) => {
  // Validar que cada parcela será de pelo menos R$ 0,01 (1 centavo)
  const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  const installmentAmount = amount / data.installments;
  return installmentAmount >= 0.01;
}, {
  message: "Cada parcela deve ser de no mínimo R$ 0,01. Reduza o número de parcelas ou aumente o valor solicitado.",
  path: ["installments"]
});

// Schema para planos de retribuição
export const insertRetributionPlanSchema = createInsertSchema(retributionPlans).pick({
  capitalRequestId: true,
  totalAmount: true,
  installments: true,
  frequency: true,
  installmentAmount: true,
  startDate: true,
});

// Schemas para retributions  
export const insertRetributionSchema = createInsertSchema(retributions).pick({
  retributionPlanId: true,
  accountId: true,
  fundId: true,
  amount: true,
  installmentNumber: true,
  dueDate: true,
}).extend({
  paymentMethod: createInsertSchema(retributions).shape.paymentMethod.optional(),
});

// ============================================================================
// SCHEMAS PARA CONFIGURAÇÕES DE FUNDOS
// ============================================================================

// Schema para configurações de acesso e membros
export const insertFundAccessSettingsSchema = createInsertSchema(fundAccessSettings).pick({
  fundId: true,
  isOpenForNewMembers: true,
  requiresApprovalForNewMembers: true,
  allowsInviteLink: true,
  maxMembers: true,
  changedBy: true,
  changeReason: true,
});

// Schema para taxas de contribuição
export const insertFundContributionRatesSchema = createInsertSchema(fundContributionRates).pick({
  fundId: true,
  contributionRate: true,
  changedBy: true,
  changeReason: true,
});

// Schema para taxas de retribuição
export const insertFundRetributionRatesSchema = createInsertSchema(fundRetributionRates).pick({
  fundId: true,
  retributionRate: true,
  changedBy: true,
  changeReason: true,
});

// Schema para configurações de quorum
export const insertFundQuorumSettingsSchema = createInsertSchema(fundQuorumSettings).pick({
  fundId: true,
  governanceType: true,
  quorumPercentage: true,
  votingRestriction: true,
  changedBy: true,
  changeReason: true,
});

// Schema para configurações de propostas
export const insertFundProposalSettingsSchema = createInsertSchema(fundProposalSettings).pick({
  fundId: true,
  proposalExpiryHours: true,
  allowMemberProposals: true,
  autoExecuteApproved: true,
  changedBy: true,
  changeReason: true,
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
export type InsertCapitalRequestWithPlan = z.infer<typeof insertCapitalRequestWithPlanSchema>;
export type CapitalRequest = typeof capitalRequests.$inferSelect;

export type InsertRetributionPlan = z.infer<typeof insertRetributionPlanSchema>;
export type RetributionPlan = typeof retributionPlans.$inferSelect;

export type InsertRetribution = z.infer<typeof insertRetributionSchema>;
export type Retribution = typeof retributions.$inferSelect;

export type AccountTransaction = typeof accountTransactions.$inferSelect;

// Tipos para as configurações de fundos
export type InsertFundAccessSettings = z.infer<typeof insertFundAccessSettingsSchema>;
export type FundAccessSettings = typeof fundAccessSettings.$inferSelect;

export type InsertFundContributionRates = z.infer<typeof insertFundContributionRatesSchema>;
export type FundContributionRates = typeof fundContributionRates.$inferSelect;

export type InsertFundRetributionRates = z.infer<typeof insertFundRetributionRatesSchema>;
export type FundRetributionRates = typeof fundRetributionRates.$inferSelect;

export type InsertFundQuorumSettings = z.infer<typeof insertFundQuorumSettingsSchema>;
export type FundQuorumSettings = typeof fundQuorumSettings.$inferSelect;

export type InsertFundProposalSettings = z.infer<typeof insertFundProposalSettingsSchema>;
export type FundProposalSettings = typeof fundProposalSettings.$inferSelect;

// ============================================================================
// TIPOS DE COMPATIBILIDADE (para manter a API existente)
// ============================================================================

// Manter compatibilidade com código existente
export type InsertUser = InsertAccount;
export type User = Account;