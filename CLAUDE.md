# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An LLM Agent Benchmark Leaderboard web application for displaying and comparing benchmark results across different models, agents, and benchmark types. Built as a full-stack TypeScript application with React frontend and Express backend, backed by PostgreSQL.

## Development Commands

### Starting the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

The application serves on port 5000 by default (configurable via `PORT` environment variable). In development, Vite middleware provides HMR for the React frontend.

### Database Management

```bash
# Push schema changes to database (creates/updates tables)
npm run db:push

# Type checking
npm run check
```

**Important**: The `DATABASE_URL` environment variable must be set before running the application. The database connection requires PostgreSQL (using Neon serverless driver).

## Architecture Overview

### Full-Stack Structure

- **Client**: `/client/src` - React 18 + TypeScript + Vite
- **Server**: `/server` - Express.js + TypeScript
- **Shared**: `/shared` - Common types and schemas used by both client and server
- **Database**: PostgreSQL accessed via Drizzle ORM

### Key Architectural Patterns

1. **Shared Schema Layer**: The `/shared/schema.ts` file defines both the database schema (Drizzle) and validation schemas (Zod), ensuring type consistency across the entire stack.

2. **Storage Abstraction**: `server/storage.ts` implements an `IStorage` interface with `DbStorage` class, allowing the data layer to be swapped without changing route handlers.

3. **Client State Management**: TanStack Query handles all server state with infinite stale time (manual refresh only). Local UI state uses React hooks.

4. **Path Aliases**:
   - `@/` → `client/src/`
   - `@shared/` → `shared/`
   - `@db` → `server/db.ts`

### Data Model

The application uses a Supabase database with the following key tables:
- `agents` - Agent definitions with version hashes
- `models` - Model metadata, training parameters, and references to agents
- `benchmarks` - Benchmark definitions with version hashes
- `sandbox_jobs` - Evaluation job records linking models, agents, and benchmarks
- `sandbox_trials` - Individual trial results for each job
- `sandbox_tasks` - Task definitions used in benchmarks

The leaderboard reads from a `leaderboard_results` view that aggregates data from `sandbox_jobs`, keeping the latest result per (model, agent, benchmark) combination.

### API Endpoints

All under `/api` prefix:
- `GET /api/leaderboard-pivoted` - **Primary endpoint**: Returns pivoted leaderboard data where each row represents a (model, agent) pair with benchmarks as nested properties
- `GET /api/benchmark-results` - Legacy endpoint: Fetch all results in flat format
- `GET /api/benchmark-results/:id` - Legacy endpoint: Fetch single result (not implemented for Supabase view)
- `POST /api/benchmark-results` - Legacy endpoint: Create new result (not implemented for Supabase view)
- `DELETE /api/benchmark-results/:id` - Legacy endpoint: Delete result (not implemented for Supabase view)

### Frontend Components

Main page: `client/src/pages/Leaderboard.tsx`
- `SearchBar` - Separate search inputs:
  - Model search: Filters table rows
  - Agent search: Filters table rows
  - Benchmark search: **Filters which benchmark columns are visible**
- `FilterControls` - Multi-select dropdowns:
  - Model filter: Filters table rows
  - Agent filter: Filters table rows
  - Benchmark filter: **Controls which benchmark columns are displayed**
- `LeaderboardTable` - Pivoted table with dynamic columns:
  - Fixed columns: Model Name, Agent Name
  - Dynamic columns: One column per benchmark showing "accuracy% ± stderr"
  - Sortable by any column (model, agent, or any benchmark)
  - Missing data shown as "—" when a model+agent combo doesn't have a particular benchmark result
- `ThemeToggle` - Dark/light mode switcher

UI components in `client/src/components/ui/` are from shadcn/ui (Radix UI + Tailwind CSS).

### Data Structure

The leaderboard uses a **pivoted data structure**:
```typescript
interface PivotedLeaderboardRow {
  modelName: string;
  agentName: string;
  benchmarks: {
    [benchmarkName: string]: {
      accuracy: number;
      standardError: number;
    }
  }
}
```

Each row represents a unique (model, agent) combination. Benchmarks appear as columns, not rows. The table dynamically generates columns based on available benchmarks in the data.

### Development Environment

- **Development**: Server runs via `tsx` with Vite middleware for HMR
- **Production**: Vite builds to `dist/public`, esbuild bundles server to `dist/index.js`
- **Database**: SSL required in production, preferred in development

## Design Principles

From `design_guidelines.md`:
- Data-centric Material Design approach prioritizing information density
- Dark mode primary with light mode support
- Inter font for UI, JetBrains Mono for metrics
- Professional, research-appropriate aesthetic

## Common Tasks

### Understanding the Leaderboard Display

The leaderboard displays results in a **pivoted format**:
- Each row = one (model, agent) combination
- Each benchmark = one column showing "accuracy% ± stderr"
- Missing data (when a model+agent doesn't have a result for a benchmark) shows "—"

Example table structure:
```
| Model     | Agent  | Benchmark1 | Benchmark2 | Benchmark3 |
|-----------|--------|------------|------------|------------|
| GPT-4     | ReAct  | 89.2% ±0.12| 75.3% ±0.08| —          |
| Claude-3  | ReAct  | 92.1% ±0.09| 78.4% ±0.11| 85.0% ±0.15|
```

### How Filtering Works

- **Model/Agent Search**: Filters which **rows** are displayed
- **Model/Agent Filters**: Filters which **rows** are displayed
- **Benchmark Search**: Filters which **columns** are visible
- **Benchmark Filters**: Filters which **columns** are visible

### Adding New Data

Data comes from the Supabase `leaderboard_results` view, which aggregates from `sandbox_jobs`. To add new benchmark results:
1. Insert records into the appropriate Supabase tables (`agents`, `models`, `benchmarks`, `sandbox_jobs`, etc.)
2. The view will automatically include the latest results per (model, agent, benchmark) combination
3. Refresh the leaderboard page to see new data

### Modifying the Pivoting Logic

The pivoting happens in `server/routes.ts` at the `/api/leaderboard-pivoted` endpoint:
1. Fetches flat data from storage (via `leaderboard_results` view)
2. Groups by (model, agent) combination using a Map with key format `modelName|||agentName`
3. Aggregates benchmarks as nested objects
4. Sorts by model name, then agent name

### Adding New API Endpoints

1. Add route handler in `server/routes.ts`
2. Add corresponding storage method in `server/storage.ts` if database access needed
3. Client queries are auto-fetched by TanStack Query using the endpoint path as the query key

## Important Notes

- No authentication/authorization implemented
- No real-time updates - data refreshes manually only
- No pagination - all results fetched at once
- Filtering and sorting happen client-side after fetching all data
- The leaderboard always shows the **latest** result per (model, agent, benchmark) combination
- Data source is Supabase, not local Drizzle (legacy `benchmark_results` table not used)
