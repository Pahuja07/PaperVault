# 🔧 Refresh Token Access - Troubleshooting Guide

## ❌ Problem: Cannot Access Refresh Token

---

## 🔍 Step 1: Diagnose the Issue

### What error are you seeing?

**Option A: OAuth Playground won't load**
- Website not accessible
- Blank page
- Connection error

**Option B: Can't authorize**
- Won't let you sign in
- Permission denied
- Invalid credentials

**Option C: No refresh token in response**
- Authorization successful but no token
- Missing in response JSON
- Response is empty

**Option D: Technical issue**
- Browser issue
- CORS error
- Network error

---

## ✅ Solution 1: Use Postman Instead (RECOMMENDED)

This is more reliable than OAuth Playground.

### Step 1: Get Authorization Code

1. **Open your browser** and paste this URL (replace YOUR_CLIENT_ID):
```
https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
client_id=cad2e77a-a625-4e31-afad-80cb9f6272b8&
response_type=code&
redirect_uri=http://localhost:8000/auth/onedrive/callback&
response_mode=query&
scope=offline_access%20Files.readwrite.all
```

2. **Sign in** with your Microsoft account

3. **Grant permissions** when prompted

4. **You'll be redirected** to: `http://localhost:8000/auth/onedrive/callback?code=XXXXX`

5. **Copy the code** from the URL (the long string after `code=`)

### Step 2: Exchange Code for Tokens in Postman

1. **Open Postman** (or use cURL)

2. **Create new POST request** to:
```
https://login.microsoftonline.com/common/oauth2/v2.0/token
```

3. **Set Headers**:
```
Content-Type: application/x-www-form-urlencoded
```

4. **Set Body** (select "x-www-form-urlencoded"):
```
client_id=cad2e77a-a625-4e31-afad-80cb9f6272b8
client_secret=YOUR_CLIENT_SECRET_HERE
code=THE_CODE_YOU_COPIED
grant_type=authorization_code
redirect_uri=http://localhost:8000/auth/onedrive/callback
scope=offline_access Files.readwrite.all
```

5. **Click Send**

6. **In response**, find and copy:
```json
{
  "token_type": "Bearer",
  "scope": "Files.ReadWrite.All ...",
  "expires_in": 3599,
  "ext_expires_in": 3599,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "0.AS...THIS_IS_WHAT_YOU_NEED"  ← COPY THIS
}
```

### Step 3: Add to .env

```env
ONEDRIVE_REFRESH_TOKEN=0.AS...full-value...
```

---

## ✅ Solution 2: Use cURL Command

If you have cURL installed (Windows, Mac, Linux):

### Step 1: Get Authorization Code

**Same as above** - open browser and copy code from URL

### Step 2: Run cURL Command

```bash
curl -X POST https://login.microsoftonline.com/common/oauth2/v2.0/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=cad2e77a-a625-4e31-afad-80cb9f6272b8" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE_HERE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost:8000/auth/onedrive/callback" \
  -d "scope=offline_access Files.readwrite.all"
```

### Step 3: Copy refresh_token from response

---

## ✅ Solution 3: PowerShell Script (Windows)

Create `get-refresh-token.ps1`:

```powershell
# Configuration
$clientId = "cad2e77a-a625-4e31-afad-80cb9f6272b8"
$clientSecret = Read-Host "Enter your Client Secret"
$code = Read-Host "Enter the authorization code (paste from redirect URL)"
$redirectUri = "http://localhost:8000/auth/onedrive/callback"

# Exchange code for token
$tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

$body = @{
    client_id     = $clientId
    client_secret = $clientSecret
    code          = $code
    grant_type    = "authorization_code"
    redirect_uri  = $redirectUri
    scope         = "offline_access Files.readwrite.all"
}

try {
    $response = Invoke-RestMethod -Uri $tokenUrl -Method POST -Body $body
    
    Write-Host "✅ Token obtained!" -ForegroundColor Green
    Write-Host "Refresh Token:" -ForegroundColor Yellow
    Write-Host $response.refresh_token
    
    # Copy to clipboard
    $response.refresh_token | Set-Clipboard
    Write-Host "✅ Copied to clipboard!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
```

Run it:
```powershell
.\get-refresh-token.ps1
```

---

## 🆘 Troubleshoot Each Step

### Issue 1: Cannot Get Authorization Code

**Error**: Browser shows error when opening auth URL

**Solutions**:
1. Make sure CLIENT_ID is correct
2. Check URL encoding (spaces → %20)
3. Try different browser (Chrome, Firefox, Edge)
4. Clear browser cookies
5. Try incognito/private mode

**Test**:
```bash
# Verify client ID is correct
echo "cad2e77a-a625-4e31-afad-80cb9f6272b8"
```

---

### Issue 2: "Invalid Client" Error

**When**: Exchanging code for token

**Cause**: Wrong CLIENT_ID or CLIENT_SECRET

**Fix**:
1. Go to [portal.azure.com](https://portal.azure.com)
2. App registrations → Find your app
3. Copy EXACT values:
   - Client ID (application ID)
   - Client Secret (from Certificates & secrets)
4. No extra spaces or quotes

**Test in Postman**:
```
Use "Pre-request Script" to debug:
console.log("Client ID:", pm.environment.get("client_id"));
console.log("Secret:", pm.environment.get("client_secret"));
```

---

### Issue 3: "Invalid Grant" Error

**When**: Exchanging code

**Cause**: 
- Code expired (only valid 10 minutes)
- Code already used
- Wrong redirect_uri

**Fix**:
1. Get NEW authorization code (browser step)
2. Use IMMEDIATELY
3. Make sure redirect_uri matches exactly:
   ```
   http://localhost:8000/auth/onedrive/callback
   (no trailing slash, exact match)
   ```

---

### Issue 4: No refresh_token in Response

**When**: Response doesn't have refresh_token field

**Cause**: 
- Missing `offline_access` in scope
- Scope was changed during authorization

**Fix**:
1. Start over with NEW authorization code
2. Make sure scope includes: `offline_access Files.readwrite.all`
3. Check response has these fields:
   ```json
   {
     "access_token": "...",
     "refresh_token": "...",  ← This must be present
     "expires_in": 3599
   }
   ```

---

## 🧪 Test Your Credentials

Once you get the refresh token, test it:

### Create `test-token-validity.js`:

```javascript
import 'dotenv/config';
import { onedriveConfig } from './src/config/onedrive.js';

async function testToken() {
  console.log('Testing token...\n');
  
  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${onedriveConfig.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: onedriveConfig.clientId,
          client_secret: onedriveConfig.clientSecret,
          refresh_token: onedriveConfig.refreshToken,
          grant_type: 'refresh_token',
          scope: onedriveConfig.scope
        })
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Token is valid!');
      console.log('Access token:', data.access_token.substring(0, 50) + '...');
      console.log('Expires in:', data.expires_in, 'seconds');
      return true;
    } else {
      console.log('❌ Token invalid!');
      console.log('Error:', data.error);
      console.log('Details:', data.error_description);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

testToken();
```

Run:
```bash
cd backend
node test-token-validity.js
```

---

## 📋 Step-by-Step Checklist

Before requesting token:
- [ ] Logged in to Microsoft account
- [ ] Azure app created in portal
- [ ] Client Secret created and copied
- [ ] API permissions granted
- [ ] Client ID is: `cad2e77a-a625-4e31-afad-80cb9f6272b8`
- [ ] Client Secret is filled in

Getting the token:
- [ ] Authorization URL opened in browser
- [ ] Signed in successfully
- [ ] Permissions granted
- [ ] Redirected to callback URL
- [ ] Code copied from URL
- [ ] Code used within 10 minutes
- [ ] POST request made to token endpoint
- [ ] Got JSON response with refresh_token

After getting token:
- [ ] refresh_token value copied
- [ ] Added to `.env` file
- [ ] No extra spaces or quotes
- [ ] Backend restarted
- [ ] Token validity tested

---

## 🎯 Quick Reference

| What | Where to Get | Looks Like |
|-----|-------------|-----------|
| Authorization Code | Browser redirect URL | `M.R3_BAY...` (short) |
| Access Token | Token endpoint response | `eyJ0eXAi...` (long) |
| Refresh Token | Token endpoint response | `0.AS...` (very long) |
| Client Secret | Azure Certificates & secrets | Randomly generated |

---

## 💡 Pro Tips

1. **Don't share refresh token** - it has full file access
2. **Get new code each time** - codes expire in 10 minutes
3. **Use same redirect_uri** - must match exactly
4. **Test immediately** - tokens can expire
5. **Keep scope same** - don't change between steps

---

## ✅ Success Signs

When you have the refresh token:
- ✅ Long string starting with `0.AS`
- ✅ At least 500+ characters
- ✅ Contains letters, numbers, hyphens, underscores
- ✅ No quotes or special characters at start/end

---

## 🆘 Still Stuck?

### Try this command to test connection:

```bash
# Windows PowerShell
$response = Invoke-WebRequest -Uri "https://oauthplayground.azurewebsites.net/" -UseBasicParsing
if ($response.StatusCode -eq 200) { 
    Write-Host "✅ OAuth Playground is accessible"
} else {
    Write-Host "❌ Cannot reach OAuth Playground"
}
```

### Check browser console:
1. Open [oauthplayground.azurewebsites.net](https://oauthplayboard.azurewebsites.net)
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for error messages
5. Share the error text

### Last resort - Use Postman:
OAuth Playground is just a wrapper around Postman - do it directly with Postman or cURL!

---

## 📞 Next Steps

1. **Choose method**: Postman, cURL, or PowerShell
2. **Get authorization code** from browser
3. **Exchange for refresh token**
4. **Add to .env**
5. **Run test**
6. **Verify OneDrive connection**

**Which method would you like to use?**
- Postman (easiest for beginners)
- cURL (works everywhere)
- PowerShell (Windows)

Let me know what specific error you're seeing! 🚀
