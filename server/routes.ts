import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFundSchema, insertContributionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Create new fund
  app.post("/api/funds", async (req, res) => {
    try {
      const validatedData = insertFundSchema.parse(req.body);
      
      // TODO: Get userId from session/auth
      const userId = "default-user-id"; // This should come from authentication
      
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
      
      // TODO: Get userId from session/auth
      const userId = "default-user-id"; // This should come from authentication
      
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
