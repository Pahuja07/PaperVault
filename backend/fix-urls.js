import 'dotenv/config';
import db from './src/config/db.js';
import { sql } from 'drizzle-orm';

async function fixUrls() {
  try {
    await db.execute(sql`UPDATE papers SET "fileUrl" = REPLACE("fileUrl", 'pypwebsitefiles.blob.core.windows.net', 'pypwebsite123.blob.core.windows.net')`);
    console.log('Fixed URLs in DB');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixUrls();
