import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  modelSearch: string;
  agentSearch: string;
  benchmarkSearch: string;
  onModelSearchChange: (value: string) => void;
  onAgentSearchChange: (value: string) => void;
  onBenchmarkSearchChange: (value: string) => void;
}

export default function SearchBar({
  modelSearch,
  agentSearch,
  benchmarkSearch,
  onModelSearchChange,
  onAgentSearchChange,
  onBenchmarkSearchChange,
}: SearchBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={modelSearch}
            onChange={(e) => onModelSearchChange(e.target.value)}
            placeholder="Search models..."
            className="pl-9 pr-9"
            data-testid="input-search-model"
          />
        </div>
        {modelSearch && (
          <button
            onClick={() => onModelSearchChange('')}
            className="text-muted-foreground hover:text-foreground hover-elevate active-elevate-2 rounded-sm p-0.5 flex-shrink-0"
            data-testid="button-clear-model-search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={agentSearch}
            onChange={(e) => onAgentSearchChange(e.target.value)}
            placeholder="Search agents..."
            className="pl-9 pr-9"
            data-testid="input-search-agent"
          />
        </div>
        {agentSearch && (
          <button
            onClick={() => onAgentSearchChange('')}
            className="text-muted-foreground hover:text-foreground hover-elevate active-elevate-2 rounded-sm p-0.5 flex-shrink-0"
            data-testid="button-clear-agent-search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={benchmarkSearch}
            onChange={(e) => onBenchmarkSearchChange(e.target.value)}
            placeholder="Search benchmarks..."
            className="pl-9 pr-9"
            data-testid="input-search-benchmark"
          />
        </div>
        {benchmarkSearch && (
          <button
            onClick={() => onBenchmarkSearchChange('')}
            className="text-muted-foreground hover:text-foreground hover-elevate active-elevate-2 rounded-sm p-0.5 flex-shrink-0"
            data-testid="button-clear-benchmark-search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
