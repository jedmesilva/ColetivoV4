import { type User, type InsertUser, type Fund, type InsertFund, type Contribution, type InsertContribution, users, funds, contributions } from "@shared/schema";
import { randomUUID } from "crypto";
import { db, supabase } from "./db";
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

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }

  async getFunds(): Promise<Fund[]> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Fund[];
  }

  async getFund(id: string): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Fund;
  }

  async createFund(insertFund: InsertFund, userId: string): Promise<Fund> {
    const { data, error } = await supabase
      .from('funds')
      .insert({
        ...insertFund,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Fund;
  }

  async updateFund(id: string, updates: Partial<Fund>): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data as Fund;
  }

  async getContributions(fundId: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('fund_id', fundId);
    
    if (error) throw error;
    return data as Contribution[];
  }

  async createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution> {
    const { data, error } = await supabase
      .from('contributions')
      .insert({
        ...insertContribution,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update fund balance
    const fund = await this.getFund(insertContribution.fundId);
    if (fund) {
      const newBalance = parseFloat(fund.balance) + parseFloat(insertContribution.amount);
      await this.updateFund(fund.id, { balance: newBalance.toFixed(2) });
    }
    
    return data as Contribution;
  }
}

// Use SupabaseStorage via REST API
export const storage = new SupabaseStorage();
