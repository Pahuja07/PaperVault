import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testAzureConnection() {
  console.log('🧪 Testing Azure Database Connection...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });
  
  try {
    console.log('1️⃣ Connecting to Azure Database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('\n2️⃣ Checking database info...');
    const result = await client.query('SELECT version();');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    console.log('\n3️⃣ Checking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Found tables:');
      tables.rows.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('⚠️ No tables found. Run migrations first (pnpm db:push).');
    }
    
    console.log('\n✅ Azure Database connection test PASSED!');
    
  } catch (error) {
    console.error('❌ Connection test FAILED!');
    console.error('Error:', error.message);
    
    if (error.message.includes('password') || error.message.includes('authentication')) {
      console.log('\n💡 Tip: Check your username and password in DATABASE_URL');
      console.log('   Username format: username@server-name');
    } else if (error.message.includes('database') || error.message.includes('FILES')) {
      console.log('\n💡 Tip: Make sure FILES database exists in Azure');
      console.log('   Connect to postgres database first and run: CREATE DATABASE "FILES";');
    } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
      console.log('\n💡 Tip: Ensure ?sslmode=require is at end of connection string');
      console.log('   Azure requires SSL connections.');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Tip: Check Azure firewall rules');
      console.log('   - Ensure your IP is allowed in Azure Portal');
      console.log('   - Or temporarily allow all IPs (0.0.0.0 - 255.255.255.255) for testing');
    } else if (error.message.includes('dns') || error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Tip: Check your server name in connection string');
      console.log('   Format: postgresql://user@server-name:password@server-name.postgres.database.azure.com:5432/FILES?sslmode=require');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

testAzureConnection();