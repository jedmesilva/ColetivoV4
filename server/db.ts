import { createClient } from "@supabase/supabase-js";

// Supabase configuration - using your existing Supabase database
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
}

// Create Supabase client for backend operations (service role)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false }
  }
);

// Function to verify and debug account transactions
export async function debugAccountTransactions() {
  try {
    console.log('=== DIAGNÓSTICO DE TRANSAÇÕES ===');

    // 1. Verificar solicitações de capital existentes
    const { data: capitalRequests, error: crError } = await supabase
      .from('capital_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (crError) {
      console.error('Erro ao buscar capital requests:', crError);
      return;
    }

    console.log(`Encontradas ${capitalRequests?.length || 0} solicitações de capital`);
    
    if (capitalRequests && capitalRequests.length > 0) {
      console.log('Primeiras 3 solicitações:', capitalRequests.slice(0, 3));
      
      // Verificar se existem aprovadas
      const approved = capitalRequests.filter(req => req.status === 'approved');
      console.log(`${approved.length} solicitações aprovadas encontradas`);
    }

    // 2. Verificar transações existentes
    const { data: transactions, error: txError } = await supabase
      .from('account_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('Erro ao buscar transações:', txError);
      return;
    }

    console.log(`Encontradas ${transactions?.length || 0} transações`);
    
    if (transactions && transactions.length > 0) {
      console.log('Primeiras 3 transações:', transactions.slice(0, 3));
      
      // Verificar transações de capital requests
      const capitalTx = transactions.filter(tx => tx.reference_type === 'capital_request');
      console.log(`${capitalTx.length} transações de capital request encontradas`);
    }

    // 3. Verificar schema da tabela account_transactions
    const { data: schema, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'account_transactions')
      .order('ordinal_position');

    if (!schemaError && schema) {
      console.log('Schema da tabela account_transactions:', schema);
    }

  } catch (error) {
    console.error('Erro no diagnóstico:', error);
  }
}

// Function to create a test capital request and approve it
export async function testCapitalRequestFlow() {
  try {
    console.log('=== TESTE DE FLUXO DE CAPITAL REQUEST ===');
    
    // Buscar um usuário e fundo existentes
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .limit(1);
      
    const { data: funds } = await supabase
      .from('funds')
      .select('id')
      .limit(1);

    if (!accounts?.length || !funds?.length) {
      console.log('Não há usuários ou fundos suficientes para teste');
      return;
    }

    const accountId = accounts[0].id;
    const fundId = funds[0].id;

    console.log(`Testando com account ${accountId} e fund ${fundId}`);

    // Verificar se já existe uma solicitação pendente
    const { data: existing } = await supabase
      .from('capital_requests')
      .select('*')
      .eq('account_id', accountId)
      .eq('status', 'pending')
      .limit(1);

    if (existing?.length) {
      console.log('Encontrada solicitação pendente:', existing[0]);
      return;
    }

    return { accountId, fundId };
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

export async function setupDatabaseFunctions() {
  console.log('Inicializando diagnóstico de transações...');
  
  // Executar diagnóstico
  await debugAccountTransactions();
  
  // Executar teste básico
  await testCapitalRequestFlow();
}