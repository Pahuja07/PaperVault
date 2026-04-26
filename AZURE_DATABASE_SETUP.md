# Azure Database for PostgreSQL - Complete Setup Guide

## 📋 Overview

This guide will help you migrate from local PostgreSQL to **Azure Database for PostgreSQL** for production-ready cloud storage.

---

## 🎯 What You'll Get

✅ **Cloud-hosted database** - No local PostgreSQL needed  
✅ **Automatic backups** - Azure handles backups  
✅ **Scalable** - Easy to scale up/down  
✅ **High availability** - Built-in redundancy  
✅ **Secure** - Azure-grade security  
✅ **SSL encryption** - All connections encrypted  

---

## 🚀 Step-by-Step Setup

### Phase 1: Create Azure Database (15 minutes)

#### 1.1 Access Azure Portal
1. Go to **[portal.azure.com](https://portal.azure.com)**
2. Sign in with your Microsoft account

#### 1.2 Create Database Server
1. Click **"Create a resource"** (or search "Azure Database for PostgreSQL")
2. Select **"Azure Database for PostgreSQL"**
3. Choose **"Azure Database for PostgreSQL flexible server"** (recommended)
4. Click **"Create"**

#### 1.3 Configure Basics
```
Project details:
- Subscription: [Your subscription]
- Resource group: pyp-files-rg (or create new)

Server details:
- Server name: pyp-files-db (must be globally unique)
- Region: [Choose closest to you]
- Workload type: Development (for testing) or Production
- PostgreSQL version: 15 (or latest available)
```

#### 1.4 Configure Compute + Storage
```
Compute:
- Tier: Burstable (B1ms) for dev/testing
- vCores: 1
- Storage: 32 GB (auto-grow enabled)

Backup:
- Backup retention: 7 days (default)
- Backup storage redundancy: Geo-redundant (recommended)
```

#### 1.5 Configure Networking
```
Connectivity method: Public access (allowed)
Grant access to: 
  - Current IP address (check "Add current IP")
  - Or allow all: 0.0.0.0 - 255.255.255.255 (for testing)

Allow public access from any Azure service within Azure to this server: Yes
```

#### 1.6 Set Admin Credentials
```
Server admin username: azureuser (or your preference)
Password: [Create strong password - SAVE THIS!]
Confirm password: [Same password]
```

#### 1.7 Review + Create
1. Click **"Review + create"**
2. Wait for validation to pass
3. Click **"Create"**
4. Wait for deployment (5-10 minutes)

---

### Phase 2: Get Connection Details (5 minutes)

#### 2.1 Find Connection String
1. Go to your **Azure Database for PostgreSQL resource**
2. In left menu, click **"Connection strings"**
3. Copy the **ADO.NET** connection string

It looks like:
```
Server=pyp-files-db.postgres.database.azure.com;Database=postgres;User Id=azureuser@pyp-files-db;Password=your-password;SSL Mode=Required;
```

#### 2.2 Convert to PostgreSQL Format
Convert to this format:
```
postgresql://azureuser@pyp-files-db:your-password@pyp-files-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Important**: 
- Username format: `username@server-name`
- Always include `?sslmode=require` at the end
- Port is `5432`

---

### Phase 3: Create Database (10 minutes)

#### 3.1 Connect to Azure Database

**Option A: Using Azure Cloud Shell (Easiest)**
1. In Azure Portal, click **Cloud Shell** icon (top right)
2. Select **Bash**
3. Run:
```bash
psql "postgresql://azureuser@pyp-files-db:your-password@pyp-files-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

**Option B: Using Local psql**
```bash
# Install PostgreSQL tools if not installed
# Windows: Download from https://www.postgresql.org/download/windows/

psql "postgresql://azureuser@pyp-files-db:your-password@pyp-files-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

#### 3.2 Create FILES Database
```sql
-- In psql:
CREATE DATABASE "FILES";

-- Verify it was created:
\l

-- Exit psql:
\q
```

---

### Phase 4: Update Application Configuration (5 minutes)

#### 4.1 Update .env File

Your `backend/.env` should have:

```env
# Azure Database for PostgreSQL
DATABASE_URL=postgresql://azureuser@pyp-files-db:your-password@pyp-files-db.postgres.database.azure.com:5432/FILES?sslmode=require

# Local PostgreSQL (comment out when using Azure)

```

**Replace**:
- `azureuser@pyp-files-db` with your username@server-name
- `your-password` with your actual password

#### 4.2 Test Configuration
```bash
cd backend
node test-azure-db-connection.js
```

---

### Phase 5: Run Migrations (10 minutes)

#### 5.1 Push Database Schema
```bash
cd backend
pnpm db:push
```

This creates all tables:
- `users`
- `departments`
- `subjects`
- `papers`
- `predictions`
- `question_bank`
- `topic_mastery`
- `prediction_feedback`

#### 5.2 Verify Tables
```bash
pnpm db:studio
```

Opens Drizzle Studio at `http://localhost:3000` to view tables.

---

## 🧪 Testing the Connection

### Test Script: test-azure-db-connection.js

Create `backend/test-azure-db-connection.js`:

```javascript
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
      console.log('⚠️ No tables found. Run migrations first.');
    }
    
    console.log('\n✅ Azure Database connection test PASSED!');
    
  } catch (error) {
    console.error('❌ Connection test FAILED!');
    console.error('Error:', error.message);
    
    if (error.message.includes('password')) {
      console.log('\n💡 Tip: Check your password in DATABASE_URL');
    } else if (error.message.includes('database')) {
      console.log('\n💡 Tip: Make sure FILES database exists');
    } else if (error.message.includes('SSL')) {
      console.log('\n💡 Tip: Ensure ?sslmode=require is in connection string');
    }
    
  } finally {
    await client.end();
  }
}

testAzureConnection();
```

### Run Test
```bash
cd backend
node test-azure-db-connection.js
```

### Expected Output
```
🧪 Testing Azure Database Connection...

1️⃣ Connecting to Azure Database...
✅ Connected successfully!

2️⃣ Checking database info...
📊 PostgreSQL Version: PostgreSQL 15.4 on x86_64-pc-linux-gnu...

3️⃣ Checking tables...
📋 Found tables:
   - departments
   - papers
   - subjects
   - users

✅ Azure Database connection test PASSED!
```

---

## 🐛 Troubleshooting

### Issue: Connection Timeout
**Solution:**
- Check firewall rules in Azure Portal
- Ensure your IP is allowed
- Verify server name is correct

### Issue: Authentication Failed
**Solution:**
- Double-check username format: `username@server-name`
- Verify password is correct
- Ensure no extra spaces in connection string

### Issue: SSL Error
**Solution:**
- Ensure `?sslmode=require` is at end of connection string
- Azure requires SSL connections

### Issue: Database Does Not Exist
**Solution:**
- Create FILES database using psql (see Phase 3)
- Run migrations with `pnpm db:push`

---

## 📊 Cost Estimation

### Azure Database for PostgreSQL (Flexible Server)

| Tier | vCores | Storage | Estimated Cost/Month |
|------|--------|---------|---------------------|
| Burstable B1ms | 1 | 32 GB | ~$15-20 |
| Burstable B2s | 2 | 32 GB | ~$40-50 |
| General Purpose D2ds_v5 | 2 | 32 GB | ~$100-120 |

**Note:** Prices vary by region. Check [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

---

## ✅ Final Checklist

- [ ] Azure Database for PostgreSQL created
- [ ] FILES database created
- [ ] Connection string obtained
- [ ] `.env` file updated with Azure connection
- [ ] Test script runs successfully
- [ ] Migrations completed (`pnpm db:push`)
- [ ] Backend starts without errors
- [ ] Can access Drizzle Studio

---

## 🎉 You're Done!

Your application is now connected to **Azure Database for PostgreSQL**!

### What's Next:
1. **Start your backend**: `cd backend && pnpm start`
2. **Start your frontend**: `cd pyp-website/pyp-website && pnpm dev`
3. **Test the application**: Upload papers, test AI predictions

### Important Reminders:
- 🔐 **Never commit** your `.env` file to git
- 💾 **Backup** your connection string somewhere safe
- 📊 **Monitor** your Azure database usage in Azure Portal
- 🔄 **Update** your connection string if you change passwords

---

## 📞 Support Resources

- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

**Happy coding! 🚀**