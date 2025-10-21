import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FilterControlsProps {
  availableModels: string[];
  availableAgents: string[];
  availableBenchmarks: string[];
  selectedModels: string[];
  selectedAgents: string[];
  selectedBenchmarks: string[];
  onModelsChange: (models: string[]) => void;
  onAgentsChange: (agents: string[]) => void;
  onBenchmarksChange: (benchmarks: string[]) => void;
  onClearAll: () => void;
}

export default function FilterControls({
  availableModels,
  availableAgents,
  availableBenchmarks,
  selectedModels,
  selectedAgents,
  selectedBenchmarks,
  onModelsChange,
  onAgentsChange,
  onBenchmarksChange,
  onClearAll,
}: FilterControlsProps) {
  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      onModelsChange(selectedModels.filter((m) => m !== model));
    } else {
      onModelsChange([...selectedModels, model]);
    }
  };

  const toggleAgent = (agent: string) => {
    if (selectedAgents.includes(agent)) {
      onAgentsChange(selectedAgents.filter((a) => a !== agent));
    } else {
      onAgentsChange([...selectedAgents, agent]);
    }
  };

  const toggleBenchmark = (benchmark: string) => {
    if (selectedBenchmarks.includes(benchmark)) {
      onBenchmarksChange(selectedBenchmarks.filter((b) => b !== benchmark));
    } else {
      onBenchmarksChange([...selectedBenchmarks, benchmark]);
    }
  };

  const totalFilters = selectedModels.length + selectedAgents.length + selectedBenchmarks.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-filter-models">
              <Filter className="w-4 h-4 mr-2" />
              Models
              {selectedModels.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                  {selectedModels.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Filter by Model</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableModels.map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <Checkbox
                      id={`model-${model}`}
                      checked={selectedModels.includes(model)}
                      onCheckedChange={() => toggleModel(model)}
                      data-testid={`checkbox-model-${model}`}
                    />
                    <Label
                      htmlFor={`model-${model}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {model}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-filter-agents">
              <Filter className="w-4 h-4 mr-2" />
              Agents
              {selectedAgents.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                  {selectedAgents.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Filter by Agent</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableAgents.map((agent) => (
                  <div key={agent} className="flex items-center gap-2">
                    <Checkbox
                      id={`agent-${agent}`}
                      checked={selectedAgents.includes(agent)}
                      onCheckedChange={() => toggleAgent(agent)}
                      data-testid={`checkbox-agent-${agent}`}
                    />
                    <Label
                      htmlFor={`agent-${agent}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {agent}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-filter-benchmarks">
              <Filter className="w-4 h-4 mr-2" />
              Benchmark Columns
              {selectedBenchmarks.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                  {selectedBenchmarks.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Show Benchmark Columns</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableBenchmarks.map((benchmark) => (
                  <div key={benchmark} className="flex items-center gap-2">
                    <Checkbox
                      id={`benchmark-${benchmark}`}
                      checked={selectedBenchmarks.includes(benchmark)}
                      onCheckedChange={() => toggleBenchmark(benchmark)}
                      data-testid={`checkbox-benchmark-${benchmark}`}
                    />
                    <Label
                      htmlFor={`benchmark-${benchmark}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {benchmark}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            data-testid="button-clear-filters"
          >
            Clear All
          </Button>
        )}
      </div>

      {totalFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedModels.map((model) => (
            <Badge key={model} variant="secondary" className="gap-1" data-testid={`badge-filter-${model}`}>
              {model}
              <button
                onClick={() => toggleModel(model)}
                className="hover-elevate active-elevate-2 rounded-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedAgents.map((agent) => (
            <Badge key={agent} variant="secondary" className="gap-1" data-testid={`badge-filter-${agent}`}>
              {agent}
              <button
                onClick={() => toggleAgent(agent)}
                className="hover-elevate active-elevate-2 rounded-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedBenchmarks.map((benchmark) => (
            <Badge key={benchmark} variant="secondary" className="gap-1" data-testid={`badge-filter-${benchmark}`}>
              {benchmark}
              <button
                onClick={() => toggleBenchmark(benchmark)}
                className="hover-elevate active-elevate-2 rounded-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
