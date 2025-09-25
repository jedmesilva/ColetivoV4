// Storage layer using Supabase - your existing database

import { supabase } from "./db";
import {
  type Account, type Fund, type Contribution, type FundMember, type AccountTransaction, type Retribution,
  type InsertAccount, type InsertFund, type InsertContribution, type InsertFundMember, type InsertRetribution,
  type CapitalRequest, type InsertCapitalRequestWithPlan, type RetributionPlan,
  type FundAccessSettings, type InsertFundAccessSettings,
  type FundQuorumSettings, type InsertFundQuorumSettings,
  type FundContributionRates, type InsertFundContributionRates,
  type FundRetributionRates, type InsertFundRetributionRates,
  type FundDistributionSettings, type InsertFundDistributionSettings,
  // Fund objectives
  type FundObjectiveOption, type FundObjectiveHistory, type CurrentFundObjective,
  type SetStandardObjective, type SetCustomObjective,
  // Maintain compatibility
  type User, type InsertUser
} from "@shared/schema";
import bcrypt from "bcrypt";

// In-memory fallback for fund access settings when Supabase is unavailable
const fundAccessSettingsMemory = new Map<string, FundAccessSettings>();

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
  getFundsForUser(accountId: string): Promise<Fund[]>;
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

  // Fund configuration operations
  getFundAccessSettings(fundId: string): Promise<FundAccessSettings | undefined>;
  updateFundAccessSettings(insertSettings: InsertFundAccessSettings): Promise<FundAccessSettings>;

  // Fund governance operations
  getFundQuorumSettings(fundId: string): Promise<FundQuorumSettings | undefined>;
  updateFundQuorumSettings(insertSettings: InsertFundQuorumSettings): Promise<FundQuorumSettings>;

  // Fund contribution rate operations
  getFundContributionRates(fundId: string): Promise<FundContributionRates | undefined>;
  updateFundContributionRates(insertSettings: InsertFundContributionRates): Promise<FundContributionRates>;

  // Fund retribution rate operations
  getFundRetributionRates(fundId: string): Promise<FundRetributionRates | undefined>;
  updateFundRetributionRates(insertSettings: InsertFundRetributionRates): Promise<FundRetributionRates>;

  // Fund distribution settings operations
  getFundDistributionSettings(fundId: string): Promise<FundDistributionSettings | undefined>;
  updateFundDistributionSettings(insertSettings: InsertFundDistributionSettings): Promise<FundDistributionSettings>;

  // Fund objective operations
  getFundObjectiveOptions(): Promise<FundObjectiveOption[]>;
  getCurrentFundObjective(fundId: string): Promise<CurrentFundObjective | null>;
  setStandardObjective(data: SetStandardObjective): Promise<FundObjectiveHistory>;
  setCustomObjective(data: SetCustomObjective): Promise<FundObjectiveHistory>;
  getFundObjectiveHistory(fundId: string): Promise<FundObjectiveHistory[]>;
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

    // Get account info
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error(accountError?.message || 'Account not found');
    }

    // Get all completed transactions for this account  
    const { data: transactions, error: txError } = await supabase
      .from('account_transactions')
      .select('transaction_type, amount, reference_type, description')
      .eq('account_id', accountId)
      .eq('status', 'completed');

    if (txError) throw new Error(txError.message);

    let totalInflows = 0;     // Total de entradas (depósitos, retiradas de fundos, etc.)
    let totalContributions = 0; // Total contribuído aos fundos
    let totalOtherOutflows = 0;  // Outras saídas (taxas, transferências out, etc.)

    // Separate transactions by type
    for (const tx of transactions || []) {
      const amount = parseFloat(tx.amount || '0');

      if (tx.reference_type === 'contribution') {
        // Contributions to funds (stored as negative, convert to positive)
        totalContributions += Math.abs(amount);
      } else if (amount > 0) {
        // Positive amounts are inflows (deposits, fund withdrawals, transfers in, etc.)
        totalInflows += amount;
      } else {
        // Other negative amounts are outflows (fees, transfers out, etc.)
        totalOtherOutflows += Math.abs(amount);
      }
    }

    // Calculate balances
    const grossBalance = totalInflows - totalContributions - totalOtherOutflows;
    const freeBalance = totalInflows - totalContributions - totalOtherOutflows; // Money not locked in funds
    const balanceInFunds = totalContributions;

    console.log('Balance calculation for user', accountId, ':', {
      totalTransactions: transactions?.length || 0,
      totalInflows,
      totalContributions,
      totalOtherOutflows,
      grossBalance,
      freeBalance,
      balanceInFunds
    });

    return {
      accountId,
      totalBalance: grossBalance,
      freeBalance: Math.max(0, freeBalance), // Don't allow negative free balance
      balanceInFunds,
      account: {
        id: account.id,
        email: account.email,
        passwordHash: account.password_hash || '',
        fullName: account.full_name,
        phone: account.phone,
        cpf: account.cpf,
        birthDate: account.birth_date,
        profilePictureUrl: account.profile_picture_url,
        isActive: account.is_active,
        emailVerified: account.email_verified,
        phoneVerified: account.phone_verified,
        createdAt: account.created_at,
        updatedAt: account.updated_at
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

  // Novo método para buscar fundos onde o usuário é membro ativo
  async getFundsForUser(accountId: string): Promise<Fund[]> {
    const { data, error } = await supabase
      .from('funds')
      .select(`
        id, name, objective, created_by, fund_image_type, fund_image_value, is_active, created_at, updated_at,
        fund_members!inner (account_id, status, role)
      `)
      .eq('is_active', true)
      .eq('fund_members.account_id', accountId)
      .eq('fund_members.status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Map usando apenas os campos que existem na tabela simplificada
    return (data || []).map(fund => ({
      id: fund.id,
      name: fund.name,
      objective: fund.objective,
      createdBy: fund.created_by,
      fundImageType: fund.fund_image_type,
      fundImageValue: fund.fund_image_value,
      isActive: fund.is_active,
      createdAt: fund.created_at,
      updatedAt: fund.updated_at
    })) as Fund[];
  }

  async getFund(id: string): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .select(`
        id, name, objective, created_by, fund_image_type, fund_image_value, is_active, created_at, updated_at
      `)
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    // Map usando apenas os campos que existem na tabela simplificada
    return {
      id: data.id,
      name: data.name,
      objective: data.objective,
      createdBy: data.created_by,
      fundImageType: data.fund_image_type,
      fundImageValue: data.fund_image_value,
      isActive: data.is_active,
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
      created_by: userId,
      is_active: true,
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

    // Map snake_case to camelCase usando apenas os campos da nova estrutura
    return {
      id: data.id,
      name: data.name,
      objective: data.objective,
      createdBy: data.created_by,
      fundImageType: data.fund_image_type,
      fundImageValue: data.fund_image_value,
      isActive: data.is_active,
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
  async getFundMembers(fundId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('fund_members')
      .select(`
        *,
        accounts:account_id (
          id,
          email,
          full_name,
          profile_picture_url
        )
      `)
      .eq('fund_id', fundId)
      .eq('status', 'active')
      .order('joined_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
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
    console.log('getUserContributionTotal called for fundId:', fundId, 'accountId:', accountId);

    // CORRIGIDO: Usar account_transactions para incluir contribuições E retribuições pagas
    // Calcular total que o usuário já contribuiu para o fundo (dinheiro que saiu da conta para o fundo)

    const { data: transactions, error: txError } = await supabase
      .from('account_transactions')
      .select('transaction_type, amount, reference_type, description, status')
      .eq('account_id', accountId)
      .eq('fund_id', fundId)
      .eq('status', 'completed');

    if (txError) {
      console.error('Error fetching account transactions:', txError);
      throw new Error(txError.message);
    }

    let totalContributed = 0;

    // Processar transações para somar tudo que saiu da conta para o fundo
    for (const tx of transactions || []) {
      const amount = parseFloat(tx.amount || '0');

      if (tx.reference_type === 'contribution') {
        // Contribuições para o fundo (valor negativo, somar)
        totalContributed += Math.abs(amount);
      } else if (tx.reference_type === 'retribution' && amount < 0) {
        // Retribuições pagas (valor negativo, somar - dinheiro saindo da conta para o fundo)
        totalContributed += Math.abs(amount);
      }
      // NÃO somar retiradas de capital (capital_request com valor positivo)
    }

    console.log('User contribution calculation (CORRIGIDO):', {
      fundId,
      accountId,
      totalTransactions: transactions?.length || 0,
      totalContributed,
      source: 'account_transactions'
    });

    return totalContributed;
  }

  async getUserTotalBalanceInFunds(accountId: string): Promise<number> {
    console.log('getUserTotalBalanceInFunds called for accountId:', accountId);

    // CORRIGIDO: Usar account_transactions como fonte única da verdade
    // Calcular o saldo em fundos baseado apenas em transações realmente executadas

    // Buscar todas as transações completas do usuário
    const { data: transactions, error: txError } = await supabase
      .from('account_transactions')
      .select('transaction_type, amount, reference_type, description, status')
      .eq('account_id', accountId)
      .eq('status', 'completed');

    if (txError) {
      console.error('Error fetching account transactions:', txError);
      throw new Error(txError.message);
    }

    let balanceInFunds = 0;

    // Processar cada transação para calcular o saldo atual em fundos
    for (const tx of transactions || []) {
      const amount = parseFloat(tx.amount || '0');

      if (tx.reference_type === 'contribution') {
        // Contribuições para fundos (valor negativo, somar ao saldo em fundos)
        balanceInFunds += Math.abs(amount);
      } else if (tx.reference_type === 'capital_request' && amount > 0) {
        // Retiradas de capital (valor positivo, subtrair do saldo em fundos)  
        balanceInFunds -= amount;
      }
      // Retribuições não alteram o saldo em fundos, são apenas passagem de dinheiro
    }

    console.log('Balance calculation for user', accountId, '(CORRIGIDO usando account_transactions):', {
      totalTransactions: transactions?.length || 0,
      balanceInFunds: balanceInFunds,
      source: 'account_transactions'
    });

    return Math.max(0, balanceInFunds);
  }

  async getUserPendingRetributionsCount(accountId: string): Promise<number> {
    console.log('getUserPendingRetributionsCount called for accountId:', accountId);

    const { data: retributions, error } = await supabase
      .from('retributions')
      .select('id')
      .eq('account_id', accountId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending retributions count:', error);
      throw new Error(error.message);
    }

    const count = retributions?.length || 0;
    console.log('Pending retributions count:', count);
    return count;
  }

  async getUserTransactions(accountId: string, limit: number = 50, offset: number = 0) {
    console.log('getUserTransactions called for accountId:', accountId, 'limit:', limit, 'offset:', offset);

    const { data: transactions, error } = await supabase
      .from('account_transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user transactions:', error);
      throw new Error(error.message);
    }

    console.log('User transactions fetched:', {
      accountId,
      count: transactions?.length || 0,
      limit,
      offset
    });

    return transactions || [];
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

    // CORRIGIDO: Usar account_transactions como fonte única da verdade
    // Calcular saldo do fundo baseado em todas as transações que afetam o patrimônio do fundo

    const { data: transactions, error: txError } = await supabase
      .from('account_transactions')
      .select('transaction_type, amount, reference_type, status, account_id')
      .eq('fund_id', fundId)
      .eq('status', 'completed');

    if (txError) {
      console.error('Error fetching fund transactions:', txError);
      throw new Error(txError.message);
    }

    let fundBalance = 0;

    // Processar todas as transações que afetam o patrimônio do fundo
    for (const tx of transactions || []) {
      const amount = parseFloat(tx.amount || '0');

      if (tx.reference_type === 'contribution') {
        // Contribuições: dinheiro ENTRANDO no fundo (negativo na conta, positivo no fundo)
        fundBalance += Math.abs(amount);
      } else if (tx.reference_type === 'capital_request' && amount > 0) {
        // Retiradas de capital: dinheiro SAINDO do fundo (positivo na conta, negativo no fundo)
        fundBalance -= amount;
      } else if (tx.reference_type === 'retribution' && amount < 0) {
        // Retribuições pagas: dinheiro ENTRANDO no fundo (negativo na conta, positivo no fundo)
        fundBalance += Math.abs(amount);
      }
      // Outras transações (transfers, etc.) não afetam o patrimônio do fundo
    }

    console.log('Fund balance calculation (CORRIGIDO usando account_transactions):', {
      fundId,
      totalTransactions: transactions?.length || 0,
      currentBalance: fundBalance,
      source: 'account_transactions'
    });

    return {
      fundId,
      currentBalance: Math.max(0, fundBalance) // Não permitir saldo negativo
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

    // 5. Atualizar a solicitação como aprovada e desembolsada
    const now = new Date().toISOString();
    const { data: approvedRequest, error: updateError } = await supabase
      .from('capital_requests')
      .update({
        status: 'completed', // Status final após desembolso
        approved_at: now,
        approved_by: approverId,
        disbursed_at: now
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

  // Fund configuration operations
  async getFundAccessSettings(fundId: string): Promise<FundAccessSettings | undefined> {
    try {
      const { data, error } = await supabase
        .from('fund_access_settings')
        .select('*')
        .eq('fund_id', fundId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        // Fallback to in-memory storage
        return fundAccessSettingsMemory.get(fundId);
      }

      return {
        id: data.id,
        fundId: data.fund_id,
        isOpenForNewMembers: data.is_open_for_new_members,
        requiresApprovalForNewMembers: data.requires_approval_for_new_members,
        allowsInviteLink: data.allows_invite_link,
        maxMembers: data.max_members,
        isActive: data.is_active,
        changedBy: data.changed_by,
        changeReason: data.change_reason,
        createdAt: data.created_at
      } as FundAccessSettings;
    } catch (error) {
      // If Supabase is unavailable, use in-memory storage
      return fundAccessSettingsMemory.get(fundId);
    }
  }

  async updateFundAccessSettings(insertSettings: InsertFundAccessSettings): Promise<FundAccessSettings> {
    try {
      // Try Supabase first - Primeiro, desativar as configurações atuais
      await supabase
        .from('fund_access_settings')
        .update({ is_active: false })
        .eq('fund_id', insertSettings.fundId)
        .eq('is_active', true);

      // Preparar dados para inserção
      const insertData: any = {
        fund_id: insertSettings.fundId,
        is_open_for_new_members: insertSettings.isOpenForNewMembers,
        requires_approval_for_new_members: insertSettings.requiresApprovalForNewMembers,
        max_members: insertSettings.maxMembers,
        changed_by: insertSettings.changedBy,
        change_reason: insertSettings.changeReason,
        is_active: true
      };

      // Adicionar allows_invite_link se fornecido
      if (insertSettings.allowsInviteLink !== undefined) {
        insertData.allows_invite_link = insertSettings.allowsInviteLink;
      }

      // Inserir as novas configurações
      let { data, error } = await supabase
        .from('fund_access_settings')
        .insert(insertData)
        .select()
        .single();

      // Se falhar por causa do allows_invite_link, tentar sem ele
      if (error && error.message.includes('allows_invite_link')) {
        console.log('Coluna allows_invite_link não existe, tentando sem ela...');

        const { allows_invite_link, ...dataWithoutAllowsInviteLink } = insertData;
        const result = await supabase
          .from('fund_access_settings')
          .insert(dataWithoutAllowsInviteLink)
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.log('Supabase insertion failed, using fallback:', error.message);
        throw new Error(`Supabase insertion failed: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          fundId: data.fund_id,
          isOpenForNewMembers: data.is_open_for_new_members,
          requiresApprovalForNewMembers: data.requires_approval_for_new_members,
          allowsInviteLink: data.allows_invite_link,
          maxMembers: data.max_members,
          isActive: data.is_active,
          changedBy: data.changed_by,
          changeReason: data.change_reason,
          createdAt: data.created_at
        } as FundAccessSettings;
      }
    } catch (error) {
      console.log('Supabase unavailable, using in-memory fallback:', (error as Error).message);
    }

    // Fallback to in-memory storage
    const newSettings: FundAccessSettings = {
      id: crypto.randomUUID(),
      fundId: insertSettings.fundId,
      isOpenForNewMembers: insertSettings.isOpenForNewMembers ?? true,
      requiresApprovalForNewMembers: insertSettings.requiresApprovalForNewMembers ?? false,
      allowsInviteLink: insertSettings.allowsInviteLink ?? true,
      maxMembers: insertSettings.maxMembers ?? null,
      isActive: true,
      changedBy: insertSettings.changedBy ?? null,
      changeReason: insertSettings.changeReason ?? 'Updated via API',
      createdAt: new Date()
    };

    fundAccessSettingsMemory.set(insertSettings.fundId, newSettings);
    return newSettings;
  }

  // Fund governance operations
  async getFundQuorumSettings(fundId: string): Promise<FundQuorumSettings | undefined> {
    try {
      const { data, error } = await supabase
        .from('fund_quorum_settings')
        .select('*')
        .eq('fund_id', fundId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return undefined;

      return {
        id: data.id,
        fundId: data.fund_id,
        governanceType: data.governance_type,
        quorumPercentage: data.quorum_percentage,
        votingRestriction: data.voting_restriction,
        isActive: data.is_active,
        changedBy: data.changed_by,
        changeReason: data.change_reason,
        createdAt: data.created_at
      } as FundQuorumSettings;
    } catch (error) {
      console.error('Error fetching fund quorum settings:', error);
      return undefined;
    }
  }

  async updateFundQuorumSettings(insertSettings: InsertFundQuorumSettings): Promise<FundQuorumSettings> {
    try {
      // VALIDAÇÃO DE SEGURANÇA FINAL: Se for unânime, garantir 100%
      const secureQuorumPercentage = insertSettings.governanceType === 'unanimous' 
        ? '100.00' 
        : insertSettings.quorumPercentage;

      // Primeiro, desativar as configurações atuais
      await supabase
        .from('fund_quorum_settings')
        .update({ is_active: false })
        .eq('fund_id', insertSettings.fundId)
        .eq('is_active', true);

      // Preparar dados para inserção com validação de segurança
      const insertData = {
        fund_id: insertSettings.fundId,
        governance_type: insertSettings.governanceType,
        quorum_percentage: secureQuorumPercentage,
        voting_restriction: insertSettings.votingRestriction,
        changed_by: insertSettings.changedBy,
        change_reason: insertSettings.changeReason,
        is_active: true
      };

      // Inserir as novas configurações
      const { data, error } = await supabase
        .from('fund_quorum_settings')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insertion failed:', error.message);
        throw new Error(`Supabase insertion failed: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          fundId: data.fund_id,
          governanceType: data.governance_type,
          quorumPercentage: data.quorum_percentage,
          votingRestriction: data.voting_restriction,
          isActive: data.is_active,
          changedBy: data.changed_by,
          changeReason: data.change_reason,
          createdAt: data.created_at
        } as FundQuorumSettings;
      }

      throw new Error('No data returned from insertion');
    } catch (error) {
      console.error('Error updating fund quorum settings:', error);
      throw error;
    }
  }

  // Fund contribution rate operations
  async getFundContributionRates(fundId: string): Promise<FundContributionRates | undefined> {
    try {
      const { data, error } = await supabase
        .from('fund_contribution_rates')
        .select('*')
        .eq('fund_id', fundId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return undefined;

      return {
        id: data.id,
        fundId: data.fund_id,
        contributionRate: data.contribution_rate,
        isActive: data.is_active,
        changedBy: data.changed_by,
        changeReason: data.change_reason,
        createdAt: data.created_at
      } as FundContributionRates;
    } catch (error) {
      console.error('Error fetching fund contribution rates:', error);
      return undefined;
    }
  }

  async updateFundContributionRates(insertSettings: InsertFundContributionRates): Promise<FundContributionRates> {
    try {
      // Primeiro, desativar as configurações atuais
      await supabase
        .from('fund_contribution_rates')
        .update({ is_active: false })
        .eq('fund_id', insertSettings.fundId)
        .eq('is_active', true);

      // Preparar dados para inserção
      const insertData = {
        fund_id: insertSettings.fundId,
        contribution_rate: insertSettings.contributionRate,
        changed_by: insertSettings.changedBy,
        change_reason: insertSettings.changeReason,
        is_active: true
      };

      // Inserir as novas configurações
      const { data, error } = await supabase
        .from('fund_contribution_rates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insertion failed:', error.message);
        throw new Error(`Supabase insertion failed: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          fundId: data.fund_id,
          contributionRate: data.contribution_rate,
          isActive: data.is_active,
          changedBy: data.changed_by,
          changeReason: data.change_reason,
          createdAt: data.created_at
        } as FundContributionRates;
      }

      throw new Error('No data returned from insertion');
    } catch (error) {
      console.error('Error updating fund contribution rates:', error);
      throw error;
    }
  }

  // Fund retribution rate operations
  async getFundRetributionRates(fundId: string): Promise<FundRetributionRates | undefined> {
    try {
      const { data, error } = await supabase
        .from('fund_retribution_rates')
        .select('*')
        .eq('fund_id', fundId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return undefined;

      return {
        id: data.id,
        fundId: data.fund_id,
        retributionRate: data.retribution_rate,
        isActive: data.is_active,
        changedBy: data.changed_by,
        changeReason: data.change_reason,
        createdAt: data.created_at
      } as FundRetributionRates;
    } catch (error) {
      console.error('Error fetching fund retribution rates:', error);
      return undefined;
    }
  }

  async updateFundRetributionRates(insertSettings: InsertFundRetributionRates): Promise<FundRetributionRates> {
    try {
      // Primeiro, desativar as configurações atuais
      await supabase
        .from('fund_retribution_rates')
        .update({ is_active: false })
        .eq('fund_id', insertSettings.fundId)
        .eq('is_active', true);

      // Preparar dados para inserção
      const insertData = {
        fund_id: insertSettings.fundId,
        retribution_rate: insertSettings.retributionRate,
        changed_by: insertSettings.changedBy,
        change_reason: insertSettings.changeReason,
        is_active: true
      };

      // Inserir as novas configurações
      const { data, error } = await supabase
        .from('fund_retribution_rates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insertion failed:', error.message);
        throw new Error(`Supabase insertion failed: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          fundId: data.fund_id,
          retributionRate: data.retribution_rate,
          isActive: data.is_active,
          changedBy: data.changed_by,
          changeReason: data.change_reason,
          createdAt: data.created_at
        } as FundRetributionRates;
      }

      throw new Error('No data returned from insertion');
    } catch (error) {
      console.error('Error updating fund retribution rates:', error);
      throw error;
    }
  }

  // Fund distribution settings operations
  async getFundDistributionSettings(fundId: string): Promise<FundDistributionSettings | undefined> {
    try {
      const { data, error } = await supabase
        .from('fund_distribution_settings')
        .select('*')
        .eq('fund_id', fundId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return undefined;

      return {
        id: data.id,
        fundId: data.fund_id,
        distributionType: data.distribution_type,
        isActive: data.is_active,
        changedBy: data.changed_by,
        changeReason: data.change_reason,
        createdAt: data.created_at
      } as FundDistributionSettings;
    } catch (error) {
      console.error('Error fetching fund distribution settings:', error);
      return undefined;
    }
  }

  async updateFundDistributionSettings(insertSettings: InsertFundDistributionSettings): Promise<FundDistributionSettings> {
    try {
      // Primeiro, desativar as configurações atuais
      await supabase
        .from('fund_distribution_settings')
        .update({ is_active: false })
        .eq('fund_id', insertSettings.fundId)
        .eq('is_active', true);

      // Preparar dados para inserção
      const insertData = {
        fund_id: insertSettings.fundId,
        distribution_type: insertSettings.distributionType,
        changed_by: insertSettings.changedBy,
        change_reason: insertSettings.changeReason,
        is_active: true
      };

      // Inserir as novas configurações
      const { data, error } = await supabase
        .from('fund_distribution_settings')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insertion failed:', error.message);
        throw new Error(`Supabase insertion failed: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          fundId: data.fund_id,
          distributionType: data.distribution_type,
          isActive: data.is_active,
          changedBy: data.changed_by,
          changeReason: data.change_reason,
          createdAt: data.created_at
        } as FundDistributionSettings;
      }

      throw new Error('No data returned from insertion');
    } catch (error) {
      console.error('Error updating fund distribution settings:', error);
      throw error;
    }
  }

  // ============================================================================
  // FUND OBJECTIVE OPERATIONS
  // ============================================================================

  async getFundObjectiveOptions(): Promise<FundObjectiveOption[]> {
    try {
      const { data, error } = await supabase
        .from('fund_objective_options')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching fund objective options:', error);
        // Return hardcoded options if table doesn't exist yet
        return [
          { id: 'temp-1', title: 'Compras', description: 'Compras em geral', icon: 'ShoppingCart', isActive: true, displayOrder: 1, createdAt: new Date() },
          { id: 'temp-2', title: 'Viagens', description: 'Gastos com viagens', icon: 'Plane', isActive: true, displayOrder: 2, createdAt: new Date() },
          { id: 'temp-3', title: 'Aluguel', description: 'Pagamento de aluguel', icon: 'Home', isActive: true, displayOrder: 3, createdAt: new Date() },
          { id: 'temp-4', title: 'Churrasco', description: 'Eventos sociais', icon: 'Users', isActive: true, displayOrder: 4, createdAt: new Date() },
          { id: 'temp-5', title: 'Emergência', description: 'Situações de emergência', icon: 'AlertCircle', isActive: true, displayOrder: 5, createdAt: new Date() }
        ] as FundObjectiveOption[];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFundObjectiveOptions:', error);
      return [];
    }
  }

  async getCurrentFundObjective(fundId: string): Promise<CurrentFundObjective | null> {
    try {
      // First try to get from new objective history table
      const { data: historyData, error: historyError } = await supabase
        .from('fund_objective_history')
        .select(`
          *,
          fund_objective_options(*),
          changed_by_account:accounts!changed_by(full_name)
        `)
        .eq('fund_id', fundId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!historyError && historyData) {
        const isStandard = !!historyData.objective_option_id;
        return {
          fundId,
          currentObjective: isStandard 
            ? historyData.fund_objective_options?.title || 'Objetivo padrão'
            : historyData.custom_objective || 'Objetivo personalizado',
          currentIcon: isStandard 
            ? historyData.fund_objective_options?.icon
            : historyData.custom_icon,
          objectiveType: isStandard ? 'standard' : 'custom',
          definedAt: historyData.created_at,
          changedByName: historyData.changed_by_account?.full_name
        };
      }

      // Fallback: get from old fund.objective field
      const { data: fundData, error: fundError } = await supabase
        .from('funds')
        .select('objective, created_at')
        .eq('id', fundId)
        .single();

      if (fundError || !fundData) {
        return null;
      }

      return {
        fundId,
        currentObjective: fundData.objective || 'Sem objetivo definido',
        currentIcon: undefined,
        objectiveType: 'custom',
        definedAt: fundData.created_at
      };
    } catch (error) {
      console.error('Error in getCurrentFundObjective:', error);
      return null;
    }
  }

  async setStandardObjective(data: SetStandardObjective): Promise<FundObjectiveHistory> {
    try {
      // Primeiro, desativar objetivo atual
      await supabase
        .from('fund_objective_history')
        .update({ is_active: false })
        .eq('fund_id', data.fundId)
        .eq('is_active', true);

      // Inserir novo objetivo
      const { data: newObjective, error } = await supabase
        .from('fund_objective_history')
        .insert({
          fund_id: data.fundId,
          objective_option_id: data.objectiveOptionId,
          changed_by: data.changedBy,
          change_reason: data.changeReason || 'Objetivo definido'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to set standard objective: ${error.message}`);
      }

      return newObjective;
    } catch (error) {
      console.error('Error in setStandardObjective:', error);
      throw error;
    }
  }

  async setCustomObjective(data: SetCustomObjective): Promise<FundObjectiveHistory> {
    try {
      // Primeiro, desativar objetivo atual
      await supabase
        .from('fund_objective_history')
        .update({ is_active: false })
        .eq('fund_id', data.fundId)
        .eq('is_active', true);

      // Inserir novo objetivo personalizado
      const { data: newObjective, error } = await supabase
        .from('fund_objective_history')
        .insert({
          fund_id: data.fundId,
          custom_objective: data.customObjective,
          custom_icon: data.customIcon || 'Target',
          changed_by: data.changedBy,
          change_reason: data.changeReason || 'Objetivo personalizado definido'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to set custom objective: ${error.message}`);
      }

      return newObjective;
    } catch (error) {
      console.error('Error in setCustomObjective:', error);
      throw error;
    }
  }

  async getFundObjectiveHistory(fundId: string): Promise<FundObjectiveHistory[]> {
    try {
      const { data, error } = await supabase
        .from('fund_objective_history')
        .select(`
          *,
          fund_objective_options(*),
          changed_by_account:accounts!changed_by(full_name)
        `)
        .eq('fund_id', fundId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fund objective history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFundObjectiveHistory:', error);
      return [];
    }
  }
}

// Export Supabase storage instance
export const storage = new SupabaseStorage();