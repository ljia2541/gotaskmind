const { createClient } = require('@supabase/supabase-js');

// GoTaskMind - use URL + publishable key (anon)
const URL = 'https://hypxblhnvyednrruntdr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cHhibGhudnllZG5ycnVudGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTY2MDcsImV4cCI6MjA5MTgzMjYwN30.76wCNTt5G3fldjPWWfEYxZ4pwQmrbwo-l11cy1ACv8o';

// Also try service role key from the ANON_KEY env var (might be for a different project)
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHpqbnpycmN1dWZ6dG1iZWxsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjcwMDMzNSwiZXhwIjoyMDUyMjc2MzM1fQ.L_pMLM9kZGjJCKvT-oLh5CwMjfqbcM8C_jNMDUL_2Wk';

async function run() {
  // Try with anon key first
  const sb = createClient(URL, ANON_KEY);
  
  // List tables by trying common ones
  const tables = ['users', 'profiles', 'projects', 'tasks', 'subscriptions', 'payments', 'orders'];
  for (const t of tables) {
    const { data, error, count } = await sb.from(t).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log(`✅ ${t}: ${count} rows`);
    }
  }

  // Try to get users
  const { data: users, error: e1 } = await sb.from('users').select('*').limit(20);
  if (!e1 && users) {
    console.log(`\n=== GoTaskMind 用户 (${users.length}) ===`);
    for (const u of users) {
      console.log(`  ${u.email || u.id} | 创建: ${u.created_at?.slice(0,10)}`);
    }
  } else if (e1) {
    console.log('users error:', e1.message);
  }

  // Try profiles
  const { data: profiles, error: e2 } = await sb.from('profiles').select('*').limit(20);
  if (!e2 && profiles) {
    console.log(`\n=== GoTaskMind profiles (${profiles.length}) ===`);
    for (const p of profiles) {
      console.log(`  ${p.email || p.id} | 创建: ${p.created_at?.slice(0,10)} | 订阅: ${p.subscription_status || '-'}`);
    }
  } else if (e2) {
    console.log('profiles error:', e2.message);
  }

  // Try projects
  const { data: projects, error: e3 } = await sb.from('projects').select('*').limit(20);
  if (!e3 && projects) {
    console.log(`\n=== GoTaskMind 项目 (${projects.length}) ===`);
    for (const p of projects) {
      console.log(`  ${p.name || p.id} | 用户: ${p.user_id?.slice(0,12)}... | 创建: ${p.created_at?.slice(0,10)}`);
    }
  } else if (e3) {
    console.log('projects error:', e3.message);
  }
}

run().catch(console.error);
