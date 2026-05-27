const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const { Client } = require('pg');

// Use environment variables - set these before running
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const ORG = process.env.SUPABASE_ORG_ID || '';
const PASS = process.env.SUPABASE_DB_PASSWORD || '';

async function run() {
  console.log("Creating project gestion_epst_v3...");
  const createOutput = execSync(`npx supabase projects create gestion_epst_v3 --org-id ${ORG} --db-password ${PASS} --region eu-central-1`, {
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: TOKEN },
    encoding: 'utf8'
  });
  console.log(createOutput);
  
  const refMatch = createOutput.match(/project\/([a-z0-9]{20})/);
  if (!refMatch) throw new Error("Could not find project ref");
  const ref = refMatch[1];
  console.log("Project created. Ref:", ref);
  
  const fetchKeys = () => new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'api.supabase.com', path: `/v1/projects/${ref}/api-keys`, headers: { 'Authorization': `Bearer ${TOKEN}` } }, res => {
      let body = ''; res.on('data', d => body += d); res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.end();
  });
  
  console.log("Fetching API keys...");
  let keys;
  for(let i=0; i<10; i++) {
    keys = await fetchKeys();
    if(keys && keys.length > 0) break;
    console.log("Waiting for keys...");
    await new Promise(r => setTimeout(r, 5000));
  }
  
  if (keys && keys.length > 0) {
    const anonKey = keys.find(k => k.name === 'anon').api_key;
    let env = fs.readFileSync('.env.local', 'utf8');
    env = env.replace(/NEXT_PUBLIC_SUPABASE_URL=.*/, `NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`);
    env = env.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`);
    fs.writeFileSync('.env.local', env);
    console.log("Updated .env.local!");
  }
  
  console.log("Connecting to DB to create tables...");
  const sql = fs.readFileSync('supabase/migrations/20260520000000_initial_schema.sql', 'utf8');
  let success = false;
  for(let i=0; i<15; i++) {
    try {
      const client = new Client({ connectionString: `postgresql://postgres:${PASS}@db.${ref}.supabase.co:5432/postgres`, connectionTimeoutMillis: 5000 });
      await client.connect();
      await client.query(sql);
      await client.end();
      success = true;
      break;
    } catch(e) {
      console.log("DB not ready, retrying...", e.message);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  if(success) console.log("SUCCESS! Tables created.");
  else console.log("FAILED to create tables.");
}
run();
