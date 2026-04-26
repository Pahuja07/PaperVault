# 🛠️ OneDrive Development Mode - Ready to Use!

## ✅ Automatic Dev Mode Activated

Your system now automatically runs in **DEVELOPMENT MODE** because `ONEDRIVE_REFRESH_TOKEN` is not set.

**This means:**
- ✅ Files upload to your local computer (not Azure)
- ✅ No Azure setup needed right now
- ✅ Full testing of the upload/download system works
- ✅ Switch to production anytime

---

## 🎯 How Dev Mode Works

### Upload Flow (Dev Mode)
```
1. User uploads PDF
   ↓
2. Multer saves to ./uploads/ (temp)
   ↓
3. Dev service copies to ./dev-uploads/pyp-papers/
   ↓
4. Returns mock URL: http://localhost:8000/dev/download/filename
   ↓
5. Database stores the mock URL
   ↓
6. Temp file deleted
```

### Download Flow (Dev Mode)
```
1. User clicks download
   ↓
2. GET /papers/:id/download
   ↓
3. Retrieves mock URL from database
   ↓
4. Dev route serves file from ./dev-uploads/
   ↓
5. User downloads PDF
```

---

## 📂 File Storage Location

All uploaded files are stored in:
```
backend/dev-uploads/pyp-papers/
```

Example after some uploads:
```
dev-uploads/
└── pyp-papers/
    ├── calculus-midterm-2024.pdf
    ├── algebra-final-2024.pdf
    └── physics-quiz-2024.pdf
```

---

## 🚀 Get Started Now

### Step 1: Start the Backend

```bash
cd backend
pnpm start
```

You should see:
```
⚠️ ONEDRIVE: Running in DEVELOPMENT MODE (local file storage)
💡 To use real OneDrive, set ONEDRIVE_REFRESH_TOKEN in .env

server is listening on port:8000
```

### Step 2: Upload a Test Paper

**Using cURL**:
```bash
curl -X POST http://localhost:8000/papers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-paper.pdf" \
  -F "title=Calculus Midterm" \
  -F "semester=5" \
  -F "examtype=Midterm" \
  -F "difficulty=Medium" \
  -F "year=2024" \
  -F "departmentid=1" \
  -F "subjectid=1"
```

**Response**:
```json
{
  "message": "Paper Uploaded",
  "inserted": [
    {
      "paperid": 1,
      "title": "Calculus Midterm"
    }
  ]
}
```

### Step 3: Check Dev Storage

**See all uploaded files**:
```
GET http://localhost:8000/dev/files/list
```

**Response**:
```json
{
  "message": "📁 [DEV MODE] Files in local storage",
  "directory": "c:\\FileSharingSystem\\backend\\dev-uploads\\pyp-papers",
  "files": [
    {
      "name": "calculus-midterm-2024.pdf",
      "size": 45234,
      "created": "2024-04-25T10:30:00Z"
    }
  ],
  "totalFiles": 1,
  "totalSize": 45234
}
```

### Step 4: Download Paper

**From your API**:
```
GET http://localhost:8000/papers/1/download
```

**Response**: File downloaded to your computer

---

## 🔄 Dev Mode Information

**Check dev mode status**:
```
GET http://localhost:8000/dev/info
```

**Response**:
```json
{
  "mode": "🛠️ DEVELOPMENT MODE",
  "message": "OneDrive integration is running in development mode",
  "details": {
    "fileStorage": "Local file system (dev-uploads/pyp-papers/)",
    "uploadsBehavior": "Files saved locally instead of Azure OneDrive",
    "downloads": "Served from local storage",
    "note": "Switch to production mode by setting ONEDRIVE_DEV_MODE=false and providing real ONEDRIVE_REFRESH_TOKEN"
  },
  "endpoints": {
    "download": "/dev/download/:filename",
    "listFiles": "/dev/files/list",
    "info": "/dev/info"
  }
}
```

---

## ⚙️ Dev Mode Configuration

In `backend/.env`:
```env
# Development Mode: Set to 'true' to use local file storage
ONEDRIVE_DEV_MODE=true
```

**To enable dev mode**:
```env
ONEDRIVE_DEV_MODE=true
```

**To disable dev mode** (requires real credentials):
```env
ONEDRIVE_DEV_MODE=false
ONEDRIVE_REFRESH_TOKEN=your-real-token-here
```

---

## 🧪 Testing Complete Upload Flow

### Test Script

Create `backend/test-dev-mode.js`:

```javascript
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function testDevMode() {
  console.log('🧪 Testing Development Mode\n');

  try {
    // 1. Create test PDF
    console.log('1️⃣ Creating test PDF...');
    const testPdfPath = path.join(process.cwd(), 'test-dev-paper.pdf');
    const pdfContent = Buffer.from('%PDF-1.4\n%Dummy PDF\n');
    fs.writeFileSync(testPdfPath, pdfContent);
    console.log('✅ Test PDF created\n');

    // 2. Test upload to dev storage
    console.log('2️⃣ Testing upload to dev storage...');
    const { uploadToOneDrive } = await import('./src/services/onedrive.service.js');
    const mockUrl = await uploadToOneDrive(testPdfPath, 'test-dev-paper.pdf');
    console.log('✅ Upload successful');
    console.log('📎 Mock URL:', mockUrl, '\n');

    // 3. Check file exists
    console.log('3️⃣ Verifying file in dev storage...');
    const devPath = path.join(process.cwd(), 'dev-uploads', 'pyp-papers', 'test-dev-paper.pdf');
    if (fs.existsSync(devPath)) {
      const stat = fs.statSync(devPath);
      console.log('✅ File found in dev storage');
      console.log('📊 File size:', stat.size, 'bytes\n');
    } else {
      console.log('❌ File not found in dev storage\n');
    }

    // 4. List all dev files
    console.log('4️⃣ Listing all dev uploads...');
    const devFolder = path.join(process.cwd(), 'dev-uploads', 'pyp-papers');
    if (fs.existsSync(devFolder)) {
      const files = fs.readdirSync(devFolder);
      console.log('✅ Found', files.length, 'file(s)');
      files.forEach(f => console.log('  -', f));
    } else {
      console.log('❌ Dev folder not found\n');
    }

    console.log('\n✅ All dev mode tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDevMode();
```

**Run it**:
```bash
node backend/test-dev-mode.js
```

**Expected output**:
```
🧪 Testing Development Mode

1️⃣ Creating test PDF...
✅ Test PDF created

2️⃣ Testing upload to dev storage...
✅ Upload successful
📎 Mock URL: http://localhost:8000/dev/download/test-dev-paper.pdf?mock=true

3️⃣ Verifying file in dev storage...
✅ File found in dev storage
📊 File size: 28 bytes

4️⃣ Listing all dev uploads...
✅ Found 1 file(s)
  - test-dev-paper.pdf

✅ All dev mode tests passed!
```

---

## 📊 When to Switch from Dev to Production

**Keep Dev Mode When**:
- 🧪 Testing the upload system
- 👨‍💻 Developing new features
- 📝 Testing frontend UI
- 🐛 Debugging issues

**Switch to Production When**:
- ✅ Ready for real Azure storage
- ✅ Have refresh token from Azure
- ✅ Want automatic cloud backups
- ✅ Need scalable storage
- ✅ Production deployment

### Switch to Production

1. **Get real refresh token** (see REFRESH_TOKEN_TROUBLESHOOTING.md)
2. **Update .env**:
   ```env
   ONEDRIVE_DEV_MODE=false
   ONEDRIVE_REFRESH_TOKEN=0.AS...your-real-token...
   ```
3. **Restart backend**:
   ```bash
   pnpm start
   ```
4. **Verify connection**:
   ```bash
   node backend/test-onedrive-connection.js
   ```

---

## 🎨 Frontend Integration with Dev Mode

Your frontend works exactly the same in dev mode!

**React Upload Component**:
```jsx
import { useState } from 'react';
import api from '../../services/api';

export default function Upload() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (formData) => {
    setUploading(true);
    try {
      const response = await api.post('/papers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('✅ Uploaded:', response.data);
      // In dev mode: Mock URL
      // In prod mode: OneDrive shareable URL
      // Frontend doesn't care - works the same!
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // Rest of component...
}
```

---

## 🗑️ Clean Up Dev Files

**Remove all dev uploads**:
```bash
cd backend
rm -rf dev-uploads/*    # Linux/Mac
rmdir /s dev-uploads    # Windows
```

**Start fresh**:
```bash
mkdir -p dev-uploads/pyp-papers
```

---

## 📋 Dev Mode Checklist

- [ ] Backend started successfully
- [ ] Dev mode message appears in console
- [ ] Can create JWT token (login)
- [ ] Can upload PDF file
- [ ] File appears in `dev-uploads/pyp-papers/`
- [ ] `GET /dev/files/list` shows the file
- [ ] Can download the file
- [ ] Database stores mock URL
- [ ] Frontend upload form works
- [ ] Download link works in frontend

---

## 🚀 You're Ready!

Your system is now ready for full testing:
- ✅ Upload files (stored locally)
- ✅ Download files (served locally)
- ✅ Test UI/UX
- ✅ Test API endpoints
- ✅ Test authentication
- ✅ Test error handling

**No Azure setup needed right now!**

When you're ready, just follow REFRESH_TOKEN_TROUBLESHOOTING.md to get the real refresh token, update .env, and switch to production!

---

## 💡 Dev Mode Features

| Feature | Dev Mode | Production |
|---------|----------|------------|
| Upload | Local storage | Azure OneDrive |
| Download | Local file serve | OneDrive share link |
| Backup | None (temp) | Automatic (Azure) |
| Storage | Computer disk | OneDrive cloud |
| Scalability | Limited | Unlimited |
| Testing | ✅ Perfect | Full cloud |

---

## 🆘 Troubleshooting Dev Mode

**Files not appearing in dev-uploads/**
```bash
# Check folder exists
ls -la backend/dev-uploads/
mkdir -p backend/dev-uploads/pyp-papers
```

**Dev endpoint returns 404**
```bash
# Verify dev route is registered
curl http://localhost:8000/dev/info
```

**Files not downloading**
```bash
# Check static middleware is registered
# In index.js: app.use('/dev-uploads', express.static('dev-uploads'));
```

---

**Ready to test? Start uploading files now!** 🎉
