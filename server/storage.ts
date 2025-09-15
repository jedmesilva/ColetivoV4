import { db } from "./db";
import { 
  accounts, funds, contributions, fundMembers, accountTransactions,
  type Account, type Fund, type Contribution, type FundMember, type AccountTransaction,
  type InsertAccount, type InsertFund, type InsertContribution, type InsertFundMember,
  // Manter compatibilidade
  type User, type InsertUser
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Account operations (mantendo compatibilidade com User)
  getUser(id: string): Promise<Account | undefined>;
  getUserByUsername(username: string): Promise<Account | undefined>;
  createUser(insertUser: InsertAccount): Promise<Account>;

  // Fund operations
  getFunds(): Promise<Fund[]>;
  getFund(id: number): Promise<Fund | undefined>;
  createFund(insertFund: InsertFund, userId: string): Promise<Fund>;
  updateFund(id: number, updates: Partial<Fund>): Promise<Fund | undefined>;

  // Fund member operations
  getFundMembers(fundId: number): Promise<FundMember[]>;
  addFundMember(insertMember: InsertFundMember): Promise<FundMember>;

  // Contribution operations
  getContributions(fundId: number): Promise<Contribution[]>;
  createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution>;
  deleteContribution(id: string): Promise<boolean>;
}

// Drizzle storage implementation
class DrizzleStorage implements IStorage {
  // Account operations (usando tabela accounts)
  async getUser(id: string): Promise<Account | undefined> {
    try {
      const result = await db.select().from(accounts).where(eq(accounts.id, parseInt(id)));
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<Account | undefined> {
    try {
      const result = await db.select().from(accounts).where(eq(accounts.email, username));
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async createUser(insertUser: InsertAccount): Promise<Account> {
    const result = await db.insert(accounts).values(insertUser).returning();
    return result[0];
  }

  // Fund operations
  async getFunds(): Promise<Fund[]> {
    return await db.select().from(funds).orderBy(desc(funds.createdAt));
  }

  async getFund(id: number): Promise<Fund | undefined> {
    try {
      const result = await db.select().from(funds).where(eq(funds.id, id));
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async createFund(insertFund: InsertFund, userId: string): Promise<Fund> {
    const fundData = {
      name: insertFund.name,
      objective: insertFund.objective,
      fundImageType: "emoji" as const,
      fundImageValue: insertFund.fundImageValue || "💰",
      contributionRate: insertFund.contributionRate || "100.00",
      retributionRate: insertFund.retributionRate || "100.00",
      isOpenForNewMembers: insertFund.isOpenForNewMembers ?? true,
      requiresApprovalForNewMembers: insertFund.requiresApprovalForNewMembers ?? false,
      createdBy: parseInt(userId),
      isActive: true,
      governanceType: "quorum" as const,
      quorumPercentage: "60.00",
      votingRestriction: "all_members" as const,
      proposalExpiryHours: 168,
      allowMemberProposals: true,
      autoExecuteApproved: true,
    };

    const result = await db.insert(funds).values(fundData).returning();
    return result[0];
  }

  async updateFund(id: number, updates: Partial<Fund>): Promise<Fund | undefined> {
    try {
      const result = await db.update(funds).set(updates).where(eq(funds.id, id)).returning();
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  // Fund member operations
  async getFundMembers(fundId: number): Promise<FundMember[]> {
    return await db.select().from(fundMembers).where(eq(fundMembers.fundId, fundId));
  }

  async addFundMember(insertMember: InsertFundMember): Promise<FundMember> {
    const memberData = {
      fundId: insertMember.fundId,
      accountId: insertMember.accountId,
      role: insertMember.role || "member" as const,
      status: "active" as const,
    };

    const result = await db.insert(fundMembers).values(memberData).returning();
    return result[0];
  }

  // Contribution operations
  async getContributions(fundId: number): Promise<Contribution[]> {
    return await db.select().from(contributions).where(eq(contributions.fundId, fundId)).orderBy(desc(contributions.createdAt));
  }

  async createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution> {
    const contributionData = {
      fundId: insertContribution.fundId,
      accountId: parseInt(userId),
      amount: insertContribution.amount,
      description: insertContribution.description,
      paymentMethod: insertContribution.paymentMethod || "account_balance" as const,
      status: "completed" as const,
    };

    const result = await db.insert(contributions).values(contributionData).returning();
    return result[0];
  }

  async deleteContribution(id: string): Promise<boolean> {
    try {
      await db.delete(contributions).where(eq(contributions.id, parseInt(id)));
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Use DrizzleStorage 
export const storage = new DrizzleStorage();