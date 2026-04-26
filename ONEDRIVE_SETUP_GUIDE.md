# OneDrive Integration Guide for PYP Website

## 📁 Complete OneDrive Setup for File Storage

This guide will help you configure OneDrive to store all PDF papers while keeping metadata in PostgreSQL.

## 🎯 Architecture Overview

```
┌─────────────────┐    Metadata     ┌──────────────────┐
│   PostgreSQL    │◄──────────────►│   Your Backend    │
│   (Database)    │   (IDs, info)   │   (Node.js)       │
└─────────────────┘                 └──────────────────┘
                                             │
                                             │ Upload/Download
                                             ▼
                                    ┌──────────────────┐
                                    │    OneDrive      │
                                    │   (File Store)   │
                                    └──────────────────┘
```

**Key Points:**
- ✅ PostgreSQL stores: Paper metadata (title, semester, subject, year, OneDrive URL)
- ✅ OneDrive stores: Actual PDF files
- ✅ Benefits: Scalable storage, automatic backups, easy sharing

## 📝 Step 1: Register Azure AD Application

### 1.1 Go to Azure Portal
- Visit: https://portal.azure.com
- Sign in with your Microsoft account (the one with OneDrive)

### 1.2 Register New Application
1. Go to **Azure Active Directory** → **App registrations**
2. Click **+ New registration**
3. Fill in:
   - **Name**: `PYP-Website-Files`
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: 
     - Platform: Web
     - Value: `http://localhost:8000/auth/onedrive/callback`
4. Click **Register**

### 1.3 Note Down Credentials
After registration, you'll see:
- **Application (client) ID** → This is your `ONEDRIVE_CLIENT_ID`
- **Directory (tenant) ID** → This is your `ONEDRIVE_TENANT_ID`

### 1.4 Create Client Secret
1. Go to **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `PYP-Website-Secret`
4. Expires: Choose 24 months (or your preference)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** (not ID) immediately → This is your `ONEDRIVE_CLIENT_SECRET`

### 1.5 Set API Permissions
1. Go to **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `Files.readwrite` - Read and write files in OneDrive
   - `Files.readwrite.all` - Read and write all files user can access
   - `Sites.readwrite` - Read and write items in SharePoint sites
6. Click **Grant admin consent** (if available)

## 📝 Step 2: Get Refresh Token

### Option A: Using OAuth Playground (Easiest)

1. Visit: https://oauthplayground.azurewebsites.net/
2. Fill in:
   - **Client ID**: Your Application (client) ID
   - **Client Secret**: Your client secret value
   - **Scope**: `offline_access Files.readwrite.all`
   - **Redirect URI**: `http://localhost:8000/auth/onedrive/callback`
3. Click **Authorize**
4. Sign in with your Microsoft account
5. Grant permissions
6. You'll be redirected - copy the **code** parameter from the URL
7. Back in playground, paste the code and click **Get token**
8. Copy the **refresh_token** → This is your `ONEDRIVE_REFRESH_TOKEN`

### Option B: Using Postman

1. Create new request in Postman
2. URL: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:8000/auth/onedrive/callback&response_mode=query&scope=offline_access%20Files.readwrite.all`
3. Replace `YOUR_CLIENT_ID` with your actual client ID
4. Send request and authorize
5. Copy the code from redirect URL
6. Make POST request to: `https://login.microsoftonline.com/common/oauth2/v2.0/token`
   - Body (x-www-form-urlencoded):
     ```
     client_id: YOUR_CLIENT_ID
     client_secret: YOUR_CLIENT_SECRET
     scope: offline_access Files.readwrite.all
     code: CODE_FROM_STEP_4
     grant_type: authorization_code
     redirect_uri: http://localhost:8000/auth/onedrive/callback
     ```
7. Response will contain `refresh_token`

## 📝 Step 3: Configure Backend

### 3.1 Update backend/.env

```env
# OneDrive Configuration
ONEDRIVE_CLIENT_ID=your-client-id-from-step-1.3
ONEDRIVE_CLIENT_SECRET=your-client-secret-from-step-1.4
ONEDRIVE_TENANT_ID=your-tenant-id-from-step-1.3
ONEDRIVE_REFRESH_TOKEN=your-refresh-token-from-step-2
ONEDRIVE_REDIRECT_URI=http://localhost:8000/auth/onedrive/callback
```

### 3.2 Install Required Package

Your backend already has the OneDrive service. If not, install it:

```bash
cd backend
pnpm install @microsoft/microsoft-graph-client isomorphic-fetch
```

### 3.3 Test OneDrive Connection

Create `backend/test-onedrive.js`:

```javascript
import { Client } from '@microsoft/microsoft-graph-client'
import 'isomorphic-fetch'
import dotenv from 'dotenv'

dotenv.config()

async function testOneDrive() {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, process.env.ONEDRIVE_ACCESS_TOKEN) // You'll need to get access token first
      }
    })

    // Get user's OneDrive info
    const drive = await client.api('/me/drive').get()
    console.log('Connected to OneDrive:', drive.name)
    console.log('Available storage:', drive.quota.total, 'bytes')
  } catch (error) {
    console.error('OneDrive connection error:', error)
  }
}

testOneDrive()
```

## 📝 Step 4: Upload Paper to OneDrive

### 4.1 Using the Existing Upload Endpoint

Your backend already has paper upload functionality that uses OneDrive. When you upload a paper through `/papers/upload`, it automatically:

1. Receives the PDF file
2. Uploads to OneDrive
3. Gets a shareable URL
4. Stores metadata in PostgreSQL with the OneDrive URL

### 4.2 Manual Upload Test

Create `backend/test-upload.js`:

```javascript
import fs from 'fs'
import { uploadToOneDrive } from './src/services/onedrive.service.js'

async function testUpload() {
  try {
    const filePath = './test-paper.pdf' // Path to a test PDF
    const fileName = 'test-paper.pdf'
    
    const shareableUrl = await uploadToOneDrive(filePath, fileName)
    console.log('File uploaded successfully!')
    console.log('Shareable URL:', shareableUrl)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

testUpload()
```

## 📝 Step 5: Download Paper from OneDrive

### 5.1 Using the Download Endpoint

Your backend has `/papers/:id/download` endpoint that:
1. Gets paper metadata from PostgreSQL
2. Retrieves the OneDrive URL
3. Redirects user to OneDrive download link

### 5.2 Direct Download Link

The download links are direct OneDrive shareable URLs that users can:
- Click to open in browser
- Download directly
- Share with others

## 📝 Step 6: Organize Files in OneDrive

### Recommended Folder Structure

```
OneDrive/
└── PYP-Website/
    ├── CSE/
    │   ├── Semester-1/
    │   ├── Semester-2/
    │   └── ...
    ├── IT/
    ├── ECE/
    └── ...
```

### Update Upload Service

Modify `backend/src/services/onedrive.service.js` to create folders:

```javascript
async function ensureFolderExists(folderPath) {
  // Create folder if it doesn't exist
  const folders = folderPath.split('/')
  let currentPath = '/drive/root:'
  
  for (const folder of folders) {
    currentPath += `/${folder}`
    try {
      await client.api(`${currentPath}`).get()
    } catch (error) {
      if (error.statusCode === 404) {
        await client.api(`${currentPath}:/createFolder`).post()
      }
    }
  }
}
```

## 🔧 Troubleshooting

### Issue 1: "Invalid refresh token"
**Solution**: Refresh tokens expire. Get a new one using Step 2.

### Issue 2: "Permission denied"
**Solution**: 
- Ensure API permissions are granted in Azure AD
- Grant admin consent if required
- Check that the Microsoft account has OneDrive access

### Issue 3: "Redirect URI mismatch"
**Solution**: Ensure the redirect URI in Azure AD exactly matches the one in your .env file.

### Issue 4: "Access token expired"
**Solution**: Access tokens expire every hour. Your code should use the refresh token to get new access tokens automatically.

### Issue 5: "File not found"
**Solution**: 
- Check if the file was actually uploaded to OneDrive
- Verify the file ID/URL stored in PostgreSQL
- Ensure the OneDrive account hasn't been changed

## 💾 Storage Management

### OneDrive Storage Limits
- **Free**: 5 GB
- **Microsoft 365 Personal**: 1 TB (₹4,299/year)
- **Microsoft 365 Family**: 1 TB per user (₹5,499/year for 6 users)
- **OneDrive Standalone**: 100 GB (₹149/month)

### Cost Optimization
1. **Compress PDFs** before upload
2. **Delete duplicate papers**
3. **Use shared libraries** for common subjects
4. **Archive old papers** to cheaper storage

### Monitoring Usage
```javascript
async function checkStorageUsage() {
  const drive = await client.api('/me/drive').get()
  const used = drive.quota.used
  const total = drive.quota.total
  const percent = (used / total * 100).toFixed(2)
  
  console.log(`Storage: ${used} / ${total} bytes (${percent}%)`)
}
```

## 🔒 Security Best Practices

1. **Never commit** OneDrive credentials to version control
2. **Use environment variables** for all secrets
3. **Rotate refresh tokens** periodically
4. **Monitor access** through Azure AD sign-in logs
5. **Limit permissions** to only what's needed
6. **Use HTTPS** for all API calls in production

## 📊 Benefits of This Architecture

### ✅ Scalability
- OneDrive handles file storage scaling automatically
- PostgreSQL remains lightweight with just metadata
- No file size limits (OneDrive supports up to 250 GB per file)

### ✅ Reliability
- Microsoft's 99.9% uptime SLA
- Automatic backups and versioning
- Geo-redundant storage

### ✅ Cost-Effective
- No need for expensive file servers
- Pay only for storage used
- Included with Microsoft 365 subscriptions

### ✅ Easy Sharing
- Generate shareable links instantly
- Control access permissions
- Track download statistics

### ✅ Integration
- Works with existing Microsoft tools
- Easy migration from other systems
- RESTful API for custom integrations

## 🚀 Next Steps

1. ✅ Complete OneDrive setup following this guide
2. ✅ Test upload and download functionality
3. ✅ Configure your email settings (see EMAIL_SETUP_GUIDE.md)
4. ✅ Set up OpenAI API for AI predictions
5. ✅ Run database migrations
6. ✅ Start using the PYP website!

## 📞 Support

If you encounter issues:
1. Check Azure AD app registration settings
2. Verify all credentials in .env file
3. Test with OAuth playground first
4. Review Microsoft Graph API documentation
5. Check backend logs for detailed error messages

---

**Note**: This setup ensures your PostgreSQL database stays clean and fast, while OneDrive handles all the heavy lifting for file storage. Perfect for a scalable educational platform!