# LLM Agent Benchmark Leaderboard

## Overview

This is a data-focused web application for displaying and comparing LLM agent benchmark results. The system presents a leaderboard interface where users can search, filter, and sort benchmark performance data across different models, agents, and benchmark types. The application emphasizes clarity, scannability, and efficient data interaction with a professional, research-appropriate aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and dev server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Shadcn/ui component library (New York style variant)
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Data-centric Material Design approach prioritizing information density
- Dark mode primary with light mode support
- Custom color palette focused on readability and data visualization
- Inter font for UI, JetBrains Mono for metrics/numbers
- Responsive layout with mobile-first considerations

**State Management:**
- React Query for async server state with infinite stale time (data doesn't auto-refresh)
- Local component state via React hooks
- Search and filter state managed at page level

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js
- TypeScript for type consistency across frontend and backend
- Custom middleware for request logging and error handling

**API Design:**
- RESTful endpoints under `/api` prefix
- CRUD operations for benchmark results
- JSON request/response format
- Zod schema validation for incoming data

**Development Environment:**
- Vite middleware integration in development mode
- Hot Module Replacement (HMR) for fast feedback
- Custom error overlay plugin for runtime errors
- Replit-specific dev tools integration

**Build & Deployment:**
- Vite builds frontend to `dist/public`
- esbuild bundles server code to `dist/index.js`
- ESM module format throughout
- Production mode serves static assets from Express

### Data Storage

**Database:**
- PostgreSQL (via Neon serverless database driver)
- Drizzle ORM for type-safe database queries
- Schema-first approach with Drizzle Zod integration

**Schema Design:**
- Single `benchmark_results` table stores all benchmark data
- Fields: id (UUID), modelName, agentName, benchmarkName, accuracy, standardError
- No relationships - flat denormalized structure for read optimization

**Data Access Pattern:**
- Repository pattern via `DbStorage` class implementing `IStorage` interface
- All queries return full result sets (no pagination implemented)
- Soft abstraction allows future storage backend changes

### External Dependencies

**Third-Party UI Libraries:**
- Radix UI suite (~20 component primitives) for accessibility
- Lucide React for icons
- Embla Carousel for carousel functionality
- CMDK for command palette pattern
- React Hook Form with Zod resolvers for form validation
- React Day Picker for date selection
- Recharts for potential data visualization

**Database & ORM:**
- @neondatabase/serverless - Serverless PostgreSQL driver
- Drizzle ORM - Type-safe SQL query builder
- Drizzle Kit - Schema management and migrations
- postgres (node-postgres) - PostgreSQL client

**Development Tools:**
- Replit vite plugins for error handling, cartography, and dev banner
- TypeScript for static typing
- ESLint/Prettier implied by project structure

**Styling:**
- Tailwind CSS with PostCSS
- Autoprefixer for browser compatibility
- clsx and tailwind-merge for conditional class handling

**Build Tools:**
- Vite for frontend bundling and dev server
- esbuild for server-side bundling
- tsx for TypeScript execution in development

**Notable Architectural Decisions:**
- No authentication/authorization system implemented
- No real-time updates - data fetched on mount with manual refresh
- Client and server share schema definitions via shared directory
- Path aliases configured for clean imports (@/, @shared/, @db)
- SSL connections to database required in production, preferred in development