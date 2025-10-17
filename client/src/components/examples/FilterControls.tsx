import { useState } from 'react';
import FilterControls from '../FilterControls';

const mockModels = ['GPT-4', 'GPT-3.5', 'Claude 3', 'Llama 3'];
const mockAgents = ['AutoGPT', 'ReAct', 'LangChain', 'AgentGPT', 'BabyAGI'];
const mockBenchmarks = ['WebShop', 'HumanEval', 'MMLU', 'GSM8K'];

export default function FilterControlsExample() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);

  const handleClearAll = () => {
    setSelectedModels([]);
    setSelectedAgents([]);
    setSelectedBenchmarks([]);
  };

  return (
    <div className="p-6 bg-background">
      <FilterControls
        availableModels={mockModels}
        availableAgents={mockAgents}
        availableBenchmarks={mockBenchmarks}
        selectedModels={selectedModels}
        selectedAgents={selectedAgents}
        selectedBenchmarks={selectedBenchmarks}
        onModelsChange={setSelectedModels}
        onAgentsChange={setSelectedAgents}
        onBenchmarksChange={setSelectedBenchmarks}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
