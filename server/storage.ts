// ⚠️  SECURITY WARNING: THIS STORAGE LAYER EXCLUSIVELY USES SUPABASE ⚠️
// Any attempt to use a different database is a SECURITY VIOLATION
// ONLY Supabase operations are allowed - NO OTHER databases permitted

import { supabase } from "./db"; // ONLY SUPABASE CLIENT IMPORTED
import {
  type Account, type Fund, type Contribution, type FundMember, type AccountTransaction,
  type InsertAccount, type InsertFund, type InsertContribution, type InsertFundMember,
  // Manter compatibilidade
  type User, type InsertUser
} from "@shared/schema";

// Tipo para saldo das contas
export interface AccountBalance {
  accountId: number;
  totalBalance: number;
  freeBalance: number;
  balanceInFunds: number;
  account: Account;
}

export interface IStorage {
  // Account operations via SUPABASE ONLY (mantendo compatibilidade com User)
  getUser(id: string): Promise<Account | undefined>;
  getUserByUsername(username: string): Promise<Account | undefined>;
  createUser(insertUser: InsertAccount): Promise<Account>;
  getAccountBalance(accountId: number): Promise<AccountBalance | undefined>;

  // Fund operations via SUPABASE ONLY
  getFunds(): Promise<Fund[]>;
  getFund(id: number): Promise<Fund | undefined>;
  createFund(insertFund: InsertFund, userId: string): Promise<Fund>;
  updateFund(id: number, updates: Partial<Fund>): Promise<Fund | undefined>;

  // Fund member operations via SUPABASE ONLY
  getFundMembers(fundId: number): Promise<FundMember[]>;
  addFundMember(insertMember: InsertFundMember): Promise<FundMember>;

  // Contribution operations via SUPABASE ONLY
  getContributions(fundId: number): Promise<Contribution[]>;
  createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution>;
  deleteContribution(id: string): Promise<boolean>;
}

// SUPABASE-ONLY storage implementation - NO OTHER databases allowed
class SupabaseStorage implements IStorage {
  // Account operations (usando tabela accounts)
  async getUser(id: string): Promise<Account | undefined> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data as Account;
  }

  async getUserByUsername(username: string): Promise<Account | undefined> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', username) // usando email como username
      .single();

    if (error) return undefined;
    return data as Account;
  }

  async createUser(insertUser: InsertAccount): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert(insertUser)
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  }

  async getAccountBalance(accountId: number): Promise<AccountBalance | undefined> {
    // Buscar dados da conta
    const account = await this.getUser(accountId.toString());
    if (!account) return undefined;

    // Buscar transações da conta para calcular saldo total
    const { data: transactions, error: transactionError } = await supabase
      .from('account_transactions')
      .select('transaction_type, amount')
      .eq('account_id', accountId)
      .eq('status', 'completed');

    if (transactionError) throw transactionError;

    // Calcular saldo total baseado nas transações
    let totalBalance = 0;
    if (transactions) {
      for (const transaction of transactions) {
        const amount = parseFloat(transaction.amount || '0');

        // Transações que aumentam o saldo
        if (['deposit', 'fund_withdrawal', 'transfer_in', 'refund'].includes(transaction.transaction_type)) {
          totalBalance += amount;
        }
        // Transações que diminuem o saldo
        else if (['withdrawal', 'fund_contribution', 'transfer_out', 'fee'].includes(transaction.transaction_type)) {
          totalBalance -= amount;
        }
      }
    }

    // Buscar total em fundos (contribuições ativas)
    const { data: fundMemberships, error: memberError } = await supabase
      .from('fund_members')
      .select('total_contributed')
      .eq('account_id', accountId)
      .eq('status', 'active');

    if (memberError) throw memberError;

    let balanceInFunds = 0;
    if (fundMemberships) {
      balanceInFunds = fundMemberships.reduce((sum, membership) => {
        return sum + parseFloat(membership.total_contributed || '0');
      }, 0);
    }

    const freeBalance = totalBalance - balanceInFunds;

    return {
      accountId,
      totalBalance,
      freeBalance: Math.max(0, freeBalance), // Não permitir saldo livre negativo
      balanceInFunds,
      account
    };
  }

  // Fund balance operations
  async getFundBalance(fundId: number): Promise<{ fundId: number; currentBalance: number }> {
    console.log('getFundBalance called for fundId:', fundId);

    // Primeiro tenta buscar da view fund_balances se existir
    console.log('Trying to fetch from fund_balances view...');
    const { data: viewData, error: viewError } = await supabase
      .from('fund_balances')
      .select('id, fund_balance') // Selecionar colunas relevantes da view
      .eq('id', fundId) // Usar 'id' da view que corresponde ao fundId
      .maybeSingle();

    if (viewError) {
      console.log('Error accessing fund_balances view:', viewError);
    } else if (viewData) {
      console.log('Found data in fund_balances view:', viewData);
      return {
        fundId: viewData.id, // A view usa 'id' para identificar o fundo
        currentBalance: parseFloat(viewData.fund_balance || '0') // Usar 'fund_balance' da view
      };
    } else {
      console.log('No data found in fund_balances view for fundId:', fundId);
    }

    // Segundo, tenta buscar current_balance diretamente da tabela funds
    try {
      const { data: fundData, error: fundError } = await supabase
        .from('funds')
        .select('id, current_balance')
        .eq('id', fundId)
        .single();

      if (!fundError && fundData && fundData.current_balance !== undefined) {
        console.log('Found current_balance in funds table:', fundData);
        return {
          fundId: fundData.id,
          currentBalance: parseFloat(fundData.current_balance || '0')
        };
      }
    } catch (error) {
      console.log('current_balance column not found in funds table');
    }

    // Fallback: calcular a partir das contribuições e retiradas
    console.log('Using contributions/capital_requests fallback calculation');

    // Buscar contribuições (entradas)
    const { data: contributions, error: contributionError } = await supabase
      .from('contributions')
      .select('amount')
      .eq('fund_id', fundId)
      .eq('status', 'completed');

    if (contributionError) {
      console.error('Error fetching contributions:', contributionError);
      throw contributionError;
    }

    // Buscar retiradas/pagamentos (saídas) - usar apenas 'completed'
    const { data: withdrawals, error: withdrawalError } = await supabase
      .from('capital_requests')
      .select('amount')
      .eq('fund_id', fundId)
      .eq('status', 'completed');

    if (withdrawalError) {
      console.error('Error fetching capital requests:', withdrawalError);
      throw withdrawalError;
    }

    // Calcular saldo: entradas - saídas
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

  async getFundBalances(fundIds: number[]): Promise<{ balances: Array<{ fundId: number; currentBalance: number }> }> {
    console.log('getFundBalances called with fundIds:', fundIds);

    if (fundIds.length === 0) {
      return { balances: [] };
    }

    // Converter fundIds para strings para buscar na view
    const fundIdStrings = fundIds.map(id => id.toString());

    // Buscar da view fund_balances usando a estrutura correta
    console.log('Trying to fetch from fund_balances view...');
    const { data: viewData, error: viewError } = await supabase
      .from('fund_balances')
      .select('id, fund_balance') // Selecionar 'id' e 'fund_balance' da view
      .in('id', fundIdStrings); // Filtrar pela coluna 'id' que corresponde ao fundId

    if (viewError) {
      console.log('Error accessing fund_balances view:', viewError);
      console.log('Using JavaScript fallback for fund balances calculation');

      // Fallback para cálculo manual
      const balances = [];
      for (const fundId of fundIds) {
        console.log('Processing fundId:', fundId);
        const balance = await this.getFundBalance(fundId);
        console.log('Received balance for fund', fundId, ':', balance);
        balances.push(balance);
      }

      console.log('Final balances result:', balances);
      return { balances };
    }

    if (viewData && viewData.length > 0) {
      console.log('Found data in fund_balances view:', viewData);
      const balances = viewData.map(item => ({
        fundId: parseInt(item.id), // 'id' da view é o fundId
        currentBalance: parseFloat(item.fund_balance) // 'fund_balance' da view é o saldo atual
      }));
      return { balances };
    }

    console.log('No data found in fund_balances view, using fallback');
    console.log('Using JavaScript fallback for fund balances calculation');
    // Se a view não retornar nada, usamos o fallback
    const balances = [];
    for (const fundId of fundIds) {
      console.log('Processing fundId:', fundId);
      const balance = await this.getFundBalance(fundId);
      console.log('Received balance for fund', fundId, ':', balance);
      balances.push(balance);
    }

    console.log('Final balances result:', balances);
    return { balances };
  }

  // Fund operations
  async getFunds(): Promise<Fund[]> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mapear nomes dos campos do snake_case para camelCase
    return data.map(fund => ({
      ...fund,
      createdAt: fund.created_at,
      updatedAt: fund.updated_at,
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
      autoExecuteApproved: fund.auto_execute_approved
    })) as Fund[];
  }

  async getFund(id: number): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;

    // Mapear nomes dos campos do snake_case para camelCase
    const mapped = {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
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
      autoExecuteApproved: data.auto_execute_approved
    };

    return mapped as Fund;
  }

  async createFund(insertFund: InsertFund, userId: string): Promise<Fund> {
    const fundData = {
      name: insertFund.name,
      objective: insertFund.objective,
      fund_image_type: "emoji",
      fund_image_value: insertFund.fundImageValue || "💰",
      contribution_rate: insertFund.contributionRate || 100,
      retribution_rate: insertFund.retributionRate || 100,
      is_open_for_new_members: insertFund.isOpenForNewMembers ?? true,
      requires_approval_for_new_members: insertFund.requiresApprovalForNewMembers ?? false,
      created_by: null, // Deixar null temporariamente
      is_active: true,
      governance_type: "quorum",
      quorum_percentage: 60,
      voting_restriction: "all_members",
      proposal_expiry_hours: 168,
      allow_member_proposals: true,
      auto_execute_approved: true,
    };

    const { data, error } = await supabase
      .from('funds')
      .insert(fundData)
      .select()
      .single();

    if (error) throw error;
    return data as Fund;
  }

  async updateFund(id: number, updates: Partial<Fund>): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data as Fund;
  }

  // Fund member operations
  async getFundMembers(fundId: number): Promise<FundMember[]> {
    const { data, error } = await supabase
      .from('fund_members')
      .select('*')
      .eq('fund_id', fundId)
      .eq('status', 'active');

    if (error) throw error;
    return data as FundMember[];
  }

  async addFundMember(insertMember: InsertFundMember): Promise<FundMember> {
    const { data, error } = await supabase
      .from('fund_members')
      .insert({
        fund_id: insertMember.fundId,
        account_id: insertMember.accountId,
        role: insertMember.role || 'member',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data as FundMember;
  }

  // Contribution operations
  async getContributions(fundId: number): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('fund_id', fundId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Contribution[];
  }

  async createContribution(insertContribution: InsertContribution, userId: string): Promise<Contribution> {
    const { data, error } = await supabase
      .from('contributions')
      .insert({
        fund_id: insertContribution.fundId,
        account_id: parseInt(userId),
        amount: insertContribution.amount,
        description: insertContribution.description,
        payment_method: insertContribution.paymentMethod || 'account_balance',
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
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

// Export SUPABASE-ONLY storage instance - SECURITY ENFORCED
export const storage = new SupabaseStorage();