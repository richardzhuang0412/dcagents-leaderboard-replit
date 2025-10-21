import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBenchmarkResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all benchmark results
  app.get("/api/benchmark-results", async (req, res) => {
    try {
      const results = await storage.getAllBenchmarkResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching benchmark results:", error);
      res.status(500).json({ error: "Failed to fetch benchmark results" });
    }
  });

  // Get single benchmark result
  app.get("/api/benchmark-results/:id", async (req, res) => {
    try {
      const result = await storage.getBenchmarkResult(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Benchmark result not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching benchmark result:", error);
      res.status(500).json({ error: "Failed to fetch benchmark result" });
    }
  });

  // Create new benchmark result
  app.post("/api/benchmark-results", async (req, res) => {
    try {
      const validatedData = insertBenchmarkResultSchema.parse(req.body);
      const result = await storage.createBenchmarkResult(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating benchmark result:", error);
      res.status(500).json({ error: "Failed to create benchmark result" });
    }
  });

  // Delete benchmark result
  app.delete("/api/benchmark-results/:id", async (req, res) => {
    try {
      await storage.deleteBenchmarkResult(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting benchmark result:", error);
      res.status(500).json({ error: "Failed to delete benchmark result" });
    }
  });

  // Get pivoted leaderboard data (benchmarks as columns)
  app.get("/api/leaderboard-pivoted", async (req, res) => {
    try {
      const results = await storage.getAllBenchmarkResults();

      // Group by (model, agent) combination
      const groupedData = new Map<string, {
        modelName: string;
        agentName: string;
        benchmarks: Record<string, { accuracy: number; standardError: number }>;
      }>();

      for (const result of results) {
        const key = `${result.modelName}|||${result.agentName}`;

        if (!groupedData.has(key)) {
          groupedData.set(key, {
            modelName: result.modelName,
            agentName: result.agentName,
            benchmarks: {}
          });
        }

        const group = groupedData.get(key)!;
        group.benchmarks[result.benchmarkName] = {
          accuracy: result.accuracy,
          standardError: result.standardError
        };
      }

      // Convert to array and sort by model name, then agent name
      const pivotedData = Array.from(groupedData.values()).sort((a, b) => {
        const modelCompare = a.modelName.localeCompare(b.modelName);
        if (modelCompare !== 0) return modelCompare;
        return a.agentName.localeCompare(b.agentName);
      });

      res.json(pivotedData);
    } catch (error) {
      console.error("Error fetching pivoted leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch pivoted leaderboard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
