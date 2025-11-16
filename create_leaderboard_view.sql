-- Create leaderboard_results view for the leaderboard application
-- Run this in Supabase SQL Editor: Project → SQL Editor → New Query

-- This view aggregates evaluation results from sandbox_jobs
-- It deduplicates by (agent, model, benchmark) keeping the earliest valid job
-- Parses accuracy and accuracy_stderr from the metrics JSONB array

CREATE OR REPLACE VIEW leaderboard_results AS
SELECT DISTINCT ON (a.name, m.name, b.name)
  gen_random_uuid()::text as id,
  m.name as model_name,
  a.name as agent_name,
  b.name as benchmark_name,
  (
    SELECT (elem->>'value')::float * 100
    FROM jsonb_array_elements(sj.metrics) elem
    WHERE elem->>'name' = 'accuracy'
    LIMIT 1
  ) as accuracy,
  (
    SELECT (elem->>'value')::float * 100
    FROM jsonb_array_elements(sj.metrics) elem
    WHERE elem->>'name' = 'accuracy_stderr'
    LIMIT 1
  ) as standard_error,
  sj.hf_traces_link as hf_traces_link
FROM sandbox_jobs sj
INNER JOIN agents a ON sj.agent_id = a.id
INNER JOIN models m ON sj.model_id = m.id
INNER JOIN benchmarks b ON sj.benchmark_id = b.id
WHERE sj.metrics IS NOT NULL
ORDER BY a.name, m.name, b.name,
         COALESCE(sj.ended_at, sj.created_at) ASC;

-- Grant read access to the view
-- Adjust the role name based on your Supabase setup
GRANT SELECT ON leaderboard_results TO anon, authenticated;

-- Verify the view was created successfully
SELECT COUNT(*) as total_entries FROM leaderboard_results;
