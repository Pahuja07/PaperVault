# ✅ Azure OneDrive Setup - Complete Checklist

**Estimated Time**: 45 minutes (20 min Azure + 10 min get token + 15 min test)

---

## 🎯 BEFORE YOU START
- [ ] Microsoft account (with OneDrive access)
- [ ] Admin access to Azure subscription
- [ ] Access to your backend code
- [ ] PostmanPad or cURL installed

---

## 📋 PHASE 1: Azure Portal Setup (20 minutes)

### Register App in Azure AD

- [ ] Go to [portal.azure.com](https://portal.azure.com)
- [ ] Click **"Azure Active Directory"** (or search it)
- [ ] Click **"App registrations"**
- [ ] Click **"+ New registration"**

### Fill Registration Form
- [ ] Name: `PYP-Files-OneDrive`
- [ ] Select account type: **"Accounts in any organizational directory and personal..."**
- [ ] Redirect URI Platform: Select **"Web"**
- [ ] Redirect URI: `http://localhost:8000/auth/onedrive/callback`
- [ ] Click **"Register"**

### Copy Credentials (Part 1)
After clicking Register, you'll see overview page:

- [ ] Copy **"Application (client) ID"**
  - Verify it's 36 characters with hyphens
  - ✅ Already in .env: `cad2e77a-a625-4e31-afad-80cb9f6272b8`

- [ ] Copy **"Directory (tenant) ID"**
  - Verify it's 36 characters with hyphens
  - ✅ Already in .env: `bfff6dd4-8eaa-4f26-8685-28a03f1d6d93`

### Create Client Secret (Part 2)

- [ ] In left menu, click **"Certificates & secrets"**
- [ ] Click **"New client secret"** button
- [ ] Description: `OneDrive API Secret`
- [ ] Expiration: **24 months**
- [ ] Click **"Add"**
- [ ] ⚠️ **IMMEDIATELY** copy the **"Value"** (not ID)
  - Paste into `backend/.env` as: `ONEDRIVE_CLIENT_SECRET=...`
  - Note: This value disappears after page refresh!

### Add API Permissions (Part 3)

- [ ] Click **"API permissions"** in left menu
- [ ] Click **"+ Add a permission"**
- [ ] Select **"Microsoft Graph"**
- [ ] Choose **"Delegated permissions"**
- [ ] Search for and add:
  - [ ] `Files.ReadWrite`
  - [ ] `Files.ReadWrite.All`
  - [ ] `Sites.ReadWrite`
- [ ] Click **"Grant admin consent for [your-tenant]"**
  - (If you don't have permission, contact your Azure admin)

---

## 🔐 PHASE 2: Get Refresh Token (10 minutes)

### Using OAuth Playground (RECOMMENDED)

- [ ] Go to [oauthplayground.azurewebsites.net](https://oauthplayground.azurewebsites.net)

- [ ] Click **settings icon** (top right)
  - [ ] Client ID: Paste `cad2e77a-a625-4e31-afad-80cb9f6272b8`
  - [ ] Client Secret: Paste your `ONEDRIVE_CLIENT_SECRET`
  - [ ] Close settings

- [ ] In **Step 1 - Authorization** section:
  - [ ] Enter scope: `offline_access Files.ReadWrite.All`
  - [ ] Click **"Authorize"**

- [ ] **Sign in** with your Microsoft account
  - [ ] Accept permissions

- [ ] **Step 2 - Exchange auth code**
  - [ ] Click **"Exchange authorization code for tokens"**
  - [ ] Wait for response

- [ ] **Copy the refresh token**
  - [ ] Find `"refresh_token"` in response
  - [ ] Copy entire value (long string, ~1000 chars)
  - [ ] Paste into `backend/.env` as: `ONEDRIVE_REFRESH_TOKEN=...`

---

## ⚙️ PHASE 3: Update Backend Configuration (5 minutes)

### Edit .env File

- [ ] Open `backend/.env` in your editor
- [ ] Find these lines:
  ```
  ONEDRIVE_CLIENT_SECRET=your-onedrive-client-secret
  ONEDRIVE_REFRESH_TOKEN=your-refresh-token
  ```

- [ ] Replace with your actual values:
  ```
  ONEDRIVE_CLIENT_SECRET=eyJ...full-value...
  ONEDRIVE_REFRESH_TOKEN=0.AS...full-value...
  ```

- [ ] Verify all values are filled (not placeholder text)
- [ ] Save file
- [ ] Do NOT commit to git

### Verify Configuration

- [ ] Open terminal in `backend` folder
- [ ] Run: `cat .env | grep ONEDRIVE`
- [ ] Should show actual values, not placeholders
- [ ] Each line should be 50+ characters long

---

## 🧪 PHASE 4: Test Configuration (10 minutes)

### Test 1: Start Backend Server

- [ ] Open terminal in `backend` folder
- [ ] Run: `pnpm start`
- [ ] Expected output:
  ```
  Server running on port 8000
  Connected to database
  ```
- [ ] If errors, check `.env` file syntax
- [ ] Keep server running for next tests

### Test 2: Verify Environment Variables

- [ ] In **another** terminal, run:
  ```bash
  node backend/verify-env.js
  ```
- [ ] Expected output:
  ```
  ✅ DATABASE_URL: postgresql://...
  ✅ ONEDRIVE_CLIENT_ID: cad2e77a...
  ✅ ONEDRIVE_CLIENT_SECRET: eyJ...
  ✅ ONEDRIVE_TENANT_ID: bfff6dd4...
  ✅ ONEDRIVE_REFRESH_TOKEN: 0.AS...
  ✅ All variables set!
  ```

### Test 3: Test OneDrive Connection

- [ ] Run:
  ```bash
  node backend/test-onedrive-connection.js
  ```
- [ ] Expected output:
  ```
  🔗 Testing OneDrive Connection...
  
  1️⃣ Getting access token...
  ✅ Access token obtained
  
  2️⃣ Checking papers folder...
  ✅ Papers folder ready
  
  3️⃣ Testing file metadata...
  ✅ OneDrive Details:
     Owner: Your Name
     Email: your.email@outlook.com
     Storage: 125.34MB used
  
  ✅ All OneDrive tests passed!
  ```

- [ ] If error about permissions, wait 5 minutes and retry
- [ ] If error about "invalid_grant", get new refresh token

### Test 4: End-to-End Upload Test

- [ ] Run:
  ```bash
  node backend/test-e2e-upload.js
  ```
- [ ] Expected output:
  ```
  🚀 End-to-End Upload Test
  
  1️⃣ Creating test PDF...
  ✅ Test file created: /path/to/test-sample.pdf
  
  2️⃣ Uploading to OneDrive...
  ✅ Upload successful!
  
  3️⃣ Results:
  📎 Shareable URL: https://1drv.ms/u/s!AnXxxxxxxxxx
  
  ✅ Upload test completed!
  💡 Tip: Click the URL above to verify file in OneDrive
  ```

- [ ] Click the link to verify file in OneDrive
- [ ] File should appear in OneDrive > "pyp-papers" folder

---

## 🌐 PHASE 5: Test API Endpoints (10 minutes)

### Prepare: Create JWT Token

- [ ] You need authenticated access token
- [ ] If you have admin user, login to get token
- [ ] Or create test token manually

### Test Upload Endpoint

- [ ] Using Postman or cURL:
  ```bash
  curl -X POST http://localhost:8000/papers \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -F "file=@test-paper.pdf" \
    -F "title=Algebra Midterm" \
    -F "semester=3" \
    -F "examtype=Midterm" \
    -F "difficulty=Medium" \
    -F "year=2024" \
    -F "departmentid=1" \
    -F "subjectid=1"
  ```

- [ ] Expected response (201):
  ```json
  {
    "message": "Paper Uploaded",
    "inserted": [
      {
        "paperid": 1,
        "title": "Algebra Midterm"
      }
    ]
  }
  ```

- [ ] Verify in OneDrive: File should appear in "pyp-papers" folder
- [ ] Database check:
  ```bash
  psql -U JAZZ -d FILES -c "SELECT * FROM papers LIMIT 1;"
  ```

### Test Download Endpoint

- [ ] Using Postman or cURL:
  ```bash
  curl -X GET http://localhost:8000/papers/1/download -L
  ```

- [ ] Expected: Browser opens OneDrive link
- [ ] File should be accessible

---

## 🎨 PHASE 6: Frontend Integration (Optional)

- [ ] Update `pyp-website/src/pages/Upload/Upload.jsx`
- [ ] Add form fields for: title, semester, examtype, difficulty, year
- [ ] Add file input (PDF only)
- [ ] Send multipart/form-data to `/papers`
- [ ] Display OneDrive link after upload

---

## 📊 FINAL VERIFICATION

After all tests, run this verification:

```bash
# 1. Database check
psql -U JAZZ -d FILES -c "SELECT COUNT(*) FROM papers;"

# 2. OneDrive check
# Go to: https://onedrive.live.com
# Look for "pyp-papers" folder
# Should contain uploaded PDFs

# 3. Server health
curl http://localhost:8000/papers

# 4. All tests
echo "=== Environment ===" && node backend/verify-env.js && \
echo -e "\n=== Connection ===" && node backend/test-onedrive-connection.js
```

---

## ✅ SUCCESS CHECKLIST

Verify all are working:

- [ ] Backend starts without errors
- [ ] Environment variables verified
- [ ] OneDrive connection successful
- [ ] Upload test created file in OneDrive
- [ ] API upload endpoint works (201 response)
- [ ] File appears in OneDrive
- [ ] Database stores metadata
- [ ] Download endpoint redirects to file
- [ ] OneDrive link is accessible

---

## 🎉 DONE!

Your system is now ready to:
- ✅ Accept PDF uploads from users
- ✅ Store files in OneDrive automatically
- ✅ Generate shareable links
- ✅ Track metadata in PostgreSQL
- ✅ Scale to unlimited storage

**Your file sharing system is now cloud-enabled! 🚀**

---

## 📞 Troubleshooting Quick Links

If something goes wrong:

1. **Can't get token?** → Check `backend/verify-env.js`
2. **Connection fails?** → Check API permissions in Azure
3. **Upload errors?** → Check `backend/test-onedrive-connection.js`
4. **Database errors?** → Check PostgreSQL is running
5. **File not uploading?** → Check .env syntax (no trailing spaces)

See `TROUBLESHOOTING_COMMANDS.md` for detailed solutions.

---

## 💾 Important Reminders

- 🔐 Never share your credentials
- 📝 Don't commit `.env` to git
- 🔄 Refresh token every 6 months
- 💾 Backup your credentials somewhere safe
- 📊 Monitor OneDrive storage usage
- 🧹 Clean up test files after testing

**Ready? Start with Phase 1!** ⬆️
