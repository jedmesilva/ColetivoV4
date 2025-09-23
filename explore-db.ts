import { supabase } from "./server/db";

async function exploreDatabase() {
  try {
    console.log('=== EXPLORANDO ESTRUTURA DO BANCO SUPABASE ===');
    
    // 1. Listar todas as tabelas
    console.log('\n1. TABELAS EXISTENTES:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('Erro ao buscar tabelas:', tablesError);
    } else {
      tables?.forEach(t => console.log(`- ${t.table_name} (${t.table_type})`));
    }

    // 2. Verificar se as novas tabelas de configuração existem
    console.log('\n2. VERIFICANDO TABELAS DE CONFIGURAÇÃO:');
    const configTables = [
      'fund_access_settings',
      'fund_contribution_rates', 
      'fund_retribution_rates',
      'fund_quorum_settings',
      'fund_proposal_settings'
    ];
    
    for (const tableName of configTables) {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      console.log(`- ${tableName}: ${data?.length ? 'EXISTE' : 'NÃO EXISTE'}`);
    }

    // 3. Verificar estrutura da tabela funds
    console.log('\n3. ESTRUTURA DA TABELA FUNDS:');
    const { data: fundColumns, error: fundError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'funds')
      .order('ordinal_position');
    
    if (fundError) {
      console.error('Erro:', fundError);
    } else {
      fundColumns?.forEach(c => 
        console.log(`- ${c.column_name}: ${c.data_type} ${c.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
      );
    }

    // 4. Testar acesso à tabela fund_access_settings
    console.log('\n4. TESTANDO ACESSO A fund_access_settings:');
    try {
      const { data, error } = await supabase
        .from('fund_access_settings')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`Erro: ${error.message}`);
      } else {
        console.log('Sucesso! Tabela acessível, registros:', data?.length || 0);
      }
    } catch (err) {
      console.log('Erro de conexão:', (err as Error).message);
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

exploreDatabase();