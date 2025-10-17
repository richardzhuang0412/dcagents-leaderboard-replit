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

Single table: `benchmark_results`
- `id` (UUID primary key, auto-generated)
- `modelName` (text) - Name of the LLM model
- `agentName` (text) - Name of the agent framework
- `benchmarkName` (text) - Name of the benchmark test
- `accuracy` (double precision) - Benchmark accuracy score
- `standardError` (double precision) - Statistical error margin

Flat, denormalized structure optimized for read-heavy operations.

### API Endpoints

All under `/api` prefix:
- `GET /api/benchmark-results` - Fetch all results
- `GET /api/benchmark-results/:id` - Fetch single result
- `POST /api/benchmark-results` - Create new result (validated with Zod)
- `DELETE /api/benchmark-results/:id` - Delete result

### Frontend Components

Main page: `client/src/pages/Leaderboard.tsx`
- `SearchBar` - Separate search inputs for models, agents, and benchmarks
- `FilterControls` - Multi-select dropdowns for filtering by model/agent/benchmark
- `LeaderboardTable` - Sortable table with filtering and search functionality
- `ThemeToggle` - Dark/light mode switcher

UI components in `client/src/components/ui/` are from shadcn/ui (Radix UI + Tailwind CSS).

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

### Adding a New Benchmark Result (via API)

```bash
curl -X POST http://localhost:5000/api/benchmark-results \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "GPT-4",
    "agentName": "ReAct",
    "benchmarkName": "HumanEval",
    "accuracy": 0.892,
    "standardError": 0.012
  }'
```

### Modifying the Database Schema

1. Edit `shared/schema.ts` to add/modify tables or columns
2. Run `npm run db:push` to apply changes to the database
3. Drizzle will automatically update TypeScript types

### Adding New API Endpoints

1. Add route handler in `server/routes.ts`
2. Add corresponding storage method in `server/storage.ts` if database access needed
3. Client queries are auto-fetched by TanStack Query using the endpoint path as the query key

## Important Notes

- No authentication/authorization implemented
- No real-time updates - data refreshes manually only
- No pagination - all results fetched at once (consider adding for large datasets)
- Search and filtering happen client-side after fetching all data
