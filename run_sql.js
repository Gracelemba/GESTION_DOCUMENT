const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/postgres"
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully");
    const sql = fs.readFileSync('supabase/migrations/20260520000000_initial_schema.sql', 'utf8');
    await client.query(sql);
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

run();
