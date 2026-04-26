# 🔧 Azure OneDrive Integration - Command Reference & Troubleshooting

## 📂 Project Structure

```
FileSharingSystem/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── onedrive.js                    ← OneDrive Configuration
│   │   ├── services/
│   │   │   └── onedrive.service.js            ← Upload/Download Logic
│   │   ├── controllers/
│   │   │   └── paper.controller.js            ← API Handlers
│   │   ├── routes/
│   │   │   └── paper.routes.js                ← Routes
│   │   └── middlewares/
│   │       └── upload.middleware.js           ← File Upload Setup
│   ├── .env                                   ← Configuration (YOUR JOB)
│   ├── package.json                           ← Dependencies
│   └── index.js                               ← Server Entry
├── AZURE_ONEDRIVE_IMPLEMENTATION.md           ← Full Guide
└── QUICK_START_AZURE_SETUP.md                 ← Quick Reference
```

---

## 🚀 Quick Command Reference

### Start Backend Server
```bash
cd backend
pnpm install      # First time only
pnpm start         # Start with nodemon
```

### Test Token Refresh
```bash
cd backend
node -e "
import('./src/services/onedrive.service.js').then(async m => {
  try {
    const token = await m.getAccessToken();
    console.log('✅ Token retrieved:', token.substring(0, 50) + '...');
  } catch(e) {
    console.error('❌ Error:', e.message);
  }
});
"
```

### List Uploaded Files (Temporary)
```bash
cd backend
ls -la uploads/    # On Linux/Mac
dir uploads        # On Windows
```

### Clear Temporary Files
```bash
cd backend
rm -rf uploads/*   # On Linux/Mac
rmdir /s uploads   # On Windows
```

---

## 🔍 Error Messages & Solutions

### Error 1: "INVALID_CLIENT"

**When**: Trying to get access token  
**Cause**: Wrong Client ID or Client Secret  
**Fix**:
1. Go to [portal.azure.com](https://portal.azure.com)
2. App registrations → Your app
3. Copy exact values:
   - `ONEDRIVE_CLIENT_ID` from "Application (client) ID"
   - `ONEDRIVE_CLIENT_SECRET` from "Certificates & secrets"
4. Restart backend

---

### Error 2: "AADSTS50058: Silent sign-in request failed"

**When**: Token refresh fails  
**Cause**: Refresh token expired or invalid  
**Fix**:
1. Get new refresh token from [oauthplayboard.azurewebsites.net](https://oauthplayboard.azurewebsites.net)
2. Update `ONEDRIVE_REFRESH_TOKEN` in `.env`
3. Restart backend

---

### Error 3: "Authorization_RequestDenied"

**When**: Uploading file to OneDrive  
**Cause**: Missing API permissions  
**Fix**:
1. Go to [portal.azure.com](https://portal.azure.com)
2. App registrations → Your app → API permissions
3. Add these permissions:
   - Files.ReadWrite
   - Files.ReadWrite.All
   - Sites.ReadWrite
4. Click "Grant admin consent"
5. Wait 5 minutes for permissions to propagate

---

### Error 4: "File type not allowed"

**When**: Uploading non-PDF file  
**Cause**: Multer filter only allows PDFs  
**Status**: ✅ This is working as intended

**To allow other files**, edit `backend/src/middlewares/upload.middleware.js`:
```javascript
// Replace:
if (file.mimetype === 'application/pdf') cb(null, true);

// With:
if (['application/pdf', 'application/msword'].includes(file.mimetype)) cb(null, true);
```

---

### Error 5: "EACCES: permission denied"

**When**: Creating uploads folder  
**Cause**: No write permissions  
**Fix**:
```bash
# Linux/Mac
sudo chmod 755 backend/uploads/

# Windows - Run as Administrator:
icacls backend\uploads /grant Everyone:F
```

---

### Error 6: "Network timeout"

**When**: Uploading file  
**Cause**: Slow internet or large file  
**Fix**:
1. Check internet connection
2. Try smaller file first (< 5MB)
3. Check OneDrive storage is not full
4. Increase timeout in `onedrive.service.js`:

```javascript
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  timeout: 120000,  // Add this (120 seconds)
  headers: {...},
  body: fileBuffer
});
```

---

## 🧪 Testing Procedures

### Test 1: Verify Environment Variables

**File**: `backend/verify-env.js`

```javascript
import 'dotenv/config';

console.log('🔍 Checking Environment Variables...\n');

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ONEDRIVE_CLIENT_ID',
  'ONEDRIVE_CLIENT_SECRET',
  'ONEDRIVE_TENANT_ID',
  'ONEDRIVE_REFRESH_TOKEN'
];

let allGood = true;

required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ ${key}: MISSING`);
    allGood = false;
  } else if (value.includes('your-') || value === 'placeholder') {
    console.log(`⚠️  ${key}: PLACEHOLDER (needs update)`);
    allGood = false;
  } else {
    const preview = value.substring(0, 30) + '...';
    console.log(`✅ ${key}: ${preview}`);
  }
});

console.log(allGood ? '\n✅ All variables set!' : '\n❌ Fix missing/placeholder variables');
```

**Run**:
```bash
node backend/verify-env.js
```

---

### Test 2: Verify OneDrive Connection

**File**: `backend/test-onedrive-connection.js`

```javascript
import { getAccessToken, ensurePapersFolder } from './src/services/onedrive.service.js';
import 'dotenv/config';

async function testConnection() {
  console.log('🔗 Testing OneDrive Connection...\n');

  try {
    console.log('1️⃣ Getting access token...');
    const token = await getAccessToken();
    console.log('✅ Access token obtained\n');

    console.log('2️⃣ Checking papers folder...');
    const folder = await ensurePapersFolder(token);
    console.log('✅ Papers folder ready\n');

    console.log('3️⃣ Testing file metadata...');
    const response = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const drive = await response.json();
      console.log('✅ OneDrive Details:');
      console.log(`   Owner: ${drive.owner.user.displayName}`);
      console.log(`   Email: ${drive.owner.user.userPrincipalName}`);
      console.log(`   Storage: ${(drive.quota.used / 1024 / 1024).toFixed(2)}MB used`);
    }

    console.log('\n✅ All OneDrive tests passed!');
  } catch (error) {
    console.error('\n❌ OneDrive test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('INVALID_CLIENT')) {
      console.error('\n💡 Hint: Check ONEDRIVE_CLIENT_ID and ONEDRIVE_CLIENT_SECRET');
    } else if (error.message.includes('invalid_grant')) {
      console.error('\n💡 Hint: Refresh token expired, get new one from OAuth Playground');
    }
  }
}

testConnection();
```

**Run**:
```bash
node backend/test-onedrive-connection.js
```

---

### Test 3: End-to-End Upload Test

**File**: `backend/test-e2e-upload.js`

```javascript
import { uploadToOneDrive } from './src/services/onedrive.service.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function testE2E() {
  console.log('🚀 End-to-End Upload Test\n');

  const testFile = path.join(process.cwd(), 'test-sample.pdf');

  try {
    // Create test PDF
    console.log('1️⃣ Creating test PDF...');
    const pdfContent = Buffer.from('%PDF-1.4\n%Sample PDF for testing\n');
    fs.writeFileSync(testFile, pdfContent);
    console.log(`✅ Test file created: ${testFile}\n`);

    // Upload
    console.log('2️⃣ Uploading to OneDrive...');
    const shareUrl = await uploadToOneDrive(testFile, 'test-sample-' + Date.now() + '.pdf');
    console.log('✅ Upload successful!\n');

    console.log('3️⃣ Results:');
    console.log(`📎 Shareable URL: ${shareUrl}\n`);

    console.log('✅ Upload test completed!');
    console.log('💡 Tip: Click the URL above to verify file in OneDrive');

  } catch (error) {
    console.error('\n❌ Upload test failed:');
    console.error('Error:', error.message);

    // Cleanup
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
}

testE2E();
```

**Run**:
```bash
node backend/test-e2e-upload.js
```

---

## 🔑 Getting Credentials (Step-by-Step)

### Part 1: Register Azure App

1. **Go to** [portal.azure.com](https://portal.azure.com)
2. **Search for** "App registrations"
3. **Click** "+ New registration"
4. **Fill in**:
   - Name: `PYP-Files-OneDrive`
   - Account types: Select "Accounts in any organizational directory..."
   - Redirect URI: `http://localhost:8000/auth/onedrive/callback`
5. **Click** "Register"
6. **Copy these values**:
   ```
   ONEDRIVE_CLIENT_ID=________
   ONEDRIVE_TENANT_ID=________
   ```

### Part 2: Create Client Secret

1. **Click** "Certificates & secrets" (left menu)
2. **Click** "+ New client secret"
3. **Set expiration**: 24 months
4. **Click** "Add"
5. **Copy the Value** (not ID):
   ```
   ONEDRIVE_CLIENT_SECRET=________
   ```

### Part 3: Add Permissions

1. **Click** "API permissions" (left menu)
2. **Click** "+ Add a permission"
3. **Select** "Microsoft Graph"
4. **Select** "Delegated permissions"
5. **Add these**:
   - [ ] Files.ReadWrite
   - [ ] Files.ReadWrite.All
   - [ ] Sites.ReadWrite
6. **Click** "Grant admin consent for..."

### Part 4: Get Refresh Token

1. **Go to** [oauthplayboard.azurewebsites.net](https://oauthplayboard.azurewebsites.net)
2. **Top right settings**:
   - Client ID: Paste your `ONEDRIVE_CLIENT_ID`
   - Client Secret: Paste your `ONEDRIVE_CLIENT_SECRET`
3. **Left side scope**:
   ```
   offline_access Files.ReadWrite.All
   ```
4. **Click** "Authorize"
5. **Sign in** with Microsoft account
6. **Grant permissions**
7. **Click** "Exchange authorization code for tokens"
8. **Copy refresh_token** from response:
   ```
   ONEDRIVE_REFRESH_TOKEN=________
   ```

---

## 📝 .env Template

Copy-paste this and fill in your credentials:

```env
# ============ DATABASE ============
DATABASE_URL=postgresql://JAZZ:lilu123@localhost:5448/FILES
JWT_SECRET=change-this-to-random-string

# ============ SERVER ============
PORT=8000

# ============ EMAIL ============
EMAIL_USER=jatinnpahuja112@gmail.com
EMAIL_PASSWORD=hsne loqi ehsj zlrf


---

## 🎯 API Testing with Examples

### Upload Paper

**Request**:
```bash
curl -X POST http://localhost:8000/papers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@paper.pdf" \
  -F "title=Calculus Midterm" \
  -F "semester=5" \
  -F "examtype=Midterm" \
  -F "difficulty=Medium" \
  -F "year=2024" \
  -F "departmentid=1" \
  -F "subjectid=1"
```

**Success Response** (201):
```json
{
  "message": "Paper Uploaded",
  "inserted": [
    {
      "paperid": 123,
      "title": "Calculus Midterm"
    }
  ]
}
```

**Error Response** (400):
```json
{
  "message": "File required"
}
```

### Download Paper

**Request**:
```bash
curl -X GET http://localhost:8000/papers/123/download -L
```

**Response**: Redirects to OneDrive shareable link

---

## 💡 Pro Tips

1. **Don't commit .env to Git**
   ```bash
   # .gitignore should have:
   .env
   .env.local
   uploads/
   ```

2. **Regenerate refresh token every 6 months**
   - Mark your calendar
   - Use OAuth Playground to get new token

3. **Monitor OneDrive storage**
   - Each PDF typically 1-10MB
   - OneDrive free: 5GB
   - OneDrive 365: 1TB

4. **Backup your credentials**
   - Store somewhere safe
   - Don't share publicly
   - Regenerate if compromised

5. **Test in staging first**
   - Create separate Azure app for testing
   - Use different OneDrive folder
   - Then move to production

---

## ✅ Verification Checklist

Run these commands to verify everything:

```bash
# 1. Check Node version
node --version
# Should be v16+

# 2. Check npm/pnpm
pnpm --version

# 3. Check database
psql -U JAZZ -d FILES -c "SELECT 1"
# Should return: 1

# 4. Check env file
cat backend/.env | grep ONEDRIVE
# Should show your credentials

# 5. Check dependencies
cd backend && pnpm list
# Should show: express, multer, pg, drizzle-orm

# 6. Start server
pnpm start
# Should say: "Server running on port 8000"

# 7. Test OneDrive
node test-onedrive-connection.js
# Should say: "✅ All OneDrive tests passed!"
```

---

## 🆘 Still Having Issues?

Check these in order:

1. **Is backend running?**
   ```bash
   curl http://localhost:8000/papers
   ```
   Should return: `401` (unauthorized) or JSON

2. **Is database connected?**
   ```bash
   psql -U JAZZ -d FILES -c "SELECT * FROM papers;"
   ```

3. **Are all env variables set?**
   ```bash
   node backend/verify-env.js
   ```

4. **Can you reach Azure?**
   ```bash
   curl https://login.microsoftonline.com/common/oauth2/v2.0/token
   ```
   Should return: 400+ error (but connection works)

5. **Check backend logs**
   ```bash
   tail -f backend.log
   ```

---

## 📞 Support Resources

- **Azure Documentation**: https://docs.microsoft.com/graph
- **OneDrive API**: https://docs.microsoft.com/onedrive/developer
- **OAuth 2.0**: https://tools.ietf.org/html/rfc6749
- **Node.js Fetch**: https://nodejs.org/api/fetch.html

**Good luck! 🚀**
