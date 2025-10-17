import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/SearchBar';
import FilterControls from '@/components/FilterControls';
import LeaderboardTable, { type BenchmarkResult } from '@/components/LeaderboardTable';
import ThemeToggle from '@/components/ThemeToggle';
import { queryClient } from '@/lib/queryClient';

export default function Leaderboard() {
  const [modelSearch, setModelSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [benchmarkSearch, setBenchmarkSearch] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  
  const { data: benchmarkData = [], isLoading, refetch } = useQuery<BenchmarkResult[]>({
    queryKey: ['/api/benchmark-results'],
  });

  const handleRefresh = () => {
    refetch();
  };

  const availableModels = useMemo(() => {
    return Array.from(new Set(benchmarkData.map((item) => item.modelName))).sort();
  }, [benchmarkData]);

  const availableAgents = useMemo(() => {
    return Array.from(new Set(benchmarkData.map((item) => item.agentName))).sort();
  }, [benchmarkData]);

  const availableBenchmarks = useMemo(() => {
    return Array.from(new Set(benchmarkData.map((item) => item.benchmarkName))).sort();
  }, [benchmarkData]);

  const handleClearFilters = () => {
    setSelectedModels([]);
    setSelectedAgents([]);
    setSelectedBenchmarks([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading benchmark results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                LLM Agent Benchmark
              </h1>
              <Badge variant="secondary" data-testid="text-total-entries">
                {benchmarkData.length} entries
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <SearchBar
            modelSearch={modelSearch}
            agentSearch={agentSearch}
            benchmarkSearch={benchmarkSearch}
            onModelSearchChange={setModelSearch}
            onAgentSearchChange={setAgentSearch}
            onBenchmarkSearchChange={setBenchmarkSearch}
          />

          <FilterControls
            availableModels={availableModels}
            availableAgents={availableAgents}
            availableBenchmarks={availableBenchmarks}
            selectedModels={selectedModels}
            selectedAgents={selectedAgents}
            selectedBenchmarks={selectedBenchmarks}
            onModelsChange={setSelectedModels}
            onAgentsChange={setSelectedAgents}
            onBenchmarksChange={setSelectedBenchmarks}
            onClearAll={handleClearFilters}
          />

          <LeaderboardTable
            data={benchmarkData}
            modelSearch={modelSearch}
            agentSearch={agentSearch}
            benchmarkSearch={benchmarkSearch}
            filters={{
              models: selectedModels,
              agents: selectedAgents,
              benchmarks: selectedBenchmarks,
            }}
          />
        </div>
      </main>
    </div>
  );
}
