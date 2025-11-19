# DC-Agents Leaderboard

Web-based leaderboard for displaying LLM agent benchmark evaluation results from Supabase.

## Features

- 🔍 **Search** - Real-time filtering by model, agent, benchmark, or base model name
- 🎯 **Filter** - Multi-select dropdowns for precise filtering (including base models)
- ↕️ **Sort** - Click column headers to sort by any field; per-benchmark toggle between accuracy and improvement sort
- 🎨 **Theme** - Dark/light mode toggle
- 📊 **Live Data** - Direct connection to Supabase database
- 📌 **Frozen Columns** - Model Name column stays visible when scrolling horizontally
- 📜 **Dual Scrollbars** - Horizontal scrollbars at both top and bottom for easy navigation
- ⚠️ **Visual Indicators** - Color-coded icons for trace link availability (blue = available, grey = unavailable, red = missing)
- 📖 **Legend** - Built-in legend explaining icon meanings
- 📈 **Improvement Metrics** - View model improvement relative to base models with per-benchmark comparison
- 🔄 **View Toggle** - Switch between standard leaderboard and improvement-enhanced views

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

The leaderboard requires a database view to aggregate evaluation results. The view includes model IDs and base model information for improvement metrics.

**Data Aggregation Strategy:**
The view uses `DISTINCT ON (a.name, m.name, b.name)` to keep only one result per (agent, model, benchmark) combination. The `ORDER BY` clause determines which result is kept:
- **Current (Ascending - `ASC`)**: Keeps the **earliest** valid evaluation
- Results are sorted by timestamp (`COALESCE(sj.ended_at, sj.created_at) ASC`)

**Base Model Information:**
- The view includes a LEFT JOIN to the `models` table to get base model names
- A sub-query fetches base model accuracy for the same (agent, benchmark) combination
- Returns 'None' for models without a base model (NULL base_model_id)

**Run this SQL in Supabase SQL Editor:**

```sql
-- Open: Supabase Dashboard → SQL Editor → New Query
-- Copy and paste the contents of create_leaderboard_view.sql
-- The script includes DROP VIEW IF EXISTS to safely recreate the view
```

Or use the provided `create_leaderboard_view.sql` file which includes:
- Drop and recreate logic
- Model and base model ID references
- Base model accuracy for improvement calculations
- All necessary permissions

The view structure includes:
- `id` - Unique identifier
- `model_id` - Model UUID
- `model_name` - Model name
- `base_model_id` - Base model UUID (NULL if no base model)
- `base_model_name` - Base model name ('None' if no base model)
- `agent_id` - Agent UUID
- `agent_name` - Agent name
- `benchmark_id` - Benchmark UUID
- `benchmark_name` - Benchmark name
- `accuracy` - Accuracy percentage (0-100)
- `standard_error` - Standard error percentage
- `base_model_accuracy` - Base model accuracy for improvement calculation (NULL if unavailable)
- `hf_traces_link` - HuggingFace traces URL

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

### "cannot change name of view column" when updating view
- This error occurs when trying to modify an existing view's column structure
- **Solution**: The `create_leaderboard_view.sql` already includes `DROP VIEW IF EXISTS leaderboard_results CASCADE;`
- Simply run the entire script - it will safely drop and recreate the view
- All dependent views/functions will also be dropped (CASCADE option)

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

## Recent Updates (November 2025)

### Model Improvement Metrics Feature (Nov 18)
- 📈 **Improvement Display** - Shows accuracy improvement relative to base models
  - Calculates as absolute difference in percentage points (pp)
  - Color-coded: Green for positive, Red for negative improvement
  - Shows baseline base model accuracy for context
- 📊 **Base Model Column** - New column displays which model each entry was trained from
- 🔄 **Flexible Viewing** - Toggle between standard leaderboard and improvement-enhanced view
- 🎯 **Smart Sorting** - Per-benchmark sort toggle: sort by accuracy OR improvement
  - Each benchmark column has independent sort mode
  - Acc/Imp buttons below benchmark name to toggle
- 🔍 **Extended Search** - Search and filter by base model name
- ⚙️ **Dual API Endpoints**:
  - `/api/leaderboard-pivoted` - Standard leaderboard (backward compatible)
  - `/api/leaderboard-pivoted-with-improvement` - Enhanced with improvement metrics

### UI/UX Enhancements (Nov 17)
- ✨ **Frozen Model Column** - Model Name column stays visible when scrolling horizontally
- 📜 **Dual Horizontal Scrollbars** - Synchronized scrollbars at top and bottom for easy navigation
- ⚠️ **Visual Link Indicators** - Color-coded icons showing trace availability:
  - 🔵 Blue: Traces available
  - ⚪ Grey: Traces unavailable
  - 🔴 Red: Traces missing (for `dev_set_71_tasks` benchmark)
- 📖 **Icon Legend** - Visual guide explaining what each icon means
- 🔧 **Improved Search Layout** - Fixed search bar that maintains alignment when typing

### Data Changes
- 📊 **Aggregation Strategy** - Changed from showing latest to earliest valid evaluation per (model, agent, benchmark)
  - Allows tracking of initial model performance
  - Consistent evaluation baseline for comparisons

## Documentation

- **Setup Guide** - `SUPABASE_SETUP.md` - Detailed Supabase integration guide
- **Progress Log** - `PROGRESS.md` - Comprehensive development progress and changelog
- **View SQL** - `create_leaderboard_view.sql` - Database view definition
- **Project Context** - `CLAUDE.md` - Architecture and development guidelines

## License

MIT
