import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  console.log('Attempting connection to:', process.env.DATABASE_URL);
  await client.connect();
  console.log('✅ Database connection successful!');
  
  const res = await client.query('SELECT version()');
  console.log('PostgreSQL version:', res.rows[0].version);
  
  await client.end();
} catch (err) {
  console.error('❌ Database connection failed!');
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  console.error('Connection string:', process.env.DATABASE_URL);
  console.error('Full error:', err);
  process.exit(1);
}
