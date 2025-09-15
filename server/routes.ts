import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { supabase } from "./db";
import { insertFundSchema, insertContributionSchema, insertAccountSchema } from "@shared/schema";

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
      const { password_hash, ...userResponse } = user;
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
      const funds = await storage.getFunds();
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

      // Use a fixed user ID that exists in your Supabase
      // This should be replaced with proper authentication later
      const userId = "00000000-0000-0000-0000-000000000000";

      const fund = await storage.createFund(validatedData, userId);
      res.status(201).json(fund);
    } catch (error) {
      console.error("Error creating fund:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid fund data", details: error });
      }
      res.status(500).json({ message: "Failed to create fund" });
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

  // Create contribution
  app.post("/api/contributions", async (req, res) => {
    try {
      const validatedData = insertContributionSchema.parse(req.body);

      // Use a fixed user ID that exists in your Supabase
      // This should be replaced with proper authentication later
      const userId = "00000000-0000-0000-0000-000000000000";

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
      const { password_hash, ...userResponse } = user;
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

  const httpServer = createServer(app);
  return httpServer;
}