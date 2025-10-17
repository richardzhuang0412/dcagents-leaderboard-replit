# Supabase Backend Integration - Setup Guide

## Overview

The leaderboard uses the Supabase JS client to connect to your Supabase database and display benchmark results aggregated from evaluation data. No database password needed!

## What Changed

### 1. Package Installation
- Added `@supabase/supabase-js` for Supabase client library

### 2. Database Client (`server/db.ts`)
- **Before**: Direct PostgreSQL connection with Drizzle ORM
- **After**: Supabase JS client using API keys
- **Benefit**: No password needed, consistent with Python utilities

### 3. Database Schema
- Created `leaderboard_results` VIEW in Supabase
- View aggregates data from: `sandbox_jobs`, `agents`, `models`, `benchmarks`
- Parses `accuracy` and `accuracy_stderr` from `metrics` JSONB field
- Deduplicates by (agent, model, benchmark) keeping latest job

### 4. Storage Layer (`server/storage.ts`)
- **Before**: Complex SQL query with raw execution
- **After**: Simple query: `supabase.from('leaderboard_results').select('*')`
- Much cleaner and easier to maintain

### 5. Environment Configuration (`.env`)
- **Removed**: `DATABASE_URL` (no longer needed)
- **Uses**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Setup Steps

### 1. Create the Database View

Run the SQL in `create_leaderboard_view.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `create_leaderboard_view.sql`
4. Click **Run** or press `Ctrl/Cmd + Enter`

The view will:
- Parse accuracy and stderr from `sandbox_jobs.metrics` JSONB
- Join with agents, models, and benchmarks tables
- Deduplicate keeping the latest job per (agent, model, benchmark)
- Return results in the format expected by the frontend

### 2. Verify Environment Variables

Check that `.env` has the following (should already be set):

```bash
SUPABASE_URL=https://your-project.supabase.co/
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**No `DATABASE_URL` needed!** The Supabase client uses API keys instead.

### 3. Install Dependencies (if needed)

```bash
npm install
```

This will install `@supabase/supabase-js`, `dotenv`, and other dependencies.

**Note**: The server automatically loads `.env` via `dotenv/config` imported at the top of `server/index.ts`.

### 4. Start the Leaderboard

```bash
npm run dev
```

The app will run on http://localhost:5000 (or the port specified in `PORT` env var).

### 5. Verify Data

The leaderboard should display:
- **Model Name**: From `models.name`
- **Agent Name**: From `agents.name`
- **Benchmark Name**: From `benchmarks.name`
- **Accuracy**: Parsed from `sandbox_jobs.metrics[].value` where `name='accuracy'` × 100
- **Std Error**: Parsed from `sandbox_jobs.metrics[].value` where `name='accuracy_stderr'` × 100

## Data Flow

```
sandbox_jobs (contains metrics JSONB)
    ↓
leaderboard_results VIEW
  - Joins: agents, models, benchmarks
  - Parses: accuracy, accuracy_stderr from metrics
  - Deduplicates: latest per (agent, model, benchmark)
    ↓
Supabase JS Client
  - supabase.from('leaderboard_results').select('*')
    ↓
Leaderboard Display
```

## Metrics Format

Each `sandbox_jobs.metrics` field contains a JSONB array:

```json
[
  {"name": "accuracy", "value": 0.05925925925925926},
  {"name": "accuracy_stderr", "value": 0.019598157859737706}
]
```

The view extracts:
- `accuracy` → displayed as percentage (5.93%)
- `accuracy_stderr` → displayed as std error (±1.96)

If `accuracy_stderr` is missing, the leaderboard shows 0 for standard error.

## Troubleshooting

### "SUPABASE_URL must be set"
- Make sure `.env` file is in the `leaderboard/` directory
- Check that `SUPABASE_URL` is set correctly
- Verify it starts with `https://` and ends with `.supabase.co/`

### "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set"
- Make sure at least one key is set in `.env`
- Get keys from: Supabase Dashboard → Project Settings → API
- Service role key is preferred for server-side operations

### "relation 'leaderboard_results' does not exist"
- You need to create the view first (see Step 1)
- Run the SQL in `create_leaderboard_view.sql` in Supabase SQL Editor
- Verify: `SELECT COUNT(*) FROM leaderboard_results;`

### "No results found" in leaderboard
- Check if you have data in Supabase tables:
  ```sql
  SELECT COUNT(*) FROM sandbox_jobs WHERE metrics IS NOT NULL;
  ```
- Ensure jobs have `metrics` field populated with accuracy data
- Check that jobs are linked to agents, models, and benchmarks via foreign keys
- Verify the view returns data: `SELECT * FROM leaderboard_results LIMIT 5;`

### Permission errors / "Row level security" errors
- The view should have `GRANT SELECT` to `anon` and `authenticated` roles
- This is included in `create_leaderboard_view.sql`
- If using `ANON_KEY`, make sure RLS policies allow reading the underlying tables
- If using `SERVICE_ROLE_KEY`, RLS is bypassed (recommended for server-side)

## API Endpoints

- `GET /api/benchmark-results` - Fetch aggregated leaderboard data (only endpoint used)
- Other endpoints (GET/:id, POST, DELETE) are legacy and not implemented

The leaderboard only uses the first endpoint for display.

## Frontend Features (Already Working)

- ✅ Search by model, agent, or benchmark name
- ✅ Filter with multi-select dropdowns
- ✅ Sort by any column (model, agent, benchmark, accuracy, std error)
- ✅ Dark/light theme toggle
- ✅ Responsive design
- ✅ Real-time refresh button

## Advantages of Supabase JS Client

1. **No password needed**: Uses API keys from `.env` (already set up)
2. **Consistent with Python**: Matches the pattern in `unified_db/config.py`
3. **Simpler setup**: No PostgreSQL connection string needed
4. **Auto-managed**: Connection pooling, retries, error handling built-in
5. **Type-safe**: Full TypeScript support
6. **Faster development**: Cleaner code, easier to maintain

## View vs Direct Query

**Why use a VIEW?**
- Complex SQL logic (JSONB parsing, deduplication) lives in the database
- TypeScript code is simple: just `select('*')`
- View can be reused by other applications
- Performance: PostgreSQL can optimize view queries
- Easier to update logic (just update the view, no code changes)

## Next Steps

1. **Populate Data**: Use `upload_eval_results()` to upload evaluation results to Supabase
2. **Customize View**: Modify the SQL query in `create_leaderboard_view.sql` to change aggregation logic
3. **Add Filters**: Extend the view to add date filters, training type filters, etc.
4. **Add Charts**: Use recharts (already installed) to visualize trends
5. **Real-time Updates**: Use Supabase Realtime to listen for changes (optional)

## Production Deployment

When deploying:

1. Set environment variables (don't commit `.env`):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (preferred for server-side)
   - `NODE_ENV=production`
2. Run `npm run build && npm start`
3. The app will use the service role key automatically

## Comparison: Before vs After

### Before (PostgreSQL Direct)
```typescript
// Needed DATABASE_URL with password
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Complex raw SQL query
const results = await db.execute(sql`
  SELECT DISTINCT ON ...
  FROM sandbox_jobs sj
  INNER JOIN ...
  WHERE ...
`)
```

### After (Supabase JS Client)
```typescript
// Uses API keys from .env (no password)
const supabase = createClient(supabaseUrl, supabaseKey)

// Simple query to view
const { data } = await supabase
  .from('leaderboard_results')
  .select('*')
```

Much cleaner! 🎉

## Example View Output

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "model_name": "DCAgent/code-contests-sandboxes-traces-terminus-2_adam-beta1_0.89",
    "agent_name": "terminus-2",
    "benchmark_name": "clean-sandboxes-tasks-eval-set",
    "accuracy": 4.81,
    "standard_error": 1.96
  }
]
```

This matches the expected format for the frontend components.
