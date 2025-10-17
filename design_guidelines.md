# Design Guidelines: LLM Agent Benchmark Leaderboard

## Design Approach: Data-Focused System Design

**Selected Approach:** Design System (Material Design / Data-Centric)
**Rationale:** This is a utility-focused, information-dense application where clarity, scannability, and efficient data interaction are paramount. Users need to quickly compare benchmarks, not be impressed by visual flair.

**Core Principles:**
- Data clarity above all - every design decision serves readability
- Efficient information density without clutter
- Professional, trustworthy aesthetic fitting research/technical context
- Frictionless interaction with search, filter, and sort controls

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: `222 15% 12%` (deep slate)
- Surface/Cards: `222 15% 16%` (elevated slate)
- Borders: `222 10% 25%` (subtle dividers)
- Primary Text: `220 10% 90%` (high contrast white)
- Secondary Text: `220 8% 65%` (muted gray)
- Accent/Interactive: `210 100% 58%` (bright blue for links, active states)
- Success (high accuracy): `142 70% 45%` (green)
- Warning (low accuracy): `38 92% 50%` (amber)

**Light Mode:**
- Background: `0 0% 98%`
- Surface: `0 0% 100%`
- Borders: `220 13% 91%`
- Primary Text: `222 47% 11%`
- Accent: `210 100% 48%`

### B. Typography

**Font Stack:**
- Primary: Inter (via Google Fonts CDN) - excellent for data tables
- Monospace: JetBrains Mono (for accuracy numbers/metrics)

**Hierarchy:**
- Page Title: text-3xl font-bold (30px)
- Section Headers: text-xl font-semibold (20px)
- Table Headers: text-sm font-medium uppercase tracking-wide
- Body/Data: text-base (16px regular)
- Metrics/Numbers: text-sm font-mono (monospaced for alignment)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4, p-6
- Section gaps: gap-8, gap-12
- Table cell padding: px-6 py-4
- Form spacing: space-y-4

**Container:**
- Max width: max-w-7xl mx-auto
- Page padding: px-4 sm:px-6 lg:px-8
- Full-width table container with horizontal scroll on mobile

### D. Component Library

#### 1. **Page Header**
- Sticky header (sticky top-0) with backdrop blur
- Contains: Page title, total entries count badge, refresh data button
- Clean separation from content with subtle border-b

#### 2. **Filter & Search Controls**
- Horizontal filter bar above table
- Global search input (w-full md:w-96) with search icon
- Column-specific dropdowns for Model, Agent, Benchmark filters
- "Clear All Filters" button when filters active
- Pills showing active filters with × dismiss icons

#### 3. **Data Table (Core Component)**
- Sticky header row for scrolling
- Alternating row backgrounds for scannability (subtle zebra striping)
- Hover state on rows (slight background lift)
- Sortable column headers with up/down arrow indicators
- Column widths: Model (20%), Agent (20%), Benchmark (25%), Accuracy (20%), Std Error (15%)
- Right-align numerical columns (Accuracy, Std Error)
- Monospace font for metrics

**Column Features:**
- Model Name: Bold text with subtle badge for model family
- Agent Name: Regular weight with muted color
- Benchmark: Medium weight, potentially with tooltip for full name
- Accuracy: Color-coded (green >90%, amber 70-90%, neutral <70%) with percentage
- Std Error: Monospace, ± prefix, muted color

#### 4. **Empty & Loading States**
- Loading skeleton with shimmer effect
- Empty state illustration with "No results found" message
- Error state with retry action

#### 5. **Pagination**
- Bottom-aligned pagination controls
- Show "Showing X-Y of Z entries"
- Page size selector: 10, 25, 50, 100 rows
- Previous/Next buttons + page numbers

#### 6. **Interactive Elements**
- Sort buttons: Transparent with icon, active state shows accent color
- Filter dropdowns: Clean dropdowns with checkboxes for multi-select
- Search input: Icon inside, clear × button when populated
- All buttons use consistent hover/focus states (scale-105 transform, accent ring)

### E. Iconography
Use **Heroicons** (via CDN) for all interface icons:
- Search: MagnifyingGlassIcon
- Sort: ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon  
- Filter: FunnelIcon
- Refresh: ArrowPathIcon
- Close: XMarkIcon

### F. Data Visualization Enhancements
- Micro bar charts inline for accuracy (subtle background fill in cell)
- Rank badges for top 3 performers (gold/silver/bronze subtle indicators)
- Trend indicators if historical data available (up/down arrows)

---

## Layout Structure

1. **Header Section** (h-16)
   - Logo/Title on left
   - Total entries count badge
   - Refresh button on right

2. **Filter Bar** (py-6 border-b)
   - Global search prominent on left
   - Filter dropdowns in row (Model, Agent, Benchmark)
   - Active filter pills below

3. **Table Section** (flex-1)
   - Responsive table container
   - Sticky header during scroll
   - Minimum 10 visible rows before pagination

4. **Footer Controls** (py-4 border-t)
   - Pagination left-aligned
   - Rows per page selector right-aligned

---

## Responsive Behavior

- **Desktop (lg+):** Full table, all filters visible
- **Tablet (md):** Horizontal scroll table, stacked filters
- **Mobile (sm):** Card-based view instead of table (each entry as expandable card showing all 5 fields)

---

## Interaction Patterns

- **Sort:** Click column header toggles asc/desc, visual arrow indicator
- **Filter:** Multi-select dropdowns persist until cleared
- **Search:** Debounced search (300ms) across all columns
- **Data Refresh:** Manual refresh button, show "Updated X seconds ago" timestamp

---

## Performance Considerations

- Virtual scrolling for 1000+ rows (use react-window if needed)
- Optimistic UI updates during sorting/filtering
- Loading skeletons maintain layout to prevent shift