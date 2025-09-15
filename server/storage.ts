// Storage layer using Drizzle ORM for Replit PostgreSQL database

import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  accounts, funds, contributions, fundMembers, accountTransactions,
  type Account, type Fund, type Contribution, type FundMember, type AccountTransaction,
  type InsertAccount, type InsertFund, type InsertContribution, type InsertFundMember,
  // Maintain compatibility
  type User, type InsertUser
} from "@shared/schema";
import bcrypt from "bcrypt";

// Account balance interface
export interface AccountBalance {
  accountId: string;
  totalBalance: number;
  freeBalance: number;
  balanceInFunds: number;
  account: Account;
}

export interface IStorage {
  // Account operations (maintaining compatibility with User)
  getUser(id: string): Promise<Account | undefined>;
  getUserByUsername(username: string): Promise<Account | undefined>;
  createUser(insertUser: InsertAccount): Promise<Account>;
  getAccountBalance(accountId: string): Promise<AccountBalance | undefined>;

  // Fund operations
  getFunds(): Promise<Fund[]>;
  getFund(id: string): Promise<Fund | undefined>;
  createFund(insertFund: InsertFund, userId: string): Promise<Fund>;
  updateFund(id: string, updates: Partial<Fund>): Promise<Fund | undefined>;

  // Fund member operations
  getFundMembers(fundId: string): Promise<FundMember[]>;
  addFundMember(insertMember: InsertFundMember): Promise<FundMember>;

  // Contribution operations
  getContributions(fundId: string): Promise<Contribution[]>;
  createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution>;
  deleteContribution(id: string): Promise<boolean>;
}

// Drizzle-based storage implementation
class DrizzleStorage implements IStorage {
  // Account operations
  async getUser(id: string): Promise<Account | undefined> {
    const result = await db.select().from(accounts).where(eq(accounts.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<Account | undefined> {
    const result = await db.select().from(accounts).where(eq(accounts.email, username));
    return result[0];
  }

  async createUser(insertUser: InsertAccount): Promise<Account> {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(insertUser.passwordHash, saltRounds);

    // Generate a UUID for the new account
    const { randomUUID } = await import('crypto');
    
    const userData = {
      id: randomUUID(),
      ...insertUser,
      passwordHash: hashedPassword,
    };

    const result = await db.insert(accounts).values(userData).returning();
    return result[0];
  }

  async getAccountBalance(accountId: string): Promise<AccountBalance | undefined> {
    console.log('getAccountBalance called for accountId:', accountId);

    // Get account data
    const account = await this.getUser(accountId);
    if (!account) return undefined;

    // Get account transactions to calculate total balance
    const transactions = await db.select()
      .from(accountTransactions)
      .where(and(
        eq(accountTransactions.accountId, accountId),
        eq(accountTransactions.status, 'completed')
      ));

    // Calculate total balance based on transactions
    let totalBalance = 0;
    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount || '0');

      // Transactions that increase balance
      if (['deposit', 'fund_withdrawal', 'transfer_in', 'refund'].includes(transaction.transactionType)) {
        totalBalance += amount;
      }
      // Transactions that decrease balance
      else if (['withdrawal', 'fund_contribution', 'transfer_out', 'fee'].includes(transaction.transactionType)) {
        totalBalance -= amount;
      }
    }

    // Get total balance in funds (active contributions)
    const fundMemberships = await db.select()
      .from(fundMembers)
      .where(and(
        eq(fundMembers.accountId, accountId),
        eq(fundMembers.status, 'active')
      ));

    let balanceInFunds = 0;
    for (const membership of fundMemberships) {
      balanceInFunds += parseFloat(membership.totalContributed || '0');
    }

    const freeBalance = totalBalance - balanceInFunds;

    return {
      accountId,
      totalBalance,
      freeBalance: Math.max(0, freeBalance), // Don't allow negative free balance
      balanceInFunds,
      account
    };
  }

  // Fund operations
  async getFunds(): Promise<Fund[]> {
    const result = await db.select().from(funds).orderBy(desc(funds.createdAt));
    return result;
  }

  async getFund(id: string): Promise<Fund | undefined> {
    const result = await db.select().from(funds).where(eq(funds.id, id));
    return result[0];
  }

  async createFund(insertFund: InsertFund, userId: string): Promise<Fund> {
    const fundData = {
      ...insertFund,
      createdBy: userId,
      fundImageType: 'emoji' as const,
      fundImageValue: insertFund.fundImageValue || '💰',
      isActive: true,
      governanceType: 'quorum' as const,
      quorumPercentage: '60.00',
      votingRestriction: 'all_members' as const,
      proposalExpiryHours: 168,
      allowMemberProposals: true,
      autoExecuteApproved: true,
    };

    const result = await db.insert(funds).values(fundData).returning();
    return result[0];
  }

  async updateFund(id: string, updates: Partial<Fund>): Promise<Fund | undefined> {
    const result = await db.update(funds)
      .set(updates)
      .where(eq(funds.id, id))
      .returning();
    return result[0];
  }

  // Fund member operations
  async getFundMembers(fundId: string): Promise<FundMember[]> {
    const result = await db.select()
      .from(fundMembers)
      .where(and(
        eq(fundMembers.fundId, fundId),
        eq(fundMembers.status, 'active')
      ));
    return result;
  }

  async addFundMember(insertMember: InsertFundMember): Promise<FundMember> {
    const memberData = {
      ...insertMember,
      role: insertMember.role || 'member' as const,
      status: 'active' as const,
    };

    const result = await db.insert(fundMembers).values(memberData).returning();
    return result[0];
  }

  // Contribution operations
  async getContributions(fundId: string): Promise<Contribution[]> {
    const result = await db.select()
      .from(contributions)
      .where(eq(contributions.fundId, fundId))
      .orderBy(desc(contributions.createdAt));
    return result;
  }

  async createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution> {
    const contributionData = {
      ...insertContribution,
      accountId: userId,
      paymentMethod: insertContribution.paymentMethod || 'account_balance' as const,
      status: 'completed' as const,
    };

    const result = await db.insert(contributions).values(contributionData).returning();
    return result[0];
  }

  async deleteContribution(id: string): Promise<boolean> {
    try {
      await db.delete(contributions).where(eq(contributions.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting contribution:', error);
      return false;
    }
  }
}

// Export storage instance
export const storage = new DrizzleStorage();