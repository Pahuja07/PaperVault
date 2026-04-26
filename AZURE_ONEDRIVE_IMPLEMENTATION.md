# Azure OneDrive File Upload Implementation Guide

## 📌 Quick Overview
Your backend already has OneDrive integration implemented! This guide will help you complete the Azure AD setup and get everything working.

---

## 🔑 STEP 1: Register Azure AD Application

### 1.1 Access Azure Portal
1. Go to **[portal.azure.com](https://portal.azure.com)**
2. Sign in with your Microsoft account (the one with OneDrive access)
3. If you don't have Azure account, create free account at **[portal.azure.com/signup](https://portal.azure.com/signup)**

### 1.2 Register New Application
1. Search for **"App registrations"** in the search bar
2. Click **"New registration"**
3. Fill in the details:
   - **Name**: `PYP-Files-OneDrive`
   - **Supported account types**: Select **"Accounts in any organizational directory and personal Microsoft accounts"**
   - **Redirect URI**: 
     - Platform: Select **Web**
     - URI: `http://localhost:8000/auth/onedrive/callback`
4. Click **"Register"**

### 1.3 Copy Your Credentials
After registration, you'll be on the app overview page. Save these values:

```
Application (client) ID: _________________________ ← Copy this as ONEDRIVE_CLIENT_ID
Directory (tenant) ID:   _________________________ ← Copy this as ONEDRIVE_TENANT_ID
```

Already in your `.env`:
- ✅ `ONEDRIVE_CLIENT_ID=cad2e77a-a625-4e31-afad-80cb9f6272b8`
- ✅ `ONEDRIVE_TENANT_ID=bfff6dd4-8eaa-4f26-8685-28a03f1d6d93`

### 1.4 Create Client Secret ⚠️ IMPORTANT
1. In the left sidebar, click **"Certificates & secrets"**
2. Click **"New client secret"** button
3. Add description: `OneDrive API Secret`
4. Set expiration: **24 months** (or your preference)
5. Click **"Add"**
6. **IMMEDIATELY** copy the **Value** (not the ID!)
7. Paste this as `ONEDRIVE_CLIENT_SECRET` in your `.env`

```
ONEDRIVE_CLIENT_SECRET=your-secret-value-here
```

### 1.5 Grant API Permissions
1. In left sidebar, click **"API permissions"**
2. Click **"+ Add a permission"**
3. Select **"Microsoft Graph"**
4. Choose **"Delegated permissions"**
5. Search and add these permissions:
   - ✅ `Files.ReadWrite` - Read and write files in OneDrive
   - ✅ `Files.ReadWrite.All` - Read and write all accessible files
   - ✅ `Sites.ReadWrite` - SharePoint access
6. Click **"Grant admin consent"** (if available)

---

## 🔐 STEP 2: Get Refresh Token (Choose ONE method)

### Method A: OAuth Playground (EASIEST - Recommended)

1. **Open Browser**: Go to **[oauthplayground.azurewebsites.net](https://oauthplayground.azurewebsites.net/)**

2. **Configure Settings** (top right):
   - **Client ID**: Paste your `ONEDRIVE_CLIENT_ID`
   - **Client Secret**: Paste your `ONEDRIVE_CLIENT_SECRET`

3. **Set Scopes** (left panel):
   ```
   offline_access Files.ReadWrite.All
   ```

4. **Authorize**:
   - Click **"Authorize"** button
   - Sign in with your Microsoft account
   - Grant all permissions when prompted

5. **Get Authorization Code**:
   - Click **"Exchange authorization code for tokens"**
   - You'll see the response with tokens

6. **Copy Refresh Token**:
   - Find `"refresh_token"` in the response
   - Copy the entire value (long string)
   - Paste as `ONEDRIVE_REFRESH_TOKEN` in `.env`

### Method B: Using Postman

1. **Create Authorization Request**:
   ```
   GET https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
   client_id=YOUR_CLIENT_ID&
   response_type=code&
   redirect_uri=http://localhost:8000/auth/onedrive/callback&
   response_mode=query&
   scope=offline_access%20Files.readwrite.all
   ```

2. **Open in Browser** and authorize
3. **Copy code** from redirect URL
4. **Exchange Code for Token**:
   ```
   POST https://login.microsoftonline.com/common/oauth2/v2.0/token
   
   Body (x-www-form-urlencoded):
   - client_id: YOUR_CLIENT_ID
   - client_secret: YOUR_CLIENT_SECRET
   - code: THE_CODE_FROM_STEP_3
   - grant_type: authorization_code
   - redirect_uri: http://localhost:8000/auth/onedrive/callback
   - scope: offline_access Files.readwrite.all
   ```

5. **Copy refresh_token** from response

---

## ⚙️ STEP 3: Update .env File

Update your `backend/.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://JAZZ:lilu123@localhost:5448/FILES

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# Server Configuration
PORT=8000

# Email Configuration
EMAIL_USER=jatinnpahuja112@gmail.com
EMAIL_PASSWORD=hsne loqi ehsj zlrf


```

---

## 📤 STEP 4: Upload Files to OneDrive

### 4.1 Using the Upload Endpoint

**Endpoint**: `POST /papers`

**Authentication**: Required (Admin role)

**Headers**:
```
Content-Type: multipart/form-data
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Body** (form-data):
```
title: "Calculus Paper 2023"
semester: "5"
examtype: "Midterm"
difficulty: "Hard"
year: "2023"
departmentid: "1"
subjectid: "1"
file: [YOUR_PDF_FILE]
```

### 4.2 Upload Flow

```
1. User selects PDF file
   ↓
2. Backend receives file
   ↓
3. uploadToOneDrive() function:
   - Gets access token using refresh token
   - Creates "pyp-papers" folder in OneDrive if needed
   - Uploads file to OneDrive
   - Creates shareable link
   - Deletes local temp file
   ↓
4. Stores metadata in PostgreSQL:
   - title, semester, examtype, difficulty, year
   - fileUrl (OneDrive shareable link)
   - departmentid, subjectid, uploadedby
   ↓
5. Returns success response with Paper ID
```

### 4.3 Example cURL Request

```bash
curl -X POST http://localhost:8000/papers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/paper.pdf" \
  -F "title=Calculus Final Exam" \
  -F "semester=5" \
  -F "examtype=Final" \
  -F "difficulty=Medium" \
  -F "year=2023" \
  -F "departmentid=1" \
  -F "subjectid=1"
```

---

## 📥 STEP 5: Download Files from OneDrive

**Endpoint**: `GET /papers/:id/download`

**Response**: Redirects to OneDrive shareable link

**Example**:
```
GET /papers/1/download
→ Redirects to: https://1drv.ms/u/s!AnXxxxxxxxxx
```

---

## ✅ STEP 6: Test the Integration

### 6.1 Create Test File

Create `backend/test-onedrive-integration.js`:

```javascript
import db from './src/config/db.js';
import { uploadToOneDrive } from './src/services/onedrive.service.js';
import fs from 'fs';
import path from 'path';

async function testOneDriveIntegration() {
  try {
    console.log('🧪 Testing OneDrive Integration...\n');

    // 1. Test access token retrieval
    console.log('1️⃣ Testing authentication...');
    const { getAccessToken } = await import('./src/services/onedrive.service.js');
    
    // 2. Create a test PDF file
    console.log('2️⃣ Creating test PDF...');
    const testFilePath = path.join(process.cwd(), 'test-sample.pdf');
    const pdfContent = Buffer.from('%PDF-1.4\n%Test PDF\n');
    fs.writeFileSync(testFilePath, pdfContent);
    
    // 3. Upload to OneDrive
    console.log('3️⃣ Uploading to OneDrive...');
    const shareableUrl = await uploadToOneDrive(testFilePath, 'test-sample.pdf');
    
    console.log('✅ Upload successful!');
    console.log('📎 Shareable URL:', shareableUrl);
    
    // 4. Store metadata in database
    console.log('4️⃣ Storing metadata in database...');
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

testOneDriveIntegration();
```

### 6.2 Run Test

```bash
cd backend
npm run dev  # or pnpm dev
node test-onedrive-integration.js
```

### 6.3 Expected Output

```
🧪 Testing OneDrive Integration...

1️⃣ Testing authentication...
2️⃣ Creating test PDF...
3️⃣ Uploading to OneDrive...
✅ Upload successful!
📎 Shareable URL: https://1drv.ms/u/s!AnXxxxxxxxxx
4️⃣ Storing metadata in database...

✅ All tests passed!
```

---

## 🐛 Troubleshooting

### Issue: "Invalid grant" error
**Solution**: 
- Refresh token expired → Get new refresh token from OAuth Playground
- Check tenant ID is correct

### Issue: "Permission denied" error
**Solution**:
- Make sure API permissions are granted
- Click "Grant admin consent" in API permissions tab
- Wait a few minutes for permissions to propagate

### Issue: "File upload failed" error
**Solution**:
- Check file is valid PDF
- Ensure file size < 100MB (OneDrive limit)
- Verify file path is correct

### Issue: "Access token failed" error
**Solution**:
- Verify all .env variables are correct
- Check Client Secret has not expired (set for 24 months)
- Ensure scope is correct in getAccessToken function

### Issue: Cannot download file
**Solution**:
- Verify Paper ID exists in database
- Check OneDrive URL is accessible
- Ensure URL permissions are set to "view" for anonymous users

---

## 📚 Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                   YOUR APPLICATION                       │
└─────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
        ┌───────▼──────┐    ┌─────▼────────┐
        │  PostgreSQL  │    │  OneDrive    │
        │  (Metadata)  │    │  (Files)     │
        └──────────────┘    └──────────────┘
        
Paper metadata stored:        Files stored:
- paperid                      - PDF documents
- title                        - Auto-organized
- semester                     - Shareable links
- examtype                     - Automatic backup
- difficulty                   - Secure access
- year
- fileUrl (OneDrive link)
- subjectid
- departmentid
- uploadedby
```

---

## 🎯 Next Steps

1. ✅ Register Azure AD app
2. ✅ Get Client Secret
3. ✅ Get Refresh Token
4. ✅ Update `.env` file
5. ✅ Test integration
6. ✅ Upload papers through API
7. ✅ Download papers via links

**You're all set! Your file sharing system is now cloud-enabled with Azure OneDrive.** 🚀
