// Storage layer using Supabase - your existing database

import { supabase } from "./db";
import {
  type Account, type Fund, type Contribution, type FundMember, type AccountTransaction, type Retribution,
  type InsertAccount, type InsertFund, type InsertContribution, type InsertFundMember, type InsertRetribution,
  type CapitalRequest, type InsertCapitalRequestWithPlan, type RetributionPlan,
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
  getUserTotalBalanceInFunds(accountId: string): Promise<number>;
  createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution>;
  deleteContribution(id: string): Promise<boolean>;

  // Retribution operations
  getUserFundPendingRetributionsCount(fundId: string, accountId: string): Promise<number>;

  // Capital request operations
  createCapitalRequestWithPlan(requestData: InsertCapitalRequestWithPlan, accountId: string): Promise<{
    capitalRequest: CapitalRequest;
    retributionPlan: RetributionPlan;
    retributions: Retribution[];
  }>;
  approveCapitalRequest(requestId: string, approverId: string): Promise<{
    capitalRequest: CapitalRequest;
    transaction: AccountTransaction;
  }>;
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

  async getUserTotalBalanceInFunds(accountId: string): Promise<number> {
    console.log('getUserTotalBalanceInFunds called for accountId:', accountId);

    // Calcular usando múltiplas queries para as tabelas corretas

    // 1. Somar todas as contribuições completed do usuário
    const { data: contributions, error: contributionError } = await supabase
      .from('contributions')
      .select('amount')
      .eq('account_id', accountId)
      .eq('status', 'completed');

    if (contributionError) {
      console.error('Error fetching user contributions:', contributionError);
      throw new Error(contributionError.message);
    }

    const totalContributions = (contributions || []).reduce((sum, contribution) => {
      return sum + parseFloat(contribution.amount || '0');
    }, 0);

    // 2. Somar todas as solicitações de capital completed/approved (retiradas)
    const { data: capitalRequests, error: capitalError } = await supabase
      .from('capital_requests')
      .select('amount')
      .eq('account_id', accountId)
      .in('status', ['completed', 'approved']);

    if (capitalError) {
      console.error('Error fetching user capital requests:', capitalError);
      throw new Error(capitalError.message);
    }

    const totalWithdrawals = (capitalRequests || []).reduce((sum, request) => {
      return sum + parseFloat(request.amount || '0');
    }, 0);

    // 3. Somar todas as retribuições completadas da tabela retributions
    const { data: retributions, error: retributionError } = await supabase
      .from('retributions')
      .select('amount')
      .eq('account_id', accountId)
      .eq('status', 'completed');

    if (retributionError) {
      console.error('Error fetching user retributions:', retributionError);
      throw new Error(retributionError.message);
    }

    const totalRetributions = (retributions || []).reduce((sum, retribution) => {
      return sum + parseFloat(retribution.amount || '0');
    }, 0);

    // Cálculo final: contribuições - retiradas - retribuições
    const totalBalanceInFunds = totalContributions - totalWithdrawals - totalRetributions;

    console.log('Balance calculation for user', accountId, ':', {
      totalContributions,
      totalWithdrawals,
      totalRetributions,
      totalBalanceInFunds
    });

    return Math.max(0, totalBalanceInFunds);
  }

  async getUserPendingRetributionsCount(accountId: string): Promise<number> {
    console.log('getUserPendingRetributionsCount called for accountId:', accountId);

    const { data, error } = await supabase
      .from('retributions')
      .select('id')
      .eq('account_id', accountId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching user pending retributions:', error);
      throw new Error(error.message);
    }

    return (data || []).length;
  }

  async getUserFundPendingRetributionsCount(fundId: string, accountId: string): Promise<number> {
    console.log('getUserFundPendingRetributionsCount called for fundId:', fundId, 'accountId:', accountId);

    const { data, error } = await supabase
      .from('retributions')
      .select('id')
      .eq('fund_id', fundId)
      .eq('account_id', accountId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching user fund pending retributions:', error);
      throw new Error(error.message);
    }

    return (data || []).length;
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

  async processContribution(insertContribution: InsertContribution, userId: string): Promise<{
    contribution: Contribution;
    accountTransaction?: any;
    success: boolean;
    message: string;
  }> {
    const paymentMethod = insertContribution.paymentMethod || 'account_balance';
    const amount = parseFloat(insertContribution.amount as string);
    
    try {
      // Primeiro, verificar se o usuário é membro do fundo
      const { data: membership, error: memberError } = await supabase
        .from('fund_members')
        .select('*')
        .eq('fund_id', insertContribution.fundId)
        .eq('account_id', userId)
        .eq('status', 'active')
        .single();

      if (memberError || !membership) {
        throw new Error('Usuário não é membro ativo deste fundo');
      }

      let accountTransaction: any = null;

      // Se o pagamento é do saldo da conta, verificar saldo e criar transação de débito
      if (paymentMethod === 'account_balance') {
        // Verificar saldo disponível
        const accountBalance = await this.getAccountBalance(userId);
        if (!accountBalance || accountBalance.freeBalance < amount) {
          throw new Error('Saldo insuficiente na conta');
        }

        // Criar transação de débito na conta
        const transactionData = {
          account_id: userId,
          fund_id: insertContribution.fundId,
          transaction_type: 'fund_contribution',
          amount: -amount, // Valor negativo para débito
          description: insertContribution.description || 'Contribuição para fundo',
          reference_type: 'contribution',
          reference_id: null, // Será atualizado após criar a contribuição
          status: 'completed'
        };

        const { data: transaction, error: transactionError } = await supabase
          .from('account_transactions')
          .insert(transactionData)
          .select()
          .single();

        if (transactionError) {
          throw new Error(`Erro ao criar transação: ${transactionError.message}`);
        }
        
        accountTransaction = transaction;
      }

      // Criar a contribuição
      const contributionData = {
        fund_id: insertContribution.fundId,
        account_id: userId,
        amount: amount,
        description: insertContribution.description,
        payment_method: paymentMethod,
        status: paymentMethod === 'account_balance' ? 'completed' : 'pending',
        transaction_id: accountTransaction?.id || null
      };

      const { data: contribution, error: contributionError } = await supabase
        .from('contributions')
        .insert(contributionData)
        .select()
        .single();

      if (contributionError) {
        // Se houve erro ao criar contribuição e já criamos transação, fazer rollback
        if (accountTransaction) {
          await supabase
            .from('account_transactions')
            .delete()
            .eq('id', accountTransaction.id);
        }
        throw new Error(`Erro ao criar contribuição: ${contributionError.message}`);
      }

      // Atualizar o reference_id na transação se necessário
      if (accountTransaction) {
        await supabase
          .from('account_transactions')
          .update({ reference_id: contribution.id })
          .eq('id', accountTransaction.id);
      }

      // Atualizar o total contribuído do membro no fundo
      const newTotalContributed = parseFloat(membership.total_contributed || '0') + amount;
      
      const { error: updateError } = await supabase
        .from('fund_members')
        .update({ total_contributed: newTotalContributed.toString() })
        .eq('id', membership.id);

      if (updateError) {
        console.error('Erro ao atualizar total contribuído:', updateError);
        // Não falhar a operação por causa disso, mas logar o erro
      }

      return {
        contribution: contribution as Contribution,
        accountTransaction,
        success: true,
        message: paymentMethod === 'account_balance' 
          ? 'Contribuição processada com sucesso usando saldo da conta'
          : 'Contribuição registrada. Aguardando confirmação do pagamento externo'
      };

    } catch (error) {
      console.error('Erro ao processar contribuição:', error);
      return {
        contribution: null as any,
        accountTransaction: null,
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao processar contribuição'
      };
    }
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

  // Helper function to calculate due dates
  private calculateDueDates(startDate: string, installments: number, frequency: string): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(start);
      
      switch (frequency) {
        case 'monthly':
          dueDate.setMonth(start.getMonth() + i);
          break;
        case 'quarterly':
          dueDate.setMonth(start.getMonth() + (i * 3));
          break;
        case 'semiannual':
          dueDate.setMonth(start.getMonth() + (i * 6));
          break;
        case 'annual':
          dueDate.setFullYear(start.getFullYear() + i);
          break;
        default:
          throw new Error(`Frequência não suportada: ${frequency}`);
      }
      
      dates.push(dueDate);
    }
    
    return dates;
  }

  async createCapitalRequestWithPlan(requestData: InsertCapitalRequestWithPlan, accountId: string): Promise<{
    capitalRequest: CapitalRequest;
    retributionPlan: RetributionPlan;
    retributions: Retribution[];
  }> {
    // 1. Verificar se o usuário é membro ativo do fundo
    const { data: membership, error: membershipError } = await supabase
      .from('fund_members')
      .select('*')
      .eq('fund_id', requestData.fundId)
      .eq('account_id', accountId)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      throw new Error('Usuário não é membro ativo deste fundo');
    }

    // 2. Criar a solicitação de capital
    const { data: capitalRequest, error: requestError } = await supabase
      .from('capital_requests')
      .insert({
        fund_id: requestData.fundId,
        account_id: accountId,
        amount: requestData.amount,
        reason: requestData.reason,
        urgency_level: requestData.urgencyLevel || 'medium',
        status: 'pending'
      })
      .select()
      .single();

    if (requestError || !capitalRequest) {
      throw new Error(`Erro ao criar solicitação de capital: ${requestError?.message}`);
    }

    // 3. Calcular valores das parcelas
    const totalAmount = parseFloat(requestData.amount);
    const installmentAmount = Math.floor((totalAmount * 100) / requestData.installments) / 100;
    const lastInstallmentAmount = totalAmount - (installmentAmount * (requestData.installments - 1));

    // 4. Criar o plano de retribuição
    const { data: retributionPlan, error: planError } = await supabase
      .from('retribution_plans')
      .insert({
        capital_request_id: capitalRequest.id,
        total_amount: requestData.amount,
        installments: requestData.installments,
        frequency: requestData.frequency,
        installment_amount: installmentAmount.toString(),
        start_date: requestData.firstDueDate,
        next_due_date: requestData.firstDueDate,
        status: 'active'
      })
      .select()
      .single();

    if (planError || !retributionPlan) {
      // Reverter criação da solicitação se falhar
      await supabase.from('capital_requests').delete().eq('id', capitalRequest.id);
      throw new Error(`Erro ao criar plano de retribuição: ${planError?.message}`);
    }

    // 5. Calcular datas de vencimento e criar as parcelas
    const dueDates = this.calculateDueDates(requestData.firstDueDate, requestData.installments, requestData.frequency);
    
    const retributionsData = dueDates.map((dueDate, index) => ({
      retribution_plan_id: retributionPlan.id,
      account_id: accountId,
      fund_id: requestData.fundId,
      amount: (index === requestData.installments - 1 ? lastInstallmentAmount : installmentAmount).toString(),
      installment_number: index + 1,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'pending'
    }));

    const { data: retributions, error: retributionsError } = await supabase
      .from('retributions')
      .insert(retributionsData)
      .select();

    if (retributionsError || !retributions) {
      // Reverter criações anteriores se falhar
      await supabase.from('retribution_plans').delete().eq('id', retributionPlan.id);
      await supabase.from('capital_requests').delete().eq('id', capitalRequest.id);
      throw new Error(`Erro ao criar parcelas de retribuição: ${retributionsError?.message}`);
    }

    // 6. Mapear dados para camelCase
    const mappedCapitalRequest = {
      ...capitalRequest,
      fundId: capitalRequest.fund_id,
      accountId: capitalRequest.account_id,
      urgencyLevel: capitalRequest.urgency_level,
      approvedAt: capitalRequest.approved_at,
      approvedBy: capitalRequest.approved_by,
      disbursedAt: capitalRequest.disbursed_at,
      createdAt: capitalRequest.created_at
    } as CapitalRequest;

    const mappedRetributionPlan = {
      ...retributionPlan,
      capitalRequestId: retributionPlan.capital_request_id,
      totalAmount: retributionPlan.total_amount,
      customFrequencyDays: retributionPlan.custom_frequency_days,
      installmentAmount: retributionPlan.installment_amount,
      startDate: retributionPlan.start_date,
      nextDueDate: retributionPlan.next_due_date,
      createdAt: retributionPlan.created_at
    } as RetributionPlan;

    const mappedRetributions = retributions.map(r => ({
      ...r,
      retributionPlanId: r.retribution_plan_id,
      accountId: r.account_id,
      fundId: r.fund_id,
      installmentNumber: r.installment_number,
      dueDate: r.due_date,
      paidDate: r.paid_date,
      paymentMethod: r.payment_method,
      createdAt: r.created_at
    })) as Retribution[];

    return {
      capitalRequest: mappedCapitalRequest,
      retributionPlan: mappedRetributionPlan,
      retributions: mappedRetributions
    };
  }

  async approveCapitalRequest(requestId: string, approverId: string): Promise<{
    capitalRequest: CapitalRequest;
    transaction: AccountTransaction;
  }> {
    // 1. Buscar a solicitação de capital
    const { data: request, error: requestError } = await supabase
      .from('capital_requests')
      .select('*, fund_id, account_id')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error('Solicitação de capital não encontrada');
    }

    if (request.status !== 'pending') {
      throw new Error('Solicitação já foi processada');
    }

    // 2. Verificar se o aprovador é admin do fundo e não é o próprio solicitante
    if (approverId === request.account_id) {
      throw new Error('Um usuário não pode aprovar sua própria solicitação');
    }

    const { data: approverMembership, error: approverError } = await supabase
      .from('fund_members')
      .select('role, total_received')
      .eq('fund_id', request.fund_id)
      .eq('account_id', approverId)
      .eq('status', 'active')
      .single();

    if (approverError || !approverMembership || approverMembership.role !== 'admin') {
      throw new Error('Apenas admins do fundo podem aprovar solicitações');
    }

    // 2.1. Buscar informações do membro solicitante para atualizar total_received
    const { data: requesterMembership, error: requesterError } = await supabase
      .from('fund_members')
      .select('total_received')
      .eq('fund_id', request.fund_id)
      .eq('account_id', request.account_id)
      .eq('status', 'active')
      .single();

    if (requesterError || !requesterMembership) {
      throw new Error('Membro solicitante não encontrado');
    }

    // 3. Verificar saldo do fundo
    const fundBalance = await this.getFundBalance(request.fund_id);
    const requestAmount = parseFloat(request.amount);

    console.log(`Verificando saldo: Fundo ${request.fund_id} tem ${fundBalance.currentBalance}, solicitação é ${requestAmount}`);

    if (fundBalance.currentBalance < requestAmount) {
      throw new Error(`Saldo insuficiente no fundo. Disponível: R$ ${fundBalance.currentBalance.toFixed(2)}, Solicitado: R$ ${requestAmount.toFixed(2)}`);
    }

    // 3.1. Verificar se já não existe uma aprovação duplicada (idempotência)
    if (request.status === 'approved') {
      throw new Error('Esta solicitação já foi aprovada anteriormente');
    }

    // 4. Criar transação na conta do solicitante (entrada de dinheiro)
    const { data: transaction, error: transactionError } = await supabase
      .from('account_transactions')
      .insert({
        account_id: request.account_id,
        fund_id: request.fund_id,
        transaction_type: 'fund_withdrawal',
        amount: request.amount,
        description: `Retirada aprovada do fundo - Solicitação #${requestId}`,
        reference_type: 'capital_request',
        reference_id: requestId,
        status: 'completed'
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      throw new Error(`Erro ao criar transação: ${transactionError?.message}`);
    }

    // 5. Atualizar a solicitação como aprovada
    const { data: approvedRequest, error: updateError } = await supabase
      .from('capital_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approverId,
        disbursed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError || !approvedRequest) {
      // Reverter transação se a atualização falhar
      await supabase.from('account_transactions').delete().eq('id', transaction.id);
      throw new Error(`Erro ao atualizar solicitação: ${updateError?.message}`);
    }

    // 6. Atualizar total recebido do membro solicitante
    const newTotalReceived = parseFloat(requesterMembership.total_received || '0') + requestAmount;
    await supabase
      .from('fund_members')
      .update({
        total_received: newTotalReceived.toString()
      })
      .eq('fund_id', request.fund_id)
      .eq('account_id', request.account_id);

    // 7. Mapear dados para camelCase
    const mappedCapitalRequest = {
      ...approvedRequest,
      fundId: approvedRequest.fund_id,
      accountId: approvedRequest.account_id,
      urgencyLevel: approvedRequest.urgency_level,
      approvedAt: approvedRequest.approved_at,
      approvedBy: approvedRequest.approved_by,
      disbursedAt: approvedRequest.disbursed_at,
      createdAt: approvedRequest.created_at
    } as CapitalRequest;

    const mappedTransaction = {
      ...transaction,
      accountId: transaction.account_id,
      fundId: transaction.fund_id,
      transactionType: transaction.transaction_type,
      referenceType: transaction.reference_type,
      referenceId: transaction.reference_id,
      createdAt: transaction.created_at,
      processedAt: transaction.processed_at
    } as AccountTransaction;

    return {
      capitalRequest: mappedCapitalRequest,
      transaction: mappedTransaction
    };
  }
}

// Export Supabase storage instance
export const storage = new SupabaseStorage();