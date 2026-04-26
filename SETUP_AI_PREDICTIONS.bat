@echo off
echo ========================================
echo AI Predictions Feature Setup Script
echo ========================================
echo.

echo [1/5] Installing Backend Dependencies...
cd backend
call pnpm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Backend dependencies installed
echo.

echo [2/5] Installing Frontend Dependencies...
cd pyp-website\pyp-website
call pnpm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..\..
echo ✓ Frontend dependencies installed
echo.

echo [3/5] Running Database Migrations...
cd backend
call pnpm db:push
if errorlevel 1 (
    echo ERROR: Failed to run database migrations
    echo Please ensure PostgreSQL is running and DATABASE_URL is configured
    pause
    exit /b 1
)
cd ..
echo ✓ Database migrations completed
echo.

echo [4/5] Configuration Check...
echo.
echo ⚠ IMPORTANT: Please configure your OpenAI API key
echo Edit the file: backend\.env
echo Add this line: OPENAI_API_KEY=your-actual-api-key-here
echo.
echo You can get an API key from: https://platform.openai.com/api-keys
echo.
pause

echo [5/5] Setup Complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Add your OpenAI API key to backend\.env
echo 2. Start the backend: cd backend ^&^& pnpm start
echo 3. Start the frontend: cd pyp-website\pyp-website ^&^& pnpm dev
echo 4. Navigate to http://localhost:5173/predictions
echo ========================================
echo.
echo For detailed instructions, see: AI_PREDICTIONS_SETUP.md
echo ========================================
pause