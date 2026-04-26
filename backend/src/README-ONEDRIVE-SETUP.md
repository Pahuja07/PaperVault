# OneDrive Integration Setup Guide

This guide explains how to set up OneDrive integration for your file sharing system.

## Prerequisites

1. Microsoft Azure Account
2. OneDrive with sufficient storage (15GB recommended)
3. Node.js application

## Setup Steps

### 1. Create Microsoft Azure App

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Enter an application name (e.g., "FileSharingSystem")
5. Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"
6. Set the redirect URI to: `http://localhost:8000/auth/onedrive/callback`
7. Click **Register**

### 2. Configure App Permissions

1. After registration, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Delegated permissions**
4. Add these permissions:
   - `Files.ReadWrite.AppFolder` - Read/write to app's OneDrive folder
   - `offline_access` - To get refresh tokens
5. Click **Add permissions**
6. Grant admin consent if required

### 3. Get App Credentials

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Enter a description and choose an expiration period
4. Copy the **Client ID**, **Client Secret**, and **Tenant ID**

### 4. Get Refresh Token

Run this script once to get your refresh token:

```javascript
// get-onedrive-token.js
import 'dotenv/config';
import http from 'http';

const clientId = process.env.ONEDRIVE_CLIENT_ID;
const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET;
const tenantId = process.env.ONEDRIVE_TENANT_ID;
const redirectUri = process.env.ONEDRIVE_REDIRECT_URI;

// Step 1: Get authorization code
const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&scope=https://graph.microsoft.com/Files.ReadWrite.AppFolder offline_access&redirect_uri=${encodeURIComponent(redirectUri)}`;

console.log('Visit this URL to authorize:', authUrl);
console.log('After authorization, copy the code from the redirect URL and use it in the next step.');

// Step 2: Exchange code for tokens (run after getting auth code)
// const authCode = 'PASTE_AUTH_CODE_HERE';
// 
// const tokenData = new URLSearchParams({
//     client_id: clientId,
//     client_secret: clientSecret,
//     code: authCode,
//     redirect_uri: redirectUri,
//     grant_type: 'authorization_code'
// });
// 
// const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: tokenData
// });
// 
// const tokens = await response.json();
// console.log('Refresh Token:', tokens.refresh_token);
```

### 5. Update Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
ONEDRIVE_CLIENT_ID="your-client-id"
ONEDRIVE_CLIENT_SECRET="your-client-secret"
ONEDRIVE_TENANT_ID="your-tenant-id"
ONEDRIVE_REFRESH_TOKEN="your-refresh-token"
```

## Features

### Upload
- Files are uploaded to OneDrive App Folder in `pyp-papers` subfolder
- Automatic folder creation if it doesn't exist
- Local files are cleaned up after successful upload

### Download
- Direct redirect to OneDrive shareable links
- No bandwidth usage on your server
- Files can be downloaded directly from OneDrive

### Storage Benefits
- **15GB storage** with free OneDrive
- **No server storage limits**
- **Automatic backups** by Microsoft
- **Shareable links** for easy access
- **Version history** in OneDrive

## API Endpoints

### Upload Paper
```
POST /api/papers
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- title: string
- semester: number
- examtype: string
- difficulty: string
- year: number
- departmentid: string
- subjectid: string
- file: PDF file
```

### Download Paper
```
GET /api/papers/:id/download
```
Redirects to OneDrive download URL.

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if all environment variables are set correctly
   - Ensure refresh token is valid (expires after 90 days)
   - Verify app permissions in Azure Portal

2. **Upload Failed**
   - Check OneDrive storage space
   - Verify file format (PDF only)
   - Check network connectivity

3. **Download Issues**
   - Ensure OneDrive sharing is enabled
   - Check if file exists in OneDrive
   - Verify URL format

### Refresh Token Expiry

Refresh tokens expire after 90 days. You'll need to:
1. Re-authenticate the app
2. Update the refresh token in your environment variables

## Migration from Cloudinary

If you're migrating from Cloudinary:
1. Existing Cloudinary URLs in database will continue to work
2. New uploads will use OneDrive
3. Consider running a migration script to move existing files to OneDrive

## Security Considerations

- Store credentials in environment variables
- Use HTTPS in production
- Regular backup of your database
- Monitor OneDrive storage usage
