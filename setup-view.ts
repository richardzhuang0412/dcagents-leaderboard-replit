import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupView() {
  console.log('Setting up leaderboard_results view...');

  // Read the SQL file
  const sql = fs.readFileSync('create_leaderboard_view.sql', 'utf-8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const statement of statements) {
    if (!statement) continue;

    console.log(`Executing: ${statement.substring(0, 50)}...`);

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: statement
    });

    if (error) {
      // Try direct query for views and grants
      const { data: data2, error: error2 } = await supabase
        .from('_http')
        .select('*');

      if (error2) {
        console.error('Error executing statement:', error.message);
        console.error('This may require running the SQL manually in Supabase SQL Editor');
      }
    } else {
      console.log('Success!');
    }
  }

  // Test the view
  console.log('\nTesting view...');
  const { data, error } = await supabase
    .from('leaderboard_results')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error querying view:', error.message);
    console.error('\nPlease run the SQL manually in Supabase SQL Editor:');
    console.error('1. Go to https://supabase.com/dashboard');
    console.error('2. Select your project');
    console.error('3. Go to SQL Editor → New Query');
    console.error('4. Copy and paste the contents of create_leaderboard_view.sql');
    console.error('5. Click Run');
    process.exit(1);
  } else {
    console.log('View created successfully!');
    if (data && data.length > 0) {
      console.log('Sample row:', data[0]);
    } else {
      console.log('View is empty (no evaluation results yet)');
    }
  }
}

setupView().catch(console.error);
