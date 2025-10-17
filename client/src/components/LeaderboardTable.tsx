import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface BenchmarkResult {
  id: string;
  modelName: string;
  agentName: string;
  benchmarkName: string;
  accuracy: number;
  standardError: number;
}

interface LeaderboardTableProps {
  data: BenchmarkResult[];
  modelSearch: string;
  agentSearch: string;
  benchmarkSearch: string;
  filters: {
    models: string[];
    agents: string[];
    benchmarks: string[];
  };
}

type SortField = 'modelName' | 'agentName' | 'benchmarkName' | 'accuracy' | 'standardError';
type SortDirection = 'asc' | 'desc' | null;

export default function LeaderboardTable({ 
  data, 
  modelSearch, 
  agentSearch, 
  benchmarkSearch, 
  filters 
}: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<SortField>('accuracy');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    if (modelSearch) {
      const query = modelSearch.toLowerCase();
      filtered = filtered.filter((item) => item.modelName.toLowerCase().includes(query));
    }

    if (agentSearch) {
      const query = agentSearch.toLowerCase();
      filtered = filtered.filter((item) => item.agentName.toLowerCase().includes(query));
    }

    if (benchmarkSearch) {
      const query = benchmarkSearch.toLowerCase();
      filtered = filtered.filter((item) => item.benchmarkName.toLowerCase().includes(query));
    }

    if (filters.models.length > 0) {
      filtered = filtered.filter((item) => filters.models.includes(item.modelName));
    }
    if (filters.agents.length > 0) {
      filtered = filtered.filter((item) => filters.agents.includes(item.agentName));
    }
    if (filters.benchmarks.length > 0) {
      filtered = filtered.filter((item) => filters.benchmarks.includes(item.benchmarkName));
    }

    if (sortDirection && sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
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
  }, [data, modelSearch, agentSearch, benchmarkSearch, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('accuracy');
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

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr className="border-b border-border">
              <th className="text-left px-6 py-4 w-[20%]">
                <button
                  onClick={() => handleSort('modelName')}
                  className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                  data-testid="button-sort-model"
                >
                  Model Name
                  <SortIcon field="modelName" />
                </button>
              </th>
              <th className="text-left px-6 py-4 w-[20%]">
                <button
                  onClick={() => handleSort('agentName')}
                  className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                  data-testid="button-sort-agent"
                >
                  Agent Name
                  <SortIcon field="agentName" />
                </button>
              </th>
              <th className="text-left px-6 py-4 w-[25%]">
                <button
                  onClick={() => handleSort('benchmarkName')}
                  className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                  data-testid="button-sort-benchmark"
                >
                  Benchmark Name
                  <SortIcon field="benchmarkName" />
                </button>
              </th>
              <th className="text-right px-6 py-4 w-[20%]">
                <button
                  onClick={() => handleSort('accuracy')}
                  className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide ml-auto hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                  data-testid="button-sort-accuracy"
                >
                  Accuracy
                  <SortIcon field="accuracy" />
                </button>
              </th>
              <th className="text-right px-6 py-4 w-[15%]">
                <button
                  onClick={() => handleSort('standardError')}
                  className="flex items-center gap-2 font-medium text-sm uppercase tracking-wide ml-auto hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md"
                  data-testid="button-sort-error"
                >
                  Std Error
                  <SortIcon field="standardError" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No results found
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-border hover-elevate ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                  data-testid={`row-result-${row.id}`}
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">{row.modelName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground">{row.agentName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="font-medium">
                      {row.benchmarkName}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono font-semibold ${getAccuracyColor(row.accuracy)}`}>
                      {row.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-muted-foreground">
                      ±{row.standardError.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
