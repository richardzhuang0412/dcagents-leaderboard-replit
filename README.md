# DC-Agents Leaderboard

Web-based leaderboard for displaying LLM agent benchmark evaluation results from Supabase.

## Features

- 🔍 **Search** - Real-time filtering by model, agent, or benchmark name
- 🎯 **Filter** - Multi-select dropdowns for precise filtering
- ↕️ **Sort** - Click column headers to sort by any field
- 🎨 **Theme** - Dark/light mode toggle
- 📊 **Live Data** - Direct connection to Supabase database

## Prerequisites

1. **Node.js** - Version 20 or higher
2. **Supabase Account** - With a configured project
3. **Database Setup** - Supabase database with:
   - Core tables: `agents`, `models`, `benchmarks`
   - Evaluation tables: `sandbox_jobs`, `sandbox_trials`
   - View: `leaderboard_results` (see setup below)

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the `leaderboard/` directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co/
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **API Keys**

### 2. Database View Setup

The leaderboard requires a database view to aggregate evaluation results.

**Run this SQL in Supabase SQL Editor:**

```sql
-- Open: Supabase Dashboard → SQL Editor → New Query
-- Copy and paste the contents of create_leaderboard_view.sql
```

Or manually create the view:

```sql
CREATE OR REPLACE VIEW leaderboard_results AS
SELECT DISTINCT ON (a.name, m.name, b.name)
  gen_random_uuid()::text as id,
  m.name as model_name,
  a.name as agent_name,
  b.name as benchmark_name,
  (
    SELECT (elem->>'value')::float * 100
    FROM jsonb_array_elements(sj.metrics) elem
    WHERE elem->>'name' = 'accuracy'
    LIMIT 1
  ) as accuracy,
  (
    SELECT (elem->>'value')::float * 100
    FROM jsonb_array_elements(sj.metrics) elem
    WHERE elem->>'name' = 'accuracy_stderr'
    LIMIT 1
  ) as standard_error
FROM sandbox_jobs sj
INNER JOIN agents a ON sj.agent_id = a.id
INNER JOIN models m ON sj.model_id = m.id
INNER JOIN benchmarks b ON sj.benchmark_id = b.id
WHERE sj.metrics IS NOT NULL
ORDER BY a.name, m.name, b.name,
         COALESCE(sj.ended_at, sj.created_at) DESC;

-- Grant permissions
GRANT SELECT ON leaderboard_results TO anon, authenticated;
```

**Verify the view:**
```sql
SELECT COUNT(*) FROM leaderboard_results;
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The application will start on **http://localhost:5000** (or the port specified in `PORT` environment variable).

**If port 5000 is in use:**
```bash
PORT=5001 npm run dev
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Usage

1. **Open the leaderboard** - Navigate to http://localhost:5000
2. **Search** - Use the search boxes to filter by model, agent, or benchmark name
3. **Filter** - Use dropdowns to select specific models/agents/benchmarks
4. **Sort** - Click column headers to sort results
5. **Refresh** - Click the refresh button to fetch latest data

## Data Upload

To populate the leaderboard with evaluation results, use the Python upload utilities:

```python
from unified_db import upload_eval_results

result = upload_eval_results(
    job_dir="path/to/evaluation/results",
    username="your-email@example.com",
    error_mode="rollback_on_error",
    register_benchmark=True  # Auto-register benchmarks/tasks
)
```

See the parent directory's `README.md` for detailed upload instructions.

## Architecture

```
┌─────────────────────────────────────────┐
│  React Frontend (Port 5000)             │
│  - Search/Filter/Sort UI                │
│  - TanStack Query for data fetching     │
└─────────────────┬───────────────────────┘
                  │ HTTP GET /api/benchmark-results
                  ↓
┌─────────────────────────────────────────┐
│  Express Server (server/index.ts)       │
│  - API endpoints                         │
│  - Supabase JS client                    │
└─────────────────┬───────────────────────┘
                  │ Query leaderboard_results view
                  ↓
┌─────────────────────────────────────────┐
│  Supabase Database                       │
│  - leaderboard_results VIEW              │
│  - sandbox_jobs, agents, models, etc.    │
└─────────────────────────────────────────┘
```

## Troubleshooting

### "SUPABASE_URL must be set"
- Ensure `.env` file exists in the `leaderboard/` directory
- Check that `SUPABASE_URL` is set correctly (starts with `https://` and ends with `.supabase.co/`)

### "relation 'leaderboard_results' does not exist"
- Run the view creation SQL in Supabase SQL Editor (see Configuration step 2)
- Verify: `SELECT * FROM leaderboard_results LIMIT 1;`

### "No results found" in leaderboard
- Check if you have evaluation data: `SELECT COUNT(*) FROM sandbox_jobs WHERE metrics IS NOT NULL;`
- Verify jobs have `accuracy` in metrics: `SELECT metrics FROM sandbox_jobs WHERE metrics IS NOT NULL LIMIT 1;`
- Ensure jobs are linked to agents, models, and benchmarks via foreign keys

### Port already in use
- Use a different port: `PORT=5001 npm run dev`
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

### npm install issues (macOS ARM64)
If you see `Cannot find module @rollup/rollup-darwin-arm64`:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Manual fix if needed
cd node_modules/@rollup
npm pack @rollup/rollup-darwin-arm64@4.52.4
tar -xzf rollup-rollup-darwin-arm64-4.52.4.tgz
mv package rollup-darwin-arm64
rm rollup-rollup-darwin-arm64-4.52.4.tgz
cd ../..
```

## Development

### Project Structure

```
leaderboard/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components
│       │   ├── SearchBar.tsx
│       │   ├── FilterControls.tsx
│       │   ├── LeaderboardTable.tsx
│       │   └── ThemeToggle.tsx
│       └── pages/
│           └── Leaderboard.tsx  # Main page
├── server/                 # Express backend
│   ├── db.ts              # Supabase client
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
├── .env                   # Environment variables (create this)
├── package.json           # Dependencies
└── README.md              # This file
```

### Adding New Features

**To add a new metric to the table:**
1. Update the view SQL in `create_leaderboard_view.sql`
2. Update `BenchmarkResult` type in `LeaderboardTable.tsx`
3. Update the mapping in `server/storage.ts`
4. Add new column to the table in `LeaderboardTable.tsx`

**To change sorting/filtering logic:**
- Edit `LeaderboardTable.tsx` for sorting
- Edit `FilterControls.tsx` for filter UI
- Edit `Leaderboard.tsx` for filter state management

## Documentation

- **Setup Guide** - `SUPABASE_SETUP.md` - Detailed Supabase integration guide
- **Progress Log** - `PROGRESS.md` - Development progress and troubleshooting
- **View SQL** - `create_leaderboard_view.sql` - Database view definition
- **Project Context** - `CLAUDE.md` - Architecture and development guidelines

## License

MIT
