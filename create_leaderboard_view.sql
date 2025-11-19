-- Create leaderboard_results view for the leaderboard application
-- Run this in Supabase SQL Editor: Project → SQL Editor → New Query

-- This view aggregates evaluation results from sandbox_jobs
-- It deduplicates by (agent, model, benchmark) keeping the earliest valid job
-- Parses accuracy and accuracy_stderr from the metrics JSONB array
-- Includes base model information for improvement calculations

-- Drop existing view to recreate with new columns
DROP VIEW IF EXISTS leaderboard_results CASCADE;

CREATE VIEW leaderboard_results AS
SELECT DISTINCT ON (a.name, m.name, b.name)
  gen_random_uuid()::text as id,
  m.id as model_id,
  m.name as model_name,
  m.base_model_id,
  COALESCE(bm.name, 'None') as base_model_name,
  a.name as agent_name,
  a.id as agent_id,
  b.name as benchmark_name,
  b.id as benchmark_id,
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
  sj.hf_traces_link as hf_traces_link,
  -- Get base model accuracy for the same (agent, benchmark) combination
  (
    SELECT (elem->>'value')::float * 100
    FROM sandbox_jobs bsj
    INNER JOIN jsonb_array_elements(bsj.metrics) elem ON TRUE
    WHERE bsj.agent_id = sj.agent_id
      AND bsj.model_id = m.base_model_id
      AND bsj.benchmark_id = sj.benchmark_id
      AND elem->>'name' = 'accuracy'
      AND bsj.metrics IS NOT NULL
    ORDER BY COALESCE(bsj.ended_at, bsj.created_at) ASC
    LIMIT 1
  ) as base_model_accuracy
FROM sandbox_jobs sj
INNER JOIN agents a ON sj.agent_id = a.id
INNER JOIN models m ON sj.model_id = m.id
INNER JOIN benchmarks b ON sj.benchmark_id = b.id
LEFT JOIN models bm ON m.base_model_id = bm.id
WHERE sj.metrics IS NOT NULL
ORDER BY a.name, m.name, b.name,
         COALESCE(sj.ended_at, sj.created_at) ASC;

-- Grant read access to the view
-- Adjust the role name based on your Supabase setup
GRANT SELECT ON leaderboard_results TO anon, authenticated;

-- Verify the view was created successfully
SELECT COUNT(*) as total_entries FROM leaderboard_results;
