import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from './src/models/user.model.js';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://JAZZ:lilu123@localhost:5448/FILES';

console.log('Connecting to database:', DATABASE_URL.replace(/:[^:]*@/, ':****@'));

try {
  const db = drizzle(DATABASE_URL);
  console.log('✅ Drizzle-orm initialized successfully');

  // Test query
  const result = await db.select().from(usersTable).limit(1);
  console.log('✅ Query executed successfully');
  console.log('Users found:', result.length);
  if (result.length > 0) {
    console.log('First user:', result[0]);
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}