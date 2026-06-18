import pg from 'pg';
import dns from 'dns';
const { Pool } = pg;
dns.setDefaultResultOrder('ipv4first');

console.log('Connecting to', new URL(process.env.DATABASE_URL).hostname);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT 1 as val').then(res => {
  console.log('Success:', res.rows);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
