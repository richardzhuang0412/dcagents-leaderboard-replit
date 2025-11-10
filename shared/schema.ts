import { sql } from "drizzle-orm";
import { pgTable, text, varchar, doublePrecision, uuid, timestamp, jsonb, integer, numeric, boolean, char } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Supabase schema tables for leaderboard
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  agentVersionHash: char("agent_version_hash", { length: 64 }),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const models = pgTable("models", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  baseModelId: uuid("base_model_id").references(() => models.id),
  createdBy: text("created_by").notNull(),
  creationLocation: text("creation_location").notNull(),
  creationTime: timestamp("creation_time", { withTimezone: true }).defaultNow(),
  datasetId: uuid("dataset_id"),
  isExternal: boolean("is_external").notNull().default(false),
  weightsLocation: text("weights_location").notNull(),
  wandbLink: text("wandb_link"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  trainingStart: timestamp("training_start", { withTimezone: true }).notNull(),
  trainingEnd: timestamp("training_end", { withTimezone: true }),
  trainingParameters: jsonb("training_parameters").notNull(),
  trainingStatus: text("training_status"),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  trainingType: text("training_type"),
  tracesLocationS3: text("traces_location_s3"),
  description: text("description"),
});

export const benchmarks = pgTable("benchmarks", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  benchmarkVersionHash: char("benchmark_version_hash", { length: 64 }),
  isExternal: boolean("is_external").notNull().default(false),
  externalLink: text("external_link"),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sandboxJobs = pgTable("sandbox_jobs", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  jobName: text("job_name").notNull(),
  username: text("username").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  gitCommitId: text("git_commit_id"),
  packageVersion: text("package_version"),
  nTrials: integer("n_trials").notNull(),
  config: jsonb("config").notNull(),
  metrics: jsonb("metrics"),
  stats: jsonb("stats"),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  modelId: uuid("model_id").notNull().references(() => models.id),
  benchmarkId: uuid("benchmark_id").notNull().references(() => benchmarks.id),
  nRepEval: integer("n_rep_eval").notNull(),
  hfTracesLink: text("hf_traces_link"),
});

export const sandboxTasks = pgTable("sandbox_tasks", {
  checksum: text("checksum").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  source: text("source"),
  name: text("name").notNull(),
  instruction: text("instruction").notNull().default(''),
  agentTimeoutSec: numeric("agent_timeout_sec").notNull(),
  verifierTimeoutSec: numeric("verifier_timeout_sec").notNull(),
  gitUrl: text("git_url"),
  gitCommitId: text("git_commit_id"),
  path: text("path").notNull(),
});

export const sandboxTrials = pgTable("sandbox_trials", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  trialName: text("trial_name").notNull(),
  trialUri: text("trial_uri").notNull(),
  jobId: uuid("job_id").references(() => sandboxJobs.id),
  taskChecksum: text("task_checksum").notNull().references(() => sandboxTasks.checksum),
  reward: numeric("reward"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  environmentSetupStartedAt: timestamp("environment_setup_started_at", { withTimezone: true }),
  environmentSetupEndedAt: timestamp("environment_setup_ended_at", { withTimezone: true }),
  agentSetupStartedAt: timestamp("agent_setup_started_at", { withTimezone: true }),
  agentSetupEndedAt: timestamp("agent_setup_ended_at", { withTimezone: true }),
  agentExecutionStartedAt: timestamp("agent_execution_started_at", { withTimezone: true }),
  agentExecutionEndedAt: timestamp("agent_execution_ended_at", { withTimezone: true }),
  verifierStartedAt: timestamp("verifier_started_at", { withTimezone: true }),
  verifierEndedAt: timestamp("verifier_ended_at", { withTimezone: true }),
  config: jsonb("config").notNull(),
  exceptionInfo: jsonb("exception_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Legacy table for compatibility (not used)
export const benchmarkResults = pgTable("benchmark_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelName: text("model_name").notNull(),
  agentName: text("agent_name").notNull(),
  benchmarkName: text("benchmark_name").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  standardError: doublePrecision("standard_error").notNull(),
});

export const insertBenchmarkResultSchema = createInsertSchema(benchmarkResults).omit({
  id: true,
});

export type InsertBenchmarkResult = z.infer<typeof insertBenchmarkResultSchema>;
export type BenchmarkResult = typeof benchmarkResults.$inferSelect;
