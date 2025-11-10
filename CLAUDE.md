# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An LLM Agent Benchmark Leaderboard web application for displaying and comparing benchmark results across different models, agents, and benchmark types. Built as a full-stack TypeScript application with React frontend and Express backend, backed by PostgreSQL.

## Development Commands

### Starting the Application

```bash
# Development mode (with hot reload on port 5000)
npm run dev

# Production build (outputs to dist/)
npm run build

# Start production server (runs dist/index.js)
npm start

# Type checking (no compilation)
npm run check
```

The application serves on port 5000 by default (configurable via `PORT` environment variable). In development, Vite provides HMR for the React frontend.

### Environment Setup

The `.env` file must contain Supabase credentials:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Database Initialization** (one-time only after `.env` is set):
```bash
# Create the leaderboard_results view in Supabase
# - Run create_leaderboard_view.sql in Supabase SQL Editor, OR
# - Use: npm run db:push (requires Drizzle setup)
```

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
- Data source is Supabase `leaderboard_results` view, not local Drizzle tables
- Legacy `benchmark_results` table and Drizzle ORM setup not actively used

## Troubleshooting

### "SUPABASE_URL must be set"
- Ensure `.env` file exists in project root
- Verify it contains `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- Restart dev server after updating `.env`

### "relation 'leaderboard_results' does not exist"
- The database view hasn't been created yet
- Run `create_leaderboard_view.sql` in Supabase SQL Editor (see README.md for steps)
- Verify with: `SELECT COUNT(*) FROM leaderboard_results;` in Supabase

### "No results found" in leaderboard
- Check if Supabase has evaluation data: `SELECT COUNT(*) FROM sandbox_jobs WHERE metrics IS NOT NULL;`
- Verify metrics format: `SELECT metrics FROM sandbox_jobs LIMIT 1;` (should contain `accuracy` and `accuracy_stderr`)
- Ensure jobs are linked to agents, models, and benchmarks via foreign keys

### Port 5000 already in use
- Use a different port: `PORT=5001 npm run dev`
- Or find and kill the process: `lsof -ti:5000 | xargs kill`

### npm/yarn dependency issues
- For platform-specific Rollup issues: `rm -rf node_modules package-lock.json && npm install`
- Or use Yarn instead: `yarn install && yarn dev` (Yarn handles optional dependencies better)

## Modifications and Customization

### Changing Benchmark Columns

To add, remove, or modify benchmark columns in the leaderboard:
1. Ensure the benchmark data exists in Supabase (`benchmarks` table)
2. The `/api/leaderboard-pivoted` endpoint will automatically include all benchmarks from the view
3. Use the benchmark filter/search in the UI to show/hide specific benchmarks

### Displaying Additional Metrics

Currently, the leaderboard displays `accuracy ± standard_error` per benchmark. To add other metrics:
1. Update the `leaderboard_results` view SQL to extract additional metrics from `sandbox_jobs.metrics` (JSONB)
2. Update the pivoted response structure in `server/routes.ts:34-48`
3. Modify `LeaderboardTable.tsx` to display the new metrics in the table cells

### Customizing Table Appearance

- Column sorting: Implemented in `LeaderboardTable.tsx` (click headers to sort)
- Cell formatting: Edit `LeaderboardTable.tsx` to change how accuracy/error are displayed
- Color schemes: Uses Tailwind CSS classes; update dark/light theme in `client/src/pages/Leaderboard.tsx`
- Styling follows design guidelines in `design_guidelines.md`

## File Structure Reference

Key files for common modifications:
- **Client UI**: `client/src/pages/Leaderboard.tsx` - Main layout and state
- **Data Display**: `client/src/components/LeaderboardTable.tsx` - Table rendering and sorting
- **Filtering**: `client/src/components/FilterControls.tsx` and `SearchBar.tsx` - Filter UI
- **API**: `server/routes.ts` - `/api/leaderboard-pivoted` endpoint (data transformation)
- **Data Access**: `server/storage.ts` - Database query abstraction
- **Database**: `create_leaderboard_view.sql` - Supabase view definition
- **Types**: `shared/schema.ts` - Shared TypeScript types and Zod schemas
- Do not write unnecessary progress summary files, put all summary/progresses under PROGRESS.md