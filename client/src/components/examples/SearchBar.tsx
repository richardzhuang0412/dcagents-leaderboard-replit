import { useState } from 'react';
import SearchBar from '../SearchBar';

export default function SearchBarExample() {
  const [modelSearch, setModelSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [benchmarkSearch, setBenchmarkSearch] = useState('');

  return (
    <div className="p-6 bg-background">
      <SearchBar 
        modelSearch={modelSearch}
        agentSearch={agentSearch}
        benchmarkSearch={benchmarkSearch}
        onModelSearchChange={setModelSearch}
        onAgentSearchChange={setAgentSearch}
        onBenchmarkSearchChange={setBenchmarkSearch}
      />
    </div>
  );
}
