import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { supabase } from "./db";
import { insertFundSchema, insertContributionSchema, insertAccountSchema, insertCapitalRequestWithPlanSchema, insertFundAccessSettingsSchema, insertFundQuorumSettingsSchema, insertFundContributionRatesSchema, insertFundRetributionRatesSchema, updateFundObjectiveSchema } from "@shared/schema";
import { Client } from "pg";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check username availability
  app.get("/api/users/check-username/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const existingUser = await storage.getUserByUsername(username);
      res.json({ available: !existingUser });
    } catch (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ message: "Failed to check username availability" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);

      // Check if email already exists (usando email como username)
      const existingUser = await storage.getUserByUsername(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Não fazer hash da senha aqui - o Supabase Auth fará isso
      const user = await storage.createUser(validatedData);

      // Remove password from response for security
      const { passwordHash, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid user data", details: error });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get all funds
  app.get("/api/funds", async (req, res) => {
    try {
      const accountId = req.query.accountId as string;
      
      if (!accountId) {
        return res.status(400).json({ message: "accountId é obrigatório" });
      }

      // Buscar apenas os fundos onde o usuário é membro ativo
      const funds = await storage.getFundsForUser(accountId);
      res.json(funds);
    } catch (error) {
      console.error("Error fetching funds:", error);
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });

  // Fund summary routes (includes member count and balance)
  app.get("/api/funds/summaries", async (req, res) => {
    try {
      const fundIds = req.query.fundIds as string;
      if (!fundIds) {
        return res.status(400).json({ error: 'fundIds parameter is required' });
      }

      const fundIdArray = fundIds.split(',').filter(id => id.trim());
      const result = await storage.getFundSummaries(fundIdArray);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching fund summaries:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fund balance routes
  app.get("/api/funds/balances", async (req, res) => {
    try {
      const fundIds = req.query.fundIds as string;
      if (!fundIds) {
        return res.status(400).json({ error: 'fundIds parameter is required' });
      }

      const fundIdArray = fundIds.split(',').filter(id => id.trim());
      const result = await storage.getFundBalances(fundIdArray);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching fund balances:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get single fund
  app.get("/api/funds/:id", async (req, res) => {
    try {
      const fund = await storage.getFund(req.params.id);
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      res.json(fund);
    } catch (error) {
      console.error("Error fetching fund:", error);
      res.status(500).json({ message: "Failed to fetch fund" });
    }
  });

  // Get user by ID
  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const accountId = req.params.id;
      const user = await storage.getUser(accountId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response for security
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get account balance
  app.get("/api/accounts/:id/balance", async (req, res) => {
    try {
      const accountId = req.params.id;
      const accountBalance = await storage.getAccountBalance(accountId);

      if (!accountBalance) {
        return res.status(404).json({ message: "Account not found" });
      }

      res.json(accountBalance);
    } catch (error) {
      console.error("Error fetching account balance:", error);
      res.status(500).json({ message: "Failed to fetch account balance" });
    }
  });

  // Get fund balance
  app.get("/api/funds/:id/balance", async (req, res) => {
    try {
      const fundId = req.params.id;
      if (!fundId || fundId.trim() === '') {
        return res.status(400).json({ message: "Invalid fund ID" });
      }

      const fundBalance = await storage.getFundBalance(fundId);
      res.json(fundBalance);
    } catch (error) {
      console.error("Error fetching fund balance:", error);
      res.status(500).json({ message: "Failed to fetch fund balance" });
    }
  });

  // Create new fund
  app.post("/api/funds", async (req, res) => {
    try {
      const validatedData = insertFundSchema.parse(req.body);
      console.log('Validated fund data:', validatedData);

      // Use the logged in user ID - for now using Lucas's ID
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      const fund = await storage.createFund(validatedData, userId);
      res.status(201).json(fund);
    } catch (error) {
      console.error("Error creating fund:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid fund data", details: error });
      }
      res.status(500).json({ message: "Failed to create fund", error: (error as Error).message });
    }
  });

  // Get members for a fund
  app.get("/api/funds/:id/members", async (req, res) => {
    try {
      const members = await storage.getFundMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching fund members:", error);
      res.status(500).json({ message: "Failed to fetch fund members" });
    }
  });

  // Get contributions for a fund
  app.get("/api/funds/:id/contributions", async (req, res) => {
    try {
      const contributions = await storage.getContributions(req.params.id);
      res.json(contributions);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  // Get user's total contributions for a specific fund
  app.get("/api/funds/:fundId/contributions/user/:userId", async (req, res) => {
    try {
      const { fundId, userId } = req.params;
      const total = await storage.getUserContributionTotal(fundId, userId);
      res.json({ total });
    } catch (error: any) {
      console.error("Error fetching user contribution total:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's total balance in all funds
  app.get("/api/accounts/:accountId/balance-in-funds", async (req, res) => {
    try {
      const { accountId } = req.params;

      // TODO: Implementar autenticação adequada
      // Por enquanto, limitando ao usuário fixo para desenvolvimento
      const allowedUserId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";
      if (accountId !== allowedUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const totalBalanceInFunds = await storage.getUserTotalBalanceInFunds(accountId);
      res.json({ totalBalanceInFunds });
    } catch (error) {
      console.error("Error fetching user total balance in funds:", error);
      res.status(500).json({ message: "Failed to fetch user total balance in funds" });
    }
  });

  // Get user's pending retributions count
  app.get("/api/accounts/:accountId/pending-retributions", async (req, res) => {
    try {
      const { accountId } = req.params;

      // TODO: Implementar autenticação adequada
      // Por enquanto, limitando ao usuário fixo para desenvolvimento
      const allowedUserId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";
      if (accountId !== allowedUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const pendingCount = await storage.getUserPendingRetributionsCount(accountId);
      res.json({ pendingCount });
    } catch (error) {
      console.error("Error fetching user pending retributions count:", error);
      res.status(500).json({ message: "Failed to fetch user pending retributions count" });
    }
  });

  // Get user pending retributions count for a specific fund
  app.get("/api/funds/:fundId/pending-retributions/:userId", async (req, res) => {
    try {
      const { fundId, userId } = req.params;
      const pendingCount = await storage.getUserFundPendingRetributionsCount(fundId, userId);
      res.json({ pendingCount });
    } catch (error: any) {
      console.error("Error fetching user fund pending retributions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user transactions
  app.get("/api/accounts/:accountId/transactions", async (req, res) => {
    try {
      const { accountId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      // TODO: Implementar autenticação adequada
      // Por enquanto, limitando ao usuário fixo para desenvolvimento
      const allowedUserId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";
      if (accountId !== allowedUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const transactions = await storage.getUserTransactions(accountId, limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ message: "Failed to fetch user transactions" });
    }
  });

  // Create contribution
  app.post("/api/contributions", async (req, res) => {
    try {
      const validatedData = insertContributionSchema.parse(req.body);

      // Use a fixed user ID that exists in your Supabase
      // This should be replaced with proper authentication later
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      const contribution = await storage.createContribution(validatedData, userId);
      res.status(201).json(contribution);
    } catch (error) {
      console.error("Error creating contribution:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid contribution data", details: error });
      }
      res.status(500).json({ message: "Failed to create contribution" });
    }
  });

  // Nova rota para processar contribuições completas
  app.post("/api/contributions/process", async (req, res) => {
    try {
      const validatedData = insertContributionSchema.parse(req.body);

      // Use o ID do usuário existente no sistema
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      const result = await storage.processContribution(validatedData, userId);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json({ 
          message: result.message,
          success: false
        });
      }
    } catch (error) {
      console.error("Error processing contribution:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados de contribuição inválidos", details: error });
      }
      res.status(500).json({ message: "Falha ao processar contribuição", error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  });

  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Usar Supabase Auth para fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Buscar dados do perfil na tabela accounts
      const user = await storage.getUser(authData.user.id);

      if (!user) {
        return res.status(404).json({ message: "User profile not found" });
      }

      // Retornar dados do usuário sem informações sensíveis
      const { passwordHash, ...userResponse } = user;
      res.status(200).json({
        ...userResponse,
        session: authData.session // Incluir session token para manter usuário logado
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route
  app.post("/api/logout", async (req, res) => {
    try {
      const { session_token } = req.body;

      if (session_token) {
        // Tentar fazer logout usando o token de sessão
        const { error } = await supabase.auth.admin.signOut(session_token);

        if (error) {
          console.error("Error during logout:", error);
          // Mesmo com erro, continuamos e retornamos sucesso para o frontend
        }
      }

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error during logout:", error);
      // Retorna sucesso mesmo com erro para não atrapalhar o frontend
      res.status(200).json({ message: "Logout successful" });
    }
  });

  // GET capital requests for debugging
  app.get("/api/capital-requests", async (req, res) => {
    try {
      const { data: requests, error } = await supabase
        .from('capital_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar capital requests:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(requests || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Criar solicitação de capital com plano de retribuição
  app.post("/api/capital-requests", async (req, res) => {
    try {
      const { accountId, ...requestData } = req.body;
      
      if (!accountId) {
        return res.status(400).json({ message: "accountId é obrigatório" });
      }

      // Validar dados da solicitação
      const validatedData = insertCapitalRequestWithPlanSchema.parse(requestData);

      const result = await storage.createCapitalRequestWithPlan(validatedData, accountId);
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating capital request:", error);
      
      // Melhor tratamento de erros de validação Zod
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as any;
        const firstIssue = zodError.issues?.[0];
        
        if (firstIssue && firstIssue.message.includes('Cada parcela deve ser de no mínimo R$ 0,01')) {
          return res.status(400).json({ 
            message: "Valor muito baixo para dividir em parcelas. Cada parcela deve ser de no mínimo R$ 0,01. Reduza o número de parcelas ou aumente o valor solicitado."
          });
        }
        
        return res.status(400).json({ 
          message: "Dados inválidos: " + (firstIssue?.message || "Verifique os dados informados")
        });
      }
      
      // Melhor tratamento para erros de constraint do banco
      if (error instanceof Error && error.message.includes('retributions_amount_check')) {
        return res.status(400).json({ 
          message: "Valor muito baixo para dividir em parcelas. Cada parcela deve ser de no mínimo R$ 0,01."
        });
      }
      
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao criar solicitação de capital" });
    }
  });

  // Listar solicitações de capital (para debug)
  app.get("/api/capital-requests", async (req, res) => {
    try {
      const { data: requests, error } = await supabase
        .from('capital_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar capital requests:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(requests || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Aprovar solicitação de capital
  app.post("/api/capital-requests/:id/approve", async (req, res) => {
    try {
      const { id: requestId } = req.params;
      const { approverId } = req.body;
      
      console.log(`=== INICIANDO APROVAÇÃO DE CAPITAL REQUEST ===`);
      console.log(`Request ID: ${requestId}`);
      console.log(`Approver ID: ${approverId}`);
      
      if (!approverId) {
        return res.status(400).json({ message: "approverId é obrigatório" });
      }

      const result = await storage.approveCapitalRequest(requestId, approverId);
      
      console.log(`=== APROVAÇÃO CONCLUÍDA COM SUCESSO ===`);
      console.log(`Transaction created: ${result.transaction.id}`);
      
      res.status(200).json(result);
    } catch (error) {
      console.error("=== ERRO NA APROVAÇÃO ===");
      console.error("Error approving capital request:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao aprovar solicitação de capital" });
    }
  });

  // Teste de aprovação automática (para debug)
  app.post("/api/capital-requests/:id/approve-test", async (req, res) => {
    try {
      const { id: requestId } = req.params;
      
      console.log(`=== TESTE DE APROVAÇÃO AUTOMÁTICA ===`);
      
      // Buscar a solicitação para pegar os dados
      const { data: request, error: requestError } = await supabase
        .from('capital_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }

      console.log(`Solicitação encontrada:`, request);
      
      // Buscar um admin do fundo para usar como aprovador
      const { data: admins, error: adminError } = await supabase
        .from('fund_members')
        .select('account_id')
        .eq('fund_id', request.fund_id)
        .eq('role', 'admin')
        .neq('account_id', request.account_id) // Não pode ser o próprio solicitante
        .limit(1);

      if (adminError || !admins?.length) {
        return res.status(400).json({ message: 'Não há admin disponível para aprovação' });
      }

      const approverId = admins[0].account_id;
      console.log(`Usando admin ${approverId} para aprovação`);

      const result = await storage.approveCapitalRequest(requestId, approverId);
      
      console.log(`=== TESTE DE APROVAÇÃO CONCLUÍDO ===`);
      
      res.status(200).json(result);
    } catch (error) {
      console.error("=== ERRO NO TESTE DE APROVAÇÃO ===");
      console.error("Error in test approval:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro no teste de aprovação" });
    }
  });

  // Fund access settings routes
  // Get current access settings for a fund
  app.get("/api/funds/:id/access-settings", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      const settings = await storage.getFundAccessSettings(fundId);
      
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
          isOpenForNewMembers: true,
          requiresApprovalForNewMembers: false,
          allowsInviteLink: true
        };
        return res.status(200).json(defaultSettings);
      }

      res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching fund access settings:", error);
      res.status(500).json({ message: "Failed to fetch fund access settings" });
    }
  });

  // Update access settings for a fund
  app.post("/api/funds/:id/access-settings", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      const { changeReason, allowsJoinRequests, ...settingsData } = req.body;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      // SECURITY FIX: Get changedBy from session, not from client
      // For now, using the fixed user ID from the existing pattern
      // TODO: Replace with proper session-based authentication
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      const validatedData = insertFundAccessSettingsSchema.parse({
        fundId,
        changedBy: userId, // Secure: derived from server-side session
        changeReason: changeReason || "Configurações atualizadas via interface",
        ...settingsData
      });

      const updatedSettings = await storage.updateFundAccessSettings(validatedData);
      
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error("Error updating fund access settings:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid settings data", details: error });
      }
      res.status(500).json({ message: "Failed to update fund access settings" });
    }
  });

  // Get current quorum settings for a fund
  app.get("/api/funds/:id/quorum-settings", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      const settings = await storage.getFundQuorumSettings(fundId);
      
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
          governanceType: 'quorum',
          quorumPercentage: '60.00',
          votingRestriction: 'all_members'
        };
        return res.status(200).json(defaultSettings);
      }

      res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching fund quorum settings:", error);
      res.status(500).json({ message: "Failed to fetch fund quorum settings" });
    }
  });

  // Update quorum settings for a fund
  app.post("/api/funds/:id/quorum-settings", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      const { changeReason, ...settingsData } = req.body;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      // SECURITY FIX: Get changedBy from session, not from client
      // For now, using the fixed user ID from the existing pattern
      // TODO: Replace with proper session-based authentication
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      // VALIDAÇÃO DE SEGURANÇA: Se for governança unânime, sempre forçar 100%
      const secureSettingsData = {
        ...settingsData,
        quorumPercentage: settingsData.governanceType === 'unanimous' ? '100.00' : settingsData.quorumPercentage
      };

      const validatedData = insertFundQuorumSettingsSchema.parse({
        fundId,
        changedBy: userId, // Secure: derived from server-side session
        changeReason: changeReason || "Configurações de governança atualizadas",
        ...secureSettingsData
      });

      const updatedSettings = await storage.updateFundQuorumSettings(validatedData);
      
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error("Error updating fund quorum settings:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid quorum settings data", details: error });
      }
      res.status(500).json({ message: "Failed to update fund quorum settings" });
    }
  });

  // Get contribution rates for a fund
  app.get("/api/funds/:id/contribution-rates", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      const rates = await storage.getFundContributionRates(fundId);
      
      if (!rates) {
        // Return default rates if none exist
        const defaultRates = {
          contributionRate: '0.5000' // 50% default
        };
        return res.status(200).json(defaultRates);
      }

      res.status(200).json(rates);
    } catch (error) {
      console.error("Error fetching fund contribution rates:", error);
      res.status(500).json({ message: "Failed to fetch fund contribution rates" });
    }
  });

  // Update contribution rates for a fund
  app.post("/api/funds/:id/contribution-rates", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      const { changeReason, contributionRate } = req.body;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      // SECURITY: Get changedBy from session - using fixed user ID for now
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      const validatedData = insertFundContributionRatesSchema.parse({
        fundId,
        contributionRate: contributionRate.toString(),
        changedBy: userId,
        changeReason: changeReason || "Taxa de contribuição atualizada"
      });

      const updatedRates = await storage.updateFundContributionRates(validatedData);
      
      res.status(200).json(updatedRates);
    } catch (error) {
      console.error("Error updating fund contribution rates:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid contribution rates data", details: error });
      }
      res.status(500).json({ message: "Failed to update fund contribution rates" });
    }
  });

  // Get retribution rates for a fund
  app.get("/api/funds/:id/retribution-rates", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      const rates = await storage.getFundRetributionRates(fundId);
      
      if (!rates) {
        // Return default rates if none exist
        const defaultRates = {
          retributionRate: '1.0000' // 100% default
        };
        return res.status(200).json(defaultRates);
      }

      res.status(200).json(rates);
    } catch (error) {
      console.error("Error fetching fund retribution rates:", error);
      res.status(500).json({ message: "Failed to fetch fund retribution rates" });
    }
  });

  // Update retribution rates for a fund
  app.post("/api/funds/:id/retribution-rates", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      const { changeReason, retributionRate } = req.body;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      // SECURITY: Get changedBy from session - using fixed user ID for now
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      const validatedData = insertFundRetributionRatesSchema.parse({
        fundId,
        retributionRate: retributionRate.toString(),
        changedBy: userId,
        changeReason: changeReason || "Taxa de retribuição atualizada"
      });

      const updatedRates = await storage.updateFundRetributionRates(validatedData);
      
      res.status(200).json(updatedRates);
    } catch (error) {
      console.error("Error updating fund retribution rates:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid retribution rates data", details: error });
      }
      res.status(500).json({ message: "Failed to update fund retribution rates" });
    }
  });

  // Update fund objective
  app.post("/api/funds/:id/objective", async (req, res) => {
    try {
      const { id: fundId } = req.params;
      const { changeReason, objective } = req.body;
      
      if (!fundId) {
        return res.status(400).json({ message: "Fund ID is required" });
      }

      // SECURITY: Get changedBy from session - using fixed user ID for now
      const userId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

      const validatedData = updateFundObjectiveSchema.parse({
        fundId,
        objective,
        changedBy: userId,
        changeReason: changeReason || "Objetivo do fundo atualizado"
      });

      // Update fund objective using the generic updateFund method
      const updatedFund = await storage.updateFund(fundId, {
        objective: validatedData.objective,
        updatedAt: new Date()
      });
      
      if (!updatedFund) {
        return res.status(404).json({ message: "Fund not found" });
      }

      res.status(200).json(updatedFund);
    } catch (error) {
      console.error("Error updating fund objective:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid objective data", details: error });
      }
      res.status(500).json({ message: "Failed to update fund objective" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}