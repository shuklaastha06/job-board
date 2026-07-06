@echo off
echo ==============================================
echo   Job Board Setup and Runner Script
echo ==============================================

echo 1. Installing Node modules (this may take a minute)...
call npm install

echo.
echo 2. Setting up environment variables...
if not exist .env (
    echo DATABASE_URL="postgresql://postgres:password@localhost:5432/jobboard" > .env
    echo NEXTAUTH_SECRET="your_super_secret_string" >> .env
    echo NEXTAUTH_URL="http://localhost:3000" >> .env
    echo Created .env file. Please make sure you have PostgreSQL running!
) else (
    echo .env file already exists.
)

echo.
echo 3. Pushing database schema to PostgreSQL...
call npx prisma db push

echo.
echo 3.5. Populating database with dummy data...
call npm run seed

echo.
echo 4. Starting the backend and frontend development server...
call npm run dev

pause
