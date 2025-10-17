import { type BenchmarkResult, type InsertBenchmarkResult } from "@shared/schema";
import { supabase } from "@db";
import { benchmarkResults } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllBenchmarkResults(): Promise<BenchmarkResult[]>;
  getBenchmarkResult(id: string): Promise<BenchmarkResult | undefined>;
  createBenchmarkResult(result: InsertBenchmarkResult): Promise<BenchmarkResult>;
  deleteBenchmarkResult(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getAllBenchmarkResults(): Promise<BenchmarkResult[]> {
    // Query the leaderboard_results view
    // This view aggregates data from sandbox_jobs, parsing metrics
    // and deduplicating by (agent, model, benchmark) keeping the latest job
    const { data, error } = await supabase
      .from('leaderboard_results')
      .select('*');

    if (error) {
      console.error('Error fetching leaderboard results:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(row => ({
      id: row.id,
      modelName: row.model_name,
      agentName: row.agent_name,
      benchmarkName: row.benchmark_name,
      accuracy: row.accuracy ?? 0,
      standardError: row.standard_error ?? 0,
    }));
  }

  async getBenchmarkResult(id: string): Promise<BenchmarkResult | undefined> {
    // Legacy method - not used by leaderboard
    // Would need to query benchmark_results table if needed
    throw new Error('getBenchmarkResult is not implemented for Supabase view-based leaderboard');
  }

  async createBenchmarkResult(result: InsertBenchmarkResult): Promise<BenchmarkResult> {
    // Legacy method - not used by leaderboard
    // Leaderboard data comes from sandbox_jobs view, not direct inserts
    throw new Error('createBenchmarkResult is not implemented for Supabase view-based leaderboard');
  }

  async deleteBenchmarkResult(id: string): Promise<void> {
    // Legacy method - not used by leaderboard
    // Leaderboard data comes from sandbox_jobs view, not direct deletes
    throw new Error('deleteBenchmarkResult is not implemented for Supabase view-based leaderboard');
  }
}

export const storage = new DbStorage();
