import { type User, type InsertUser, type Fund, type InsertFund, type Contribution, type InsertContribution, users, funds, contributions } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getFunds(): Promise<Fund[]>;
  getFund(id: string): Promise<Fund | undefined>;
  createFund(fund: InsertFund, userId: string): Promise<Fund>;
  updateFund(id: string, updates: Partial<Fund>): Promise<Fund | undefined>;
  
  getContributions(fundId: string): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution, userId: string): Promise<Contribution>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private funds: Map<string, Fund>;
  private contributions: Map<string, Contribution>;

  constructor() {
    this.users = new Map();
    this.funds = new Map();
    this.contributions = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const userId = randomUUID();
    const user: User = {
      id: userId,
      username: "lucas",
      password: "password",
      name: "Lucas"
    };
    this.users.set(userId, user);

    // Create sample funds
    const funds: Array<Omit<Fund, 'id'>> = [
      {
        name: "Fundo do futebol",
        description: "Pagar os custos do time",
        emoji: "⚽️",
        balance: "5000.00",
        growthPercentage: "12.00",
        memberCount: 25,
        createdAt: new Date("2024-03-01"),
        createdBy: userId
      },
      {
        name: "Fundo da casa nova",
        description: "Economizar para mudança",
        emoji: "🏠",
        balance: "18500.00",
        growthPercentage: "8.30",
        memberCount: 8,
        createdAt: new Date("2024-01-15"),
        createdBy: userId
      },
      {
        name: "Viagem Europa",
        description: "Trip dos sonhos em família",
        emoji: "✈️",
        balance: "12300.00",
        growthPercentage: "5.70",
        memberCount: 12,
        createdAt: new Date("2023-12-01"),
        createdBy: userId
      },
      {
        name: "Festa de fim de ano",
        description: "Confraternização da família",
        emoji: "🎉",
        balance: "3750.00",
        growthPercentage: "15.20",
        memberCount: 18,
        createdAt: new Date("2024-06-01"),
        createdBy: userId
      }
    ];

    funds.forEach(fund => {
      const id = randomUUID();
      this.funds.set(id, { ...fund, id });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFunds(): Promise<Fund[]> {
    return Array.from(this.funds.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getFund(id: string): Promise<Fund | undefined> {
    return this.funds.get(id);
  }

  async createFund(insertFund: InsertFund, userId: string): Promise<Fund> {
    const id = randomUUID();
    const fund: Fund = {
      ...insertFund,
      id,
      balance: "0.00",
      growthPercentage: "0.00",
      memberCount: 1,
      createdAt: new Date(),
      createdBy: userId
    };
    this.funds.set(id, fund);
    return fund;
  }

  async updateFund(id: string, updates: Partial<Fund>): Promise<Fund | undefined> {
    const fund = this.funds.get(id);
    if (!fund) return undefined;
    
    const updatedFund = { ...fund, ...updates };
    this.funds.set(id, updatedFund);
    return updatedFund;
  }

  async getContributions(fundId: string): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      contribution => contribution.fundId === fundId
    );
  }

  async createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution> {
    const id = randomUUID();
    const contribution: Contribution = {
      ...insertContribution,
      id,
      userId,
      createdAt: new Date()
    };
    this.contributions.set(id, contribution);
    
    // Update fund balance
    const fund = this.funds.get(insertContribution.fundId);
    if (fund) {
      const newBalance = parseFloat(fund.balance) + parseFloat(insertContribution.amount);
      fund.balance = newBalance.toFixed(2);
      this.funds.set(fund.id, fund);
    }
    
    return contribution;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getFunds(): Promise<Fund[]> {
    return await db.select().from(funds).orderBy(funds.createdAt);
  }

  async getFund(id: string): Promise<Fund | undefined> {
    const [fund] = await db.select().from(funds).where(eq(funds.id, id));
    return fund;
  }

  async createFund(insertFund: InsertFund, userId: string): Promise<Fund> {
    const [fund] = await db.insert(funds).values({
      ...insertFund,
      createdBy: userId
    }).returning();
    return fund;
  }

  async updateFund(id: string, updates: Partial<Fund>): Promise<Fund | undefined> {
    const [fund] = await db.update(funds)
      .set(updates)
      .where(eq(funds.id, id))
      .returning();
    return fund;
  }

  async getContributions(fundId: string): Promise<Contribution[]> {
    return await db.select().from(contributions).where(eq(contributions.fundId, fundId));
  }

  async createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution> {
    const [contribution] = await db.insert(contributions).values({
      ...insertContribution,
      userId
    }).returning();
    
    // Update fund balance
    const fund = await this.getFund(insertContribution.fundId);
    if (fund) {
      const newBalance = parseFloat(fund.balance) + parseFloat(insertContribution.amount);
      await this.updateFund(fund.id, { balance: newBalance.toFixed(2) });
    }
    
    return contribution;
  }
}

// Use MemStorage for now due to Supabase connection issues
// Will switch to DatabaseStorage once connection is resolved
export const storage = new MemStorage();
