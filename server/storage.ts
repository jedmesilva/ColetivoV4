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

  // Fund operations
  async getFunds(): Promise<Fund[]> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Fund[];
  }

  async getFund(id: number): Promise<Fund | undefined> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Fund;
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