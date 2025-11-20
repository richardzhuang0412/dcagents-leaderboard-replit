import { useState, useMemo } from 'react';
import { RefreshCw, Info, ExternalLink, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LeaderboardTableWithImprovement, { type PivotedLeaderboardRowWithImprovement } from '@/components/LeaderboardTableWithImprovement';
import SearchBarWithBaseModel from '@/components/SearchBarWithBaseModel';
import FilterControlsWithBaseModel from '@/components/FilterControlsWithBaseModel';
import ThemeToggle from '@/components/ThemeToggle';

export default function Leaderboard() {
  const [modelSearch, setModelSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [baseModelSearch, setBaseModelSearch] = useState('');
  const [benchmarkSearch, setBenchmarkSearch] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedBaseModels, setSelectedBaseModels] = useState<string[]>([]);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);

  // Always fetch improvement metrics data
  const { data: pivotedData = [], isLoading, refetch } = useQuery<PivotedLeaderboardRowWithImprovement[]>({
    queryKey: ['/api/leaderboard-pivoted-with-improvement'],
  });

  const handleRefresh = () => {
    refetch();
  };

  const availableModels = useMemo(() => {
    return Array.from(new Set(pivotedData.map((item) => item.modelName))).sort();
  }, [pivotedData]);

  const availableAgents = useMemo(() => {
    return Array.from(new Set(pivotedData.map((item) => item.agentName))).sort();
  }, [pivotedData]);

  const availableBaseModels = useMemo(() => {
    return Array.from(new Set(
      pivotedData.map((item) => item.baseModelName)
    )).sort();
  }, [pivotedData]);

  const availableBenchmarks = useMemo(() => {
    const benchmarkSet = new Set<string>();
    pivotedData.forEach(row => {
      Object.keys(row.benchmarks).forEach(benchmark => benchmarkSet.add(benchmark));
    });
    return Array.from(benchmarkSet).sort();
  }, [pivotedData]);

  const handleClearFilters = () => {
    setSelectedModels([]);
    setSelectedAgents([]);
    setSelectedBaseModels([]);
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
                {pivotedData.length} rows
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
          {/* Search Bars */}
          <SearchBarWithBaseModel
            modelSearch={modelSearch}
            agentSearch={agentSearch}
            baseModelSearch={baseModelSearch}
            benchmarkSearch={benchmarkSearch}
            onModelSearchChange={setModelSearch}
            onAgentSearchChange={setAgentSearch}
            onBaseModelSearchChange={setBaseModelSearch}
            onBenchmarkSearchChange={setBenchmarkSearch}
          />

          {/* Filters */}
          <FilterControlsWithBaseModel
            availableModels={availableModels}
            availableAgents={availableAgents}
            availableBaseModels={availableBaseModels}
            availableBenchmarks={availableBenchmarks}
            selectedModels={selectedModels}
            selectedAgents={selectedAgents}
            selectedBaseModels={selectedBaseModels}
            selectedBenchmarks={selectedBenchmarks}
            onModelsChange={setSelectedModels}
            onAgentsChange={setSelectedAgents}
            onBaseModelsChange={setSelectedBaseModels}
            onBenchmarksChange={setSelectedBenchmarks}
            onClearAll={handleClearFilters}
          />

          <div className="space-y-3 px-3 py-3 bg-muted/30 rounded-md text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Standard error calculated over 3 runs</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-5 h-5 rounded border-2 border-primary bg-primary/10">
                  <ExternalLink className="w-3 h-3 text-primary" />
                </div>
                <span>Traces available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-5 h-5 rounded border border-muted-foreground/20 bg-muted/50">
                  <ExternalLink className="w-3 h-3 text-muted-foreground/40" />
                </div>
                <span>Traces unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-5 h-5 rounded border border-red-500/50 bg-red-500/10">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                </div>
                <span>Traces missing</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <LeaderboardTableWithImprovement
            data={pivotedData}
            modelSearch={modelSearch}
            agentSearch={agentSearch}
            baseModelSearch={baseModelSearch}
            benchmarkSearch={benchmarkSearch}
            filters={{
              models: selectedModels,
              agents: selectedAgents,
              baseModels: selectedBaseModels,
              benchmarks: selectedBenchmarks,
            }}
          />
        </div>
      </main>
    </div>
  );
}
