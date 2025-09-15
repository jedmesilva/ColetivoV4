import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
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
      
      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(validatedData.passwordHash, saltRounds);
      
      const user = await storage.createUser({
        ...validatedData,
        passwordHash: hashedPassword
      });
      
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
      const funds = await storage.getFunds();
      res.json(funds);
    } catch (error) {
      console.error("Error fetching funds:", error);
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });

  // Get single fund
  app.get("/api/funds/:id", async (req, res) => {
    try {
      const fund = await storage.getFund(parseInt(req.params.id));
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      res.json(fund);
    } catch (error) {
      console.error("Error fetching fund:", error);
      res.status(500).json({ message: "Failed to fetch fund" });
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
      const contributions = await storage.getContributions(parseInt(req.params.id));
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

  const httpServer = createServer(app);
  return httpServer;
}
