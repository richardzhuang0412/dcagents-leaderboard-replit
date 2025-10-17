import LeaderboardTable from '../LeaderboardTable';

const mockData = [
  { id: '1', modelName: 'GPT-4', agentName: 'AutoGPT', benchmarkName: 'WebShop', accuracy: 92.5, standardError: 1.2 },
  { id: '2', modelName: 'Claude 3', agentName: 'ReAct', benchmarkName: 'HumanEval', accuracy: 88.3, standardError: 0.8 },
  { id: '3', modelName: 'GPT-3.5', agentName: 'LangChain', benchmarkName: 'MMLU', accuracy: 76.4, standardError: 1.5 },
  { id: '4', modelName: 'Llama 3', agentName: 'AgentGPT', benchmarkName: 'WebShop', accuracy: 84.7, standardError: 1.1 },
  { id: '5', modelName: 'GPT-4', agentName: 'BabyAGI', benchmarkName: 'MMLU', accuracy: 95.2, standardError: 0.6 },
];

export default function LeaderboardTableExample() {
  return (
    <div className="p-6 bg-background">
      <LeaderboardTable 
        data={mockData} 
        modelSearch=""
        agentSearch=""
        benchmarkSearch=""
        filters={{ models: [], agents: [], benchmarks: [] }}
      />
    </div>
  );
}
