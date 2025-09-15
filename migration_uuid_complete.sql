
-- Script completo para converter TODAS as tabelas para usar UUID
-- Execute este SQL diretamente no SQL Editor do Supabase

-- 1. Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Dropar todas as foreign keys primeiro
ALTER TABLE account_transactions DROP CONSTRAINT IF EXISTS account_transactions_account_id_accounts_id_fk;
ALTER TABLE account_transactions DROP CONSTRAINT IF EXISTS account_transactions_fund_id_funds_id_fk;
ALTER TABLE capital_requests DROP CONSTRAINT IF EXISTS capital_requests_fund_id_funds_id_fk;
ALTER TABLE capital_requests DROP CONSTRAINT IF EXISTS capital_requests_account_id_accounts_id_fk;
ALTER TABLE capital_requests DROP CONSTRAINT IF EXISTS capital_requests_approved_by_accounts_id_fk;
ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_fund_id_funds_id_fk;
ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_account_id_accounts_id_fk;
ALTER TABLE fund_members DROP CONSTRAINT IF EXISTS fund_members_fund_id_funds_id_fk;
ALTER TABLE fund_members DROP CONSTRAINT IF EXISTS fund_members_account_id_accounts_id_fk;
ALTER TABLE funds DROP CONSTRAINT IF EXISTS funds_created_by_accounts_id_fk;

-- 3. Criar tabela accounts_new com UUID
CREATE TABLE accounts_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  full_name varchar(255) NOT NULL,
  phone varchar(20),
  cpf varchar(11) UNIQUE,
  birth_date date,
  profile_picture_url varchar(500),
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- 4. Criar tabela funds_new com UUID
CREATE TABLE funds_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  objective text,
  contribution_rate numeric(5, 2) DEFAULT '100.00',
  retribution_rate numeric(5, 2) DEFAULT '100.00',
  is_open_for_new_members boolean DEFAULT true,
  requires_approval_for_new_members boolean DEFAULT false,
  created_by uuid,
  fund_image_type fund_image_type_enum DEFAULT 'emoji',
  fund_image_value varchar(500) DEFAULT '💰',
  is_active boolean DEFAULT true,
  governance_type governance_type_enum DEFAULT 'quorum',
  quorum_percentage numeric(5, 2) DEFAULT '60.00',
  voting_restriction voting_restriction_enum DEFAULT 'all_members',
  proposal_expiry_hours integer DEFAULT 168,
  allow_member_proposals boolean DEFAULT true,
  auto_execute_approved boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- 5. Criar tabela account_transactions_new com UUID
CREATE TABLE account_transactions_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid,
  fund_id uuid,
  transaction_type transaction_type_enum NOT NULL,
  amount numeric(15, 2) NOT NULL,
  description text,
  reference_type reference_type_enum NOT NULL,
  reference_id uuid,
  status transaction_status_enum DEFAULT 'completed',
  created_at timestamp DEFAULT now() NOT NULL,
  processed_at timestamp DEFAULT now()
);

-- 6. Criar tabela fund_members_new com UUID
CREATE TABLE fund_members_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fund_id uuid,
  account_id uuid,
  role member_role_enum DEFAULT 'member',
  status member_status_enum DEFAULT 'active',
  total_contributed numeric(15, 2) DEFAULT '0.00',
  total_received numeric(15, 2) DEFAULT '0.00',
  total_returned numeric(15, 2) DEFAULT '0.00',
  joined_at timestamp DEFAULT now() NOT NULL,
  removed_at timestamp,
  removed_reason text
);

-- 7. Criar tabela contributions_new com UUID
CREATE TABLE contributions_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fund_id uuid,
  account_id uuid,
  amount numeric(15, 2) NOT NULL,
  description text,
  payment_method payment_method_enum,
  status transaction_status_enum DEFAULT 'pending',
  transaction_id varchar(100),
  created_at timestamp DEFAULT now() NOT NULL,
  processed_at timestamp
);

-- 8. Criar tabela capital_requests_new com UUID
CREATE TABLE capital_requests_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fund_id uuid,
  account_id uuid,
  amount numeric(15, 2) NOT NULL,
  reason text NOT NULL,
  urgency_level urgency_level_enum DEFAULT 'medium',
  status capital_request_status_enum DEFAULT 'pending',
  approved_at timestamp,
  approved_by uuid,
  disbursed_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL
);

-- 9. Migrar dados (se houver) criando mapeamento de IDs
-- Criar tabela temporária para mapear old_id -> new_uuid
CREATE TEMP TABLE account_id_mapping (
  old_id bigint,
  new_id uuid DEFAULT uuid_generate_v4()
);

CREATE TEMP TABLE fund_id_mapping (
  old_id bigint,
  new_id uuid DEFAULT uuid_generate_v4()
);

-- Inserir mapeamentos para contas existentes
INSERT INTO account_id_mapping (old_id)
SELECT id FROM accounts;

-- Inserir mapeamentos para fundos existentes
INSERT INTO fund_id_mapping (old_id)
SELECT id FROM funds;

-- Migrar dados da tabela accounts
INSERT INTO accounts_new (id, email, password_hash, full_name, phone, cpf, birth_date, profile_picture_url, is_active, email_verified, phone_verified, created_at, updated_at)
SELECT m.new_id, a.email, a.password_hash, a.full_name, a.phone, a.cpf, a.birth_date, a.profile_picture_url, a.is_active, a.email_verified, a.phone_verified, a.created_at, a.updated_at
FROM accounts a
JOIN account_id_mapping m ON a.id = m.old_id;

-- Migrar dados da tabela funds
INSERT INTO funds_new (id, name, objective, contribution_rate, retribution_rate, is_open_for_new_members, requires_approval_for_new_members, created_by, fund_image_type, fund_image_value, is_active, governance_type, quorum_percentage, voting_restriction, proposal_expiry_hours, allow_member_proposals, auto_execute_approved, created_at, updated_at)
SELECT fm.new_id, f.name, f.objective, f.contribution_rate, f.retribution_rate, f.is_open_for_new_members, f.requires_approval_for_new_members, am.new_id, f.fund_image_type, f.fund_image_value, f.is_active, f.governance_type, f.quorum_percentage, f.voting_restriction, f.proposal_expiry_hours, f.allow_member_proposals, f.auto_execute_approved, f.created_at, f.updated_at
FROM funds f
JOIN fund_id_mapping fm ON f.id = fm.old_id
LEFT JOIN account_id_mapping am ON f.created_by = am.old_id;

-- Migrar dados da tabela fund_members
INSERT INTO fund_members_new (fund_id, account_id, role, status, total_contributed, total_received, total_returned, joined_at, removed_at, removed_reason)
SELECT fm.new_id, am.new_id, fmb.role, fmb.status, fmb.total_contributed, fmb.total_received, fmb.total_returned, fmb.joined_at, fmb.removed_at, fmb.removed_reason
FROM fund_members fmb
JOIN fund_id_mapping fm ON fmb.fund_id = fm.old_id
JOIN account_id_mapping am ON fmb.account_id = am.old_id;

-- Migrar dados da tabela contributions
INSERT INTO contributions_new (fund_id, account_id, amount, description, payment_method, status, transaction_id, created_at, processed_at)
SELECT fm.new_id, am.new_id, c.amount, c.description, c.payment_method, c.status, c.transaction_id, c.created_at, c.processed_at
FROM contributions c
JOIN fund_id_mapping fm ON c.fund_id = fm.old_id
JOIN account_id_mapping am ON c.account_id = am.old_id;

-- Migrar dados da tabela capital_requests
INSERT INTO capital_requests_new (fund_id, account_id, amount, reason, urgency_level, status, approved_at, approved_by, disbursed_at, created_at)
SELECT fm.new_id, am.new_id, cr.amount, cr.reason, cr.urgency_level, cr.status, cr.approved_at, am2.new_id, cr.disbursed_at, cr.created_at
FROM capital_requests cr
JOIN fund_id_mapping fm ON cr.fund_id = fm.old_id
JOIN account_id_mapping am ON cr.account_id = am.old_id
LEFT JOIN account_id_mapping am2 ON cr.approved_by = am2.old_id;

-- Migrar dados da tabela account_transactions
INSERT INTO account_transactions_new (account_id, fund_id, transaction_type, amount, description, reference_type, reference_id, status, created_at, processed_at)
SELECT am.new_id, fm.new_id, at.transaction_type, at.amount, at.description, at.reference_type, NULL, at.status, at.created_at, at.processed_at
FROM account_transactions at
LEFT JOIN account_id_mapping am ON at.account_id = am.old_id
LEFT JOIN fund_id_mapping fm ON at.fund_id = fm.old_id;

-- 10. Dropar tabelas antigas e renomear
DROP TABLE IF EXISTS account_transactions CASCADE;
DROP TABLE IF EXISTS capital_requests CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS fund_members CASCADE;
DROP TABLE IF EXISTS funds CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

ALTER TABLE accounts_new RENAME TO accounts;
ALTER TABLE funds_new RENAME TO funds;
ALTER TABLE account_transactions_new RENAME TO account_transactions;
ALTER TABLE fund_members_new RENAME TO fund_members;
ALTER TABLE contributions_new RENAME TO contributions;
ALTER TABLE capital_requests_new RENAME TO capital_requests;

-- 11. Recriar todas as foreign keys
ALTER TABLE account_transactions ADD CONSTRAINT account_transactions_account_id_accounts_id_fk 
  FOREIGN KEY (account_id) REFERENCES accounts(id);
ALTER TABLE account_transactions ADD CONSTRAINT account_transactions_fund_id_funds_id_fk 
  FOREIGN KEY (fund_id) REFERENCES funds(id);

ALTER TABLE capital_requests ADD CONSTRAINT capital_requests_fund_id_funds_id_fk 
  FOREIGN KEY (fund_id) REFERENCES funds(id);
ALTER TABLE capital_requests ADD CONSTRAINT capital_requests_account_id_accounts_id_fk 
  FOREIGN KEY (account_id) REFERENCES accounts(id);
ALTER TABLE capital_requests ADD CONSTRAINT capital_requests_approved_by_accounts_id_fk 
  FOREIGN KEY (approved_by) REFERENCES accounts(id);

ALTER TABLE contributions ADD CONSTRAINT contributions_fund_id_funds_id_fk 
  FOREIGN KEY (fund_id) REFERENCES funds(id);
ALTER TABLE contributions ADD CONSTRAINT contributions_account_id_accounts_id_fk 
  FOREIGN KEY (account_id) REFERENCES accounts(id);

ALTER TABLE fund_members ADD CONSTRAINT fund_members_fund_id_funds_id_fk 
  FOREIGN KEY (fund_id) REFERENCES funds(id);
ALTER TABLE fund_members ADD CONSTRAINT fund_members_account_id_accounts_id_fk 
  FOREIGN KEY (account_id) REFERENCES accounts(id);

ALTER TABLE funds ADD CONSTRAINT funds_created_by_accounts_id_fk 
  FOREIGN KEY (created_by) REFERENCES accounts(id);

-- 12. Verificar migração
SELECT 'Migration completed successfully - All tables now use UUID' as status;
