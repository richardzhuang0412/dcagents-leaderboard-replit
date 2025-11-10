import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface BenchmarkResult {
  id: string;
  modelName: string;
  agentName: string;
  benchmarkName: string;
  accuracy: number;
  standardError: number;
}

export interface PivotedLeaderboardRow {
  modelName: string;
  agentName: string;
  benchmarks: Record<string, { accuracy: number; standardError: number; hfTracesLink?: string }>;
}

interface LeaderboardTableProps {
  data: PivotedLeaderboardRow[];
  modelSearch: string;
  agentSearch: string;
  benchmarkSearch: string;
  filters: {
    models: string[];
    agents: string[];
    benchmarks: string[];
  };
}

type SortField = 'modelName' | 'agentName' | string; // string for dynamic benchmark names
type SortDirection = 'asc' | 'desc' | null;

export default function LeaderboardTable({
  data,
  modelSearch,
  agentSearch,
  benchmarkSearch,
  filters
}: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<SortField>('modelName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get all unique benchmark names from the data
  const allBenchmarks = useMemo(() => {
    const benchmarkSet = new Set<string>();
    data.forEach(row => {
      Object.keys(row.benchmarks).forEach(benchmark => benchmarkSet.add(benchmark));
    });
    return Array.from(benchmarkSet).sort();
  }, [data]);

  // Filter which benchmark columns to show based on search and filters
  const visibleBenchmarks = useMemo(() => {
    let visible = allBenchmarks;

    // Filter by benchmark search
    if (benchmarkSearch) {
      const query = benchmarkSearch.toLowerCase();
      visible = visible.filter(benchmark => benchmark.toLowerCase().includes(query));
    }

    // Filter by benchmark filters (if any selected, show only those)
    if (filters.benchmarks.length > 0) {
      visible = visible.filter(benchmark => filters.benchmarks.includes(benchmark));
    }

    return visible;
  }, [allBenchmarks, benchmarkSearch, filters.benchmarks]);

  // Filter and sort the data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Filter by model search
    if (modelSearch) {
      const query = modelSearch.toLowerCase();
      filtered = filtered.filter(row => row.modelName.toLowerCase().includes(query));
    }

    // Filter by agent search
    if (agentSearch) {
      const query = agentSearch.toLowerCase();
      filtered = filtered.filter(row => row.agentName.toLowerCase().includes(query));
    }

    // Filter by model filters
    if (filters.models.length > 0) {
      filtered = filtered.filter(row => filters.models.includes(row.modelName));
    }

    // Filter by agent filters
    if (filters.agents.length > 0) {
      filtered = filtered.filter(row => filters.agents.includes(row.agentName));
    }

    // Sort the data
    if (sortDirection && sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number | undefined;
        let bVal: string | number | undefined;

        if (sortField === 'modelName') {
          aVal = a.modelName;
          bVal = b.modelName;
        } else if (sortField === 'agentName') {
          aVal = a.agentName;
          bVal = b.agentName;
        } else {
          // Sorting by a benchmark column
          aVal = a.benchmarks[sortField]?.accuracy;
          bVal = b.benchmarks[sortField]?.accuracy;
        }

        // Handle undefined values (missing benchmark data)
        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return filtered;
  }, [data, modelSearch, agentSearch, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('modelName');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-primary" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 text-primary" />;
    }
    return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-chart-2';
    if (accuracy >= 70) return 'text-chart-3';
    return 'text-foreground';
  };

  const formatBenchmarkCell = (benchmarkData?: { accuracy: number; standardError: number; hfTracesLink?: string }) => {
    if (!benchmarkData) {
      return <span className="text-muted-foreground text-sm">—</span>;
    }

    return (
      <div className="flex items-center gap-2 justify-end">
        {benchmarkData.hfTracesLink ? (
          <a
            href={benchmarkData.hfTracesLink}
            target="_blank"
            rel="noopener noreferrer"
            title="View traces"
            className="inline-flex items-center justify-center w-5 h-5 rounded border-2 border-primary bg-primary/10 hover:bg-primary/20 hover:border-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
          </a>
        ) : (
          <div
            title="Traces link not available"
            className="inline-flex items-center justify-center w-5 h-5 rounded border border-muted-foreground/20 bg-muted/50 cursor-not-allowed"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40" />
          </div>
        )}
        <div className="flex flex-col items-end gap-0.5">
          <span className={`font-mono font-semibold ${getAccuracyColor(benchmarkData.accuracy)}`}>
            {benchmarkData.accuracy.toFixed(1)}%
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            ±{benchmarkData.standardError.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  const totalColumns = 2 + visibleBenchmarks.length; // model + agent + benchmark columns

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr className="border-b border-border">
              <th className="text-left px-6 py-4 min-w-[200px]">
                <button
                  onClick={() => handleSort('modelName')}
                  className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                  data-testid="button-sort-model"
                >
                  Model Name
                  <SortIcon field="modelName" />
                </button>
              </th>
              <th className="text-left px-6 py-4 min-w-[200px]">
                <button
                  onClick={() => handleSort('agentName')}
                  className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                  data-testid="button-sort-agent"
                >
                  Agent Name
                  <SortIcon field="agentName" />
                </button>
              </th>
              {visibleBenchmarks.map(benchmark => (
                <th key={benchmark} className="text-right px-6 py-4 min-w-[150px]">
                  <button
                    onClick={() => handleSort(benchmark)}
                    className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide ml-auto hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                    data-testid={`button-sort-${benchmark}`}
                  >
                    {benchmark}
                    <SortIcon field={benchmark} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={totalColumns} className="px-6 py-12 text-center text-muted-foreground">
                  No results found
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row, index) => (
                <tr
                  key={`${row.modelName}-${row.agentName}`}
                  className={`border-b border-border hover-elevate ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                  data-testid={`row-result-${row.modelName}-${row.agentName}`}
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">{row.modelName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground">{row.agentName}</span>
                  </td>
                  {visibleBenchmarks.map(benchmark => (
                    <td key={benchmark} className="px-6 py-4 text-right">
                      {formatBenchmarkCell(row.benchmarks[benchmark])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
