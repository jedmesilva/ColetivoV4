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
  getUserContributionTotal(fundId: string, accountId: string): Promise<number>;
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
    // 1. Primeiro criar usuário no Supabase Auth (senha não hasheada)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: insertUser.email,
      password: insertUser.passwordHash, // Supabase Auth fará o hash automaticamente
      email_confirm: true, // Auto-confirmar email para simplicidade
      user_metadata: {
        full_name: insertUser.fullName,
        phone: insertUser.phone,
        cpf: insertUser.cpf,
        birth_date: insertUser.birthDate
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      throw new Error(authError?.message || 'Failed to create user in auth system');
    }

    // 2. Depois criar o perfil na tabela accounts usando o ID do auth
    const userData = {
      id: authData.user.id, // Usar o ID do Supabase Auth
      email: insertUser.email,
      password_hash: 'managed_by_supabase_auth', // Placeholder, pois Supabase Auth gerencia
      full_name: insertUser.fullName,
      phone: insertUser.phone,
      cpf: insertUser.cpf,
      birth_date: insertUser.birthDate,
      is_active: true,
      email_verified: authData.user.email_confirmed_at ? true : false,
      phone_verified: false
    };

    const { data, error } = await supabase
      .from('accounts')
      .insert(userData)
      .select()
      .single();

    if (error || !data) {
      // Se falhar ao criar perfil, tentar deletar o usuário auth
      console.error('Error creating profile:', error);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(error?.message || 'Failed to create user profile');
    }

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

    // Get account balance from the account_balances view
    const { data: accountBalance, error: balanceError } = await supabase
      .from('account_balances')
      .select('*')
      .eq('id', accountId)
      .single();

    if (balanceError || !accountBalance) {
      throw new Error(balanceError?.message || 'Account balance not found');
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

    const totalBalance = parseFloat(accountBalance.account_balance || '0');
    const freeBalance = totalBalance - balanceInFunds;

    return {
      accountId,
      totalBalance,
      freeBalance: Math.max(0, freeBalance), // Don't allow negative free balance
      balanceInFunds,
      account: {
        id: accountBalance.id,
        email: accountBalance.email,
        passwordHash: accountBalance.password_hash || '',
        fullName: accountBalance.full_name,
        phone: accountBalance.phone,
        cpf: accountBalance.cpf,
        birthDate: accountBalance.birth_date,
        profilePictureUrl: accountBalance.profile_picture_url,
        isActive: accountBalance.is_active,
        emailVerified: accountBalance.email_verified,
        phoneVerified: accountBalance.phone_verified,
        createdAt: accountBalance.created_at,
        updatedAt: accountBalance.updated_at
      }
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
    console.log('Creating fund with data:', insertFund);
    console.log('User ID:', userId);

    const fundData = {
      name: insertFund.name,
      objective: insertFund.objective,
      fund_image_type: 'emoji' as const,
      fund_image_value: insertFund.fundImageValue || '💰',
      contribution_rate: insertFund.contributionRate || '100.00',
      retribution_rate: insertFund.retributionRate || '100.00',
      is_open_for_new_members: insertFund.isOpenForNewMembers ?? true,
      requires_approval_for_new_members: insertFund.requiresApprovalForNewMembers ?? false,
      created_by: userId,
      is_active: true,
      governance_type: 'quorum' as const,
      quorum_percentage: '60.00',
      voting_restriction: 'all_members' as const,
      proposal_expiry_hours: 168,
      allow_member_proposals: true,
      auto_execute_approved: true,
    };

    const { data, error } = await supabase
      .from('funds')
      .insert(fundData)
      .select()
      .single();

    if (error) {
      console.error('Error creating fund:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to create fund - no data returned');
    }

    console.log('Fund created successfully:', data);

    // Adicionar o criador como admin do fundo
    try {
      await this.addFundMember({
        fundId: data.id,
        accountId: userId,
        role: 'admin'
      });
      console.log('Fund creator added as admin');
    } catch (memberError) {
      console.error('Error adding creator as fund member:', memberError);
      // Não falhar a criação do fundo por isso
    }

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

  async getUserContributionTotal(fundId: string, accountId: string): Promise<number> {
    const { data, error } = await supabase
      .from('contributions')
      .select('amount')
      .eq('fund_id', fundId)
      .eq('account_id', accountId)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching user contributions:', error);
      throw new Error(error.message);
    }

    // Calculate total contributions for this user and fund
    const total = (data || []).reduce((sum, contribution) => {
      return sum + parseFloat(contribution.amount || '0');
    }, 0);

    return total;
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

  // Fund summary operations (includes member count)
  async getFundSummaries(fundIds: string[]): Promise<{ summaries: Array<{ fundId: string; memberCount: number; currentBalance: number }> }> {
    console.log('getFundSummaries called with fundIds:', fundIds);

    if (fundIds.length === 0) {
      return { summaries: [] };
    }

    // Get fund summaries from the fund_summary view
    const { data: fundSummaries, error } = await supabase
      .from('fund_summary')
      .select('id, member_count, fund_balance')
      .in('id', fundIds);

    if (error) {
      console.log('Error accessing fund_summary view:', error);
      // Fallback: get balances and calculate member count separately
      const balanceData = await this.getFundBalances(fundIds);
      const summariesWithMemberCount = [];
      
      for (const balance of balanceData.balances) {
        const { data: memberCount } = await supabase
          .from('fund_members')
          .select('id', { count: 'exact' })
          .eq('fund_id', balance.fundId)
          .eq('status', 'active');
        
        summariesWithMemberCount.push({
          fundId: balance.fundId,
          memberCount: memberCount?.length || 0,
          currentBalance: balance.currentBalance
        });
      }
      
      return { summaries: summariesWithMemberCount };
    }

    // Map results from view
    const summaries = (fundSummaries || []).map(item => ({
      fundId: item.id,
      memberCount: parseInt(item.member_count || '0'),
      currentBalance: parseFloat(item.fund_balance || '0')
    }));

    return { summaries };
  }

  // Fund balance operations
  async getFundBalances(fundIds: string[]): Promise<{ balances: Array<{ fundId: string; currentBalance: number }> }> {
    console.log('getFundBalances called with fundIds:', fundIds);

    if (fundIds.length === 0) {
      return { balances: [] };
    }

    // Get fund balances from Supabase - using fund_balances view if available
    const { data: fundBalances, error } = await supabase
      .from('fund_balances')
      .select('id, fund_balance')
      .in('id', fundIds);

    if (error) {
      console.log('Error accessing fund_balances view, using fallback calculation:', error);

      // Fallback: calculate manually for each fund
      const balances = [];
      for (const fundId of fundIds) {
        const balance = await this.getFundBalance(fundId);
        balances.push(balance);
      }
      return { balances };
    }

    // Map results from view
    const balances = (fundBalances || []).map(item => ({
      fundId: item.id,
      currentBalance: parseFloat(item.fund_balance || '0')
    }));

    return { balances };
  }

  async getFundBalance(fundId: string): Promise<{ fundId: string; currentBalance: number }> {
    console.log('getFundBalance called for fundId:', fundId);

    // First try fund_balances view
    const { data: viewData, error: viewError } = await supabase
      .from('fund_balances')
      .select('id, fund_balance')
      .eq('id', fundId)
      .single();

    if (!viewError && viewData) {
      return {
        fundId: viewData.id,
        currentBalance: parseFloat(viewData.fund_balance || '0')
      };
    }

    // Fallback: calculate from contributions and capital requests
    console.log('Using fallback calculation for fund balance');

    // Get contributions (inflow)
    const { data: contributions, error: contributionError } = await supabase
      .from('contributions')
      .select('amount')
      .eq('fund_id', fundId)
      .eq('status', 'completed');

    if (contributionError) {
      console.error('Error fetching contributions:', contributionError);
      throw new Error(contributionError.message);
    }

    // Get capital requests (outflow)
    const { data: withdrawals, error: withdrawalError } = await supabase
      .from('capital_requests')
      .select('amount')
      .eq('fund_id', fundId)
      .eq('status', 'completed');

    if (withdrawalError) {
      console.error('Error fetching capital requests:', withdrawalError);
      throw new Error(withdrawalError.message);
    }

    // Calculate balance: contributions - withdrawals
    let inflow = 0;
    if (contributions) {
      inflow = contributions.reduce((sum, contribution) => {
        return sum + parseFloat(contribution.amount || '0');
      }, 0);
    }

    let outflow = 0;
    if (withdrawals) {
      outflow = withdrawals.reduce((sum, withdrawal) => {
        return sum + parseFloat(withdrawal.amount || '0');
      }, 0);
    }

    const currentBalance = inflow - outflow;
    console.log('Calculated balance for fund', fundId, ': inflow =', inflow, ', outflow =', outflow, ', balance =', currentBalance);

    return {
      fundId,
      currentBalance
    };
  }
}

// Export Supabase storage instance
export const storage = new SupabaseStorage();