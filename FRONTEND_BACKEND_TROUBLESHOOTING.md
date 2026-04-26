# Frontend-Backend Connection Troubleshooting Guide

## 🔌 Complete Guide to Fix Connection Issues

This guide will help you resolve any issues connecting your React frontend with the Node.js backend.

## 🚀 Quick Connection Test

### Step 1: Check if Backend is Running

Open terminal and run:
```bash
cd backend
pnpm start
```

You should see:
```
server is listening on port:8000
```

### Step 2: Test Backend API

Open browser and visit:
```
http://localhost:8000/department
```

You should see JSON response with departments.

### Step 3: Check Frontend Configuration

In `pyp-website/pyp-website/.env`:
```env
VITE_API_URL=http://localhost:8000
```

### Step 4: Start Frontend

Open new terminal:
```bash
cd pyp-website/pyp-website
pnpm dev
```

Visit: `http://localhost:5173`

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" Error

**Symptoms:**
- Console shows: `Failed to fetch`
- AI Predictions page shows loading forever
- Network tab shows failed requests

**Solutions:**

1. **Check Backend is Running**
   ```bash
   # Terminal 1
   cd backend
   pnpm start
   # Should show: "server is listening on port:8000"
   ```

2. **Verify Port Number**
   ```bash
   # Check if port 8000 is in use
   netstat -ano | findstr :8000
   ```

3. **Test Backend Directly**
   ```bash
   # In browser or curl
   curl http://localhost:8000/department
   ```

4. **Check Frontend .env**
   ```env
   # pyp-website/pyp-website/.env
   VITE_API_URL=http://localhost:8000
   ```

5. **Restart Frontend**
   ```bash
   # Stop frontend (Ctrl+C)
   cd pyp-website/pyp-website
   pnpm dev
   ```

### Issue 2: CORS Errors

**Symptoms:**
- Console shows: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solutions:**

1. **Check Backend CORS Configuration**
   
   Your `backend/index.js` should have:
   ```javascript
   import cors from 'cors'
   app.use(cors())
   ```

2. **If CORS still fails, add specific origin:**
   ```javascript
   const corsOptions = {
     origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
     credentials: true
   }
   app.use(cors(corsOptions))
   ```

3. **Clear Browser Cache**
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Reload page

### Issue 3: AI Predictions Not Loading

**Symptoms:**
- AI Predictions page shows but no data loads
- Filters don't work
- Charts don't appear

**Solutions:**

1. **Check OpenAI API Key**
   ```env
   # backend/.env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

2. **Test AI Endpoint**
   ```bash
   # First get a department ID
   curl http://localhost:8000/department
   
   # Then test AI endpoint
   curl "http://localhost:8000/ai/skit-info"
   ```

3. **Check Database Tables**
   ```bash
   cd backend
   pnpm db:push
   ```

4. **Verify Frontend API Calls**
   
   Open browser DevTools → Network tab
   - Look for failed requests
   - Check request URLs
   - Verify response status codes

### Issue 4: "Import not found" Errors

**Symptoms:**
- Frontend shows: `Failed to resolve import "recharts"`
- Or similar import errors

**Solutions:**

1. **Install Missing Dependencies**
   ```bash
   cd pyp-website/pyp-website
   pnpm install
   ```

2. **Check package.json**
   ```json
   {
     "dependencies": {
       "react": "^18.3.1",
       "react-dom": "^18.3.1",
       "react-router-dom": "^6.26.1",
       "lucide-react": "^0.383.0",
       "recharts": "^2.12.0"
     }
   }
   ```

3. **Delete node_modules and reinstall**
   ```bash
   cd pyp-website/pyp-website
   rm -rf node_modules
   rm package-lock.json
   pnpm install
   ```

### Issue 5: Database Connection Errors

**Symptoms:**
- Backend crashes on startup
- Error: `connection refused to postgres://...`
- API returns 500 errors

**Solutions:**

1. **Check PostgreSQL is Running**
   ```bash
   # Windows
   services.msc
   # Look for "PostgreSQL" service
   
   # Or check if port 5432 is listening
   netstat -ano | findstr :5432
   ```

2. **Verify Database URL**
   ```env
   # backend/.env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

3. **Test Database Connection**
   ```bash
   # Using psql
   psql -U username -d database_name
   
   # Or use Drizzle Studio
   cd backend
   pnpm db:studio
   ```

4. **Run Migrations**
   ```bash
   cd backend
   pnpm db:push
   ```

## 🔍 Debugging Steps

### Step 1: Check Console Logs

**Backend Console:**
```bash
cd backend
pnpm start
```
Look for:
- ✅ "server is listening on port:8000"
- ❌ Any error messages
- ❌ Database connection errors

**Frontend Console:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - ❌ "Failed to fetch"
   - ❌ CORS errors
   - ❌ Import errors

### Step 2: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for:
   - ❌ Failed requests (red)
   - ❌ 404 errors
   - ❌ 500 errors
   - ✅ Successful requests (green, status 200)

### Step 3: Test API Endpoints Manually

**Test Department Endpoint:**
```bash
curl http://localhost:8000/department
```

Expected response:
```json
{
  "departments": [
    {
      "departmentid": "...",
      "name": "Computer Science",
      ...
    }
  ]
}
```

**Test AI Info Endpoint:**
```bash
curl http://localhost:8000/ai/skit-info
```

Expected response:
```json
{
  "success": true,
  "branches": [...],
  "commonSubjects": [...]
}
```

### Step 4: Verify Environment Variables

**Backend .env (backend/.env):**
```env
DATABASE_URL=postgresql://JAZZ:lilu123@localhost:5448/FILES
JWT_SECRET=your-secret-key-change-this-in-production
PORT=8000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
OPENAI_API_KEY=sk-your-openai-api-key
ONEDRIVE_CLIENT_ID=your-client-id
ONEDRIVE_CLIENT_SECRET=your-client-secret
ONEDRIVE_TENANT_ID=your-tenant-id
ONEDRIVE_REFRESH_TOKEN=your-refresh-token
ONEDRIVE_REDIRECT_URI=http://localhost:8000/auth/onedrive/callback
```

**Frontend .env (pyp-website/pyp-website/.env):**
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=PYP Website
```

### Step 5: Check Port Conflicts

**Windows:**
```cmd
netstat -ano | findstr :8000
netstat -ano | findstr :5173
netstat -ano | findstr :5432
```

If port is in use, either:
1. Kill the process using that port
2. Change the port in your application

**Change Backend Port:**
```env
# backend/.env
PORT=8001  # Use different port
```

**Change Frontend Port:**
```bash
# pyp-website/pyp-website/package.json
"scripts": {
  "dev": "vite --port 3000"
}
```

## 🛠️ Manual Testing Checklist

### Backend Tests

- [ ] Backend starts without errors
- [ ] Can access `http://localhost:8000/department`
- [ ] Can access `http://localhost:8000/ai/skit-info`
- [ ] Database connection works
- [ ] OpenAI API key is configured

### Frontend Tests

- [ ] Frontend starts without errors
- [ ] Can access `http://localhost:5173`
- [ ] Can navigate to AI Predictions page
- [ ] Filters load departments
- [ ] No console errors

### Integration Tests

- [ ] Select department and semester
- [ ] Predictions load (or show "no papers" message)
- [ ] Charts render correctly
- [ ] Can rate predictions (if logged in)

## 📊 Expected Behavior

### Successful Connection Flow

1. **User visits `/predictions`**
2. **Frontend loads** → Shows filter panel
3. **Frontend fetches departments** → `GET /department`
4. **Frontend fetches SKIT info** → `GET /ai/skit-info`
5. **User selects filters** → Department + Semester
6. **Frontend requests predictions** → `GET /ai/predictions/...`
7. **Backend generates/fetches predictions**
8. **Frontend displays results** → Topics, questions, charts

### What Each Component Does

**Frontend (React):**
- Displays UI components
- Makes API calls to backend
- Shows loading states
- Handles user interactions
- Renders charts with Recharts

**Backend (Node.js + Express):**
- Receives API requests
- Queries PostgreSQL database
- Calls OpenAI API for predictions
- Returns JSON responses
- Handles file uploads to OneDrive

**Database (PostgreSQL):**
- Stores paper metadata
- Stores predictions
- Stores user data
- Stores department/subject info

**OpenAI API:**
- Analyzes question patterns
- Generates predictions
- Provides confidence scores
- Creates study recommendations

## 🔧 Quick Fix Commands

### Reset Everything

```bash
# 1. Stop all processes (Ctrl+C in all terminals)

# 2. Clean install backend
cd backend
rm -rf node_modules
pnpm install
pnpm db:push

# 3. Clean install frontend
cd ../pyp-website/pyp-website
rm -rf node_modules
pnpm install

# 4. Start backend
cd ../../backend
pnpm start

# 5. In new terminal, start frontend
cd pyp-website/pyp-website
pnpm dev
```

### Test Specific Features

**Test Database:**
```bash
cd backend
pnpm db:studio
```

**Test Email:**
```bash
cd backend
node test-email.js
```

**Test OneDrive:**
```bash
cd backend
node test-onedrive.js
```

**Test AI Prediction:**
```bash
cd backend
node test-ai.js
```

## 📞 Getting More Help

If you're still stuck:

1. **Check Logs**
   - Backend console output
   - Frontend browser console
   - Network tab in DevTools

2. **Verify Configuration**
   - All .env files are correct
   - All dependencies installed
   - All services running

3. **Test Incrementally**
   - Start with backend only
   - Test each API endpoint
   - Then add frontend
   - Test each page

4. **Search for Error Messages**
   - Copy exact error message
   - Search on Google/Stack Overflow
   - Check GitHub issues

5. **Ask for Help**
   - Provide exact error messages
   - Include relevant code snippets
   - Describe what you've tried

---

**Remember**: Most connection issues are due to:
1. Backend not running
2. Wrong API URL in frontend
3. CORS configuration
4. Port conflicts
5. Missing environment variables

Check these first before diving deeper!