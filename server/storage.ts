// Storage layer using Supabase - your existing database

import { supabase } from "./db";
import {
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

// Supabase storage implementation
class SupabaseStorage implements IStorage {
  // Account operations
  async getUser(id: string): Promise<Account | undefined> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    
    // Map snake_case to camelCase
    return {
      ...data,
      passwordHash: data.password_hash,
      fullName: data.full_name,
      birthDate: data.birth_date,
      profilePictureUrl: data.profile_picture_url,
      isActive: data.is_active,
      emailVerified: data.email_verified,
      phoneVerified: data.phone_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Account;
  }

  async getUserByUsername(username: string): Promise<Account | undefined> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', username)
      .single();

    if (error || !data) return undefined;
    
    // Map snake_case to camelCase
    return {
      ...data,
      passwordHash: data.password_hash,
      fullName: data.full_name,
      birthDate: data.birth_date,
      profilePictureUrl: data.profile_picture_url,
      isActive: data.is_active,
      emailVerified: data.email_verified,
      phoneVerified: data.phone_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Account;
  }

  async createUser(insertUser: InsertAccount): Promise<Account> {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(insertUser.passwordHash, saltRounds);

    const userData = {
      email: insertUser.email,
      password_hash: hashedPassword,
      full_name: insertUser.fullName,
      phone: insertUser.phone,
      cpf: insertUser.cpf,
      birth_date: insertUser.birthDate,
      is_active: true,
      email_verified: false,
      phone_verified: false
    };

    const { data, error } = await supabase
      .from('accounts')
      .insert(userData)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create user');
    
    // Map snake_case to camelCase
    return {
      ...data,
      passwordHash: data.password_hash,
      fullName: data.full_name,
      birthDate: data.birth_date,
      profilePictureUrl: data.profile_picture_url,
      isActive: data.is_active,
      emailVerified: data.email_verified,
      phoneVerified: data.phone_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Account;
  }

  async getAccountBalance(accountId: string): Promise<AccountBalance | undefined> {
    console.log('getAccountBalance called for accountId:', accountId);

    // Get account data
    const account = await this.getUser(accountId);
    if (!account) return undefined;

    // Get account transactions to calculate total balance
    const { data: transactions, error: transactionError } = await supabase
      .from('account_transactions')
      .select('transaction_type, amount')
      .eq('account_id', accountId)
      .eq('status', 'completed');

    if (transactionError) throw new Error(transactionError.message);

    // Calculate total balance based on transactions
    let totalBalance = 0;
    if (transactions) {
      for (const transaction of transactions) {
        const amount = parseFloat(transaction.amount || '0');

        // Transactions that increase balance
        if (['deposit', 'fund_withdrawal', 'transfer_in', 'refund'].includes(transaction.transaction_type)) {
          totalBalance += amount;
        }
        // Transactions that decrease balance
        else if (['withdrawal', 'fund_contribution', 'transfer_out', 'fee'].includes(transaction.transaction_type)) {
          totalBalance -= amount;
        }
      }
    }

    // Get total balance in funds (active contributions)
    const { data: fundMemberships, error: memberError } = await supabase
      .from('fund_members')
      .select('total_contributed')
      .eq('account_id', accountId)
      .eq('status', 'active');

    if (memberError) throw new Error(memberError.message);

    let balanceInFunds = 0;
    if (fundMemberships) {
      for (const membership of fundMemberships) {
        balanceInFunds += parseFloat(membership.total_contributed || '0');
      }
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
    const { data, error } = await supabase
      .from('funds')
      .select(`
        id, name, objective,
        contribution_rate, retribution_rate,
        is_open_for_new_members, requires_approval_for_new_members,
        created_by, fund_image_type, fund_image_value, is_active,
        governance_type, quorum_percentage, voting_restriction,
        proposal_expiry_hours, allow_member_proposals, auto_execute_approved,
        created_at, updated_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Map snake_case to camelCase for each fund
    return (data || []).map(fund => ({
      id: fund.id,
      name: fund.name,
      objective: fund.objective,
      contributionRate: fund.contribution_rate,
      retributionRate: fund.retribution_rate,
      isOpenForNewMembers: fund.is_open_for_new_members,
      requiresApprovalForNewMembers: fund.requires_approval_for_new_members,
      createdBy: fund.created_by,
      fundImageType: fund.fund_image_type,
      fundImageValue: fund.fund_image_value,
      isActive: fund.is_active,
      governanceType: fund.governance_type,
      quorumPercentage: fund.quorum_percentage,
      votingRestriction: fund.voting_restriction,
      proposalExpiryHours: fund.proposal_expiry_hours,
      allowMemberProposals: fund.allow_member_proposals,
      autoExecuteApproved: fund.auto_execute_approved,
      createdAt: fund.created_at,
      updatedAt: fund.updated_at
    })) as Fund[];
  }

  async getFund(id: string): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .select(`
        id, name, objective,
        contribution_rate, retribution_rate,
        is_open_for_new_members, requires_approval_for_new_members,
        created_by, fund_image_type, fund_image_value, is_active,
        governance_type, quorum_percentage, voting_restriction,
        proposal_expiry_hours, allow_member_proposals, auto_execute_approved,
        created_at, updated_at
      `)
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    // Map snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      objective: data.objective,
      contributionRate: data.contribution_rate,
      retributionRate: data.retribution_rate,
      isOpenForNewMembers: data.is_open_for_new_members,
      requiresApprovalForNewMembers: data.requires_approval_for_new_members,
      createdBy: data.created_by,
      fundImageType: data.fund_image_type,
      fundImageValue: data.fund_image_value,
      isActive: data.is_active,
      governanceType: data.governance_type,
      quorumPercentage: data.quorum_percentage,
      votingRestriction: data.voting_restriction,
      proposalExpiryHours: data.proposal_expiry_hours,
      allowMemberProposals: data.allow_member_proposals,
      autoExecuteApproved: data.auto_execute_approved,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Fund;
  }

  async createFund(insertFund: InsertFund, userId: string): Promise<Fund> {
    const fundData = {
      name: insertFund.name,
      objective: insertFund.objective,
      fund_image_type: 'emoji',
      fund_image_value: insertFund.fundImageValue || '💰',
      contribution_rate: insertFund.contributionRate || 100,
      retribution_rate: insertFund.retributionRate || 100,
      is_open_for_new_members: insertFund.isOpenForNewMembers ?? true,
      requires_approval_for_new_members: insertFund.requiresApprovalForNewMembers ?? false,
      created_by: userId,
      is_active: true,
      governance_type: 'quorum',
      quorum_percentage: 60.00,
      voting_restriction: 'all_members',
      proposal_expiry_hours: 168,
      allow_member_proposals: true,
      auto_execute_approved: true,
    };

    const { data, error } = await supabase
      .from('funds')
      .insert(fundData)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create fund');
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      objective: data.objective,
      contributionRate: data.contribution_rate,
      retributionRate: data.retribution_rate,
      isOpenForNewMembers: data.is_open_for_new_members,
      requiresApprovalForNewMembers: data.requires_approval_for_new_members,
      createdBy: data.created_by,
      fundImageType: data.fund_image_type,
      fundImageValue: data.fund_image_value,
      isActive: data.is_active,
      governanceType: data.governance_type,
      quorumPercentage: data.quorum_percentage,
      votingRestriction: data.voting_restriction,
      proposalExpiryHours: data.proposal_expiry_hours,
      allowMemberProposals: data.allow_member_proposals,
      autoExecuteApproved: data.auto_execute_approved,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Fund;
  }

  async updateFund(id: string, updates: Partial<Fund>): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return data as Fund;
  }

  // Fund member operations
  async getFundMembers(fundId: string): Promise<FundMember[]> {
    const { data, error } = await supabase
      .from('fund_members')
      .select('*')
      .eq('fund_id', fundId)
      .eq('status', 'active');

    if (error) throw new Error(error.message);
    return data as FundMember[];
  }

  async addFundMember(insertMember: InsertFundMember): Promise<FundMember> {
    const memberData = {
      fund_id: insertMember.fundId,
      account_id: insertMember.accountId,
      role: insertMember.role || 'member',
      status: 'active',
    };

    const { data, error } = await supabase
      .from('fund_members')
      .insert(memberData)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to add fund member');
    return data as FundMember;
  }

  // Contribution operations
  async getContributions(fundId: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('fund_id', fundId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Contribution[];
  }

  async createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution> {
    const contributionData = {
      fund_id: insertContribution.fundId,
      account_id: userId,
      amount: insertContribution.amount,
      description: insertContribution.description,
      payment_method: insertContribution.paymentMethod || 'account_balance',
      status: 'completed',
    };

    const { data, error } = await supabase
      .from('contributions')
      .insert(contributionData)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create contribution');
    return data as Contribution;
  }

  async deleteContribution(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', id);

    return !error;
  }
}

// Export Supabase storage instance
export const storage = new SupabaseStorage();