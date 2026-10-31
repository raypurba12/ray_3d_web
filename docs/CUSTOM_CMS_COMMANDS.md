# Custom CMS - Quick Commands Reference

Quick reference untuk daily operations ketika develop custom CMS.

---

## 📁 Project Structure

```
d:\FORTOFOLIO\
├── portfolio-api/          Backend API (Express + Prisma)
├── portfolio-admin/        Admin Dashboard (React)
└── raypurba-3d/           Portfolio Frontend (React + Three.js)
```

---

## 🚀 Development Commands

### Backend API

```powershell
# Navigate to backend
cd d:\FORTOFOLIO\portfolio-api

# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run TypeScript compiler check
npx tsc --noEmit
```

### Admin Dashboard

```powershell
# Navigate to admin
cd d:\FORTOFOLIO\portfolio-admin

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Portfolio Frontend

```powershell
# Navigate to portfolio
cd d:\FORTOFOLIO\raypurba-3d

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🗄️ Database Commands (Prisma)

### Schema & Migrations

```powershell
# Navigate to backend
cd d:\FORTOFOLIO\portfolio-api

# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name descriptive_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Database GUI

```powershell
# Open Prisma Studio (visual database editor)
npm run prisma:studio
# Opens at http://localhost:5555
```

### Seeding

```powershell
# Seed database with sample data
npm run prisma:seed

# Or manually
npx ts-node prisma/seed.ts
```

---

## 🗃️ MySQL Direct Commands

### Connect to MySQL

```powershell
# Connect to MySQL
mysql -u root -p

# Connect to specific database
mysql -u root -p portfolio_cms
```

### Common MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Use portfolio database
USE portfolio_cms;

-- Show all tables
SHOW TABLES;

-- Describe table structure
DESCRIBE projects;

-- Show table data
SELECT * FROM projects;
SELECT * FROM users LIMIT 10;

-- Count records
SELECT COUNT(*) FROM projects;

-- Check database size
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'portfolio_cms'
GROUP BY table_schema;

-- Exit MySQL
EXIT;
```

### Database Backup & Restore

```powershell
# Backup database
mysqldump -u root -p portfolio_cms > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql

# Restore database
mysql -u root -p portfolio_cms < backup_20261030_120000.sql
```

---

## 🔐 Authentication Testing

### Using PowerShell (Invoke-WebRequest)

```powershell
# Test login
$loginBody = @{
    email = "admin@raypurba.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = ($response.Content | ConvertFrom-Json).data.token
Write-Host "Token: $token"

# Test protected endpoint
Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/me" `
    -Headers @{ Authorization = "Bearer $token" }
```

### Using curl

```powershell
# Test login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@raypurba.com\",\"password\":\"admin123\"}'

# Test protected endpoint (replace TOKEN)
curl -X GET http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer TOKEN"
```

---

## 📡 API Testing

### Test All Endpoints

```powershell
# Health check
curl http://localhost:5000/api/health

# Get all projects (public)
curl http://localhost:5000/api/projects

# Get single project
curl http://localhost:5000/api/projects/PROJECT_ID

# Get all technologies
curl http://localhost:5000/api/technologies

# Get all experiences
curl http://localhost:5000/api/experiences

# Get profile
curl http://localhost:5000/api/profile
```

### Create Data (Protected)

```powershell
# First, get token
$token = "YOUR_JWT_TOKEN"

# Create project
$projectBody = @{
    title = "New Project"
    description = "Project description"
    image = "https://example.com/image.jpg"
    featured = $true
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/projects" `
    -Method POST `
    -Body $projectBody `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" }
```

---

## 📤 File Upload Testing

```powershell
# Upload image
$token = "YOUR_JWT_TOKEN"
$file = "C:\path\to\image.jpg"

curl -X POST http://localhost:5000/api/upload `
  -H "Authorization: Bearer $token" `
  -F "file=@$file"
```

---

## 🔧 Troubleshooting Commands

### Check Services Status

```powershell
# Check if MySQL is running
Get-Service MySQL*

# Start MySQL service
Start-Service MySQL80

# Stop MySQL service
Stop-Service MySQL80

# Check ports in use
netstat -ano | findstr ":5000"
netstat -ano | findstr ":3306"
netstat -ano | findstr ":5173"

# Kill process by PID
taskkill /PID <PID> /F
```

### Clear Node Modules & Reinstall

```powershell
# Backend
cd d:\FORTOFOLIO\portfolio-api
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Admin
cd d:\FORTOFOLIO\portfolio-admin
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Fix Prisma Issues

```powershell
# Regenerate Prisma Client
npx prisma generate

# Reset database and reapply migrations
npx prisma migrate reset

# Force push schema to database (⚠️ data loss)
npx prisma db push --force-reset
```

### View Logs

```powershell
# Backend logs (if using pm2 in production)
pm2 logs portfolio-api

# Check backend process
Get-Process node

# Backend logs in development
# Just check terminal where `npm run dev` is running
```

---

## 🧹 Clean Up Commands

### Remove Build Artifacts

```powershell
# Backend
cd d:\FORTOFOLIO\portfolio-api
Remove-Item -Recurse -Force dist

# Admin
cd d:\FORTOFOLIO\portfolio-admin
Remove-Item -Recurse -Force dist

# Portfolio
cd d:\FORTOFOLIO\raypurba-3d
Remove-Item -Recurse -Force dist
```

### Remove Uploaded Files

```powershell
# Backend uploads folder
cd d:\FORTOFOLIO\portfolio-api
Remove-Item -Recurse -Force uploads\*
```

---

## 📦 Package Management

### Install Dependencies

```powershell
# Install specific package
npm install package-name

# Install dev dependency
npm install -D package-name

# Update all packages
npm update

# Check outdated packages
npm outdated

# Audit security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🔄 Git Workflow

### Daily Workflow

```powershell
# Backend
cd d:\FORTOFOLIO\portfolio-api
git status
git add .
git commit -m "feat: add new endpoint"
git push origin main

# Admin
cd d:\FORTOFOLIO\portfolio-admin
git status
git add .
git commit -m "feat: add project form"
git push origin main

# Portfolio
cd d:\FORTOFOLIO\raypurba-3d
git status
git add src/
git commit -m "feat: integrate CMS API"
git push origin main
```

### Create Feature Branch

```powershell
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature
# Create PR on GitHub
```

---

## 🚀 Deployment Commands

### Backend (Railway)

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open
```

### Admin & Portfolio (Vercel)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

---

## 🔍 Environment Variables

### Check Current Environment

```powershell
# Show all env variables
Get-ChildItem Env:

# Check specific variable
$env:NODE_ENV
$env:DATABASE_URL
```

### Load .env File (for testing)

```powershell
# Manually load .env
Get-Content .env | ForEach-Object {
    $name, $value = $_.Split('=', 2)
    Set-Item -Path "Env:$name" -Value $value
}
```

---

## 📊 Performance Testing

### Load Testing with Apache Bench

```powershell
# Install Apache Bench (comes with XAMPP)
# Or use https://httpd.apache.org/download.cgi

# Test API endpoint
ab -n 1000 -c 10 http://localhost:5000/api/projects

# With authentication
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/projects
```

---

## 🧪 Testing

### Unit Tests

```powershell
# Backend (if you add tests later)
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Integration Tests

```powershell
# E2E tests (if you add Playwright/Cypress)
npm run test:e2e
```

---

## 📝 Useful One-Liners

```powershell
# Count lines of code
Get-ChildItem -Recurse -Include *.ts,*.tsx | Get-Content | Measure-Object -Line

# Find TODO comments
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "TODO"

# Check TypeScript errors
npx tsc --noEmit

# Format code with Prettier
npx prettier --write "src/**/*.{ts,tsx}"

# Lint code
npx eslint "src/**/*.{ts,tsx}"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check disk space
Get-PSDrive

# Find large files
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 10MB } | Sort-Object Length -Descending
```

---

## 🆘 Emergency Commands

### System Completely Broken?

```powershell
# 1. Stop all servers (Ctrl+C in each terminal)

# 2. Reset database
cd d:\FORTOFOLIO\portfolio-api
npx prisma migrate reset
npm run prisma:seed

# 3. Clear all node_modules
cd d:\FORTOFOLIO\portfolio-api
Remove-Item -Recurse -Force node_modules
npm install

cd d:\FORTOFOLIO\portfolio-admin
Remove-Item -Recurse -Force node_modules
npm install

# 4. Regenerate Prisma Client
cd d:\FORTOFOLIO\portfolio-api
npx prisma generate

# 5. Restart everything
cd d:\FORTOFOLIO\portfolio-api
npm run dev

# New terminal
cd d:\FORTOFOLIO\portfolio-admin
npm run dev
```

### Can't Login to Admin?

```powershell
# Reset admin password via database
cd d:\FORTOFOLIO\portfolio-api

# Open MySQL
mysql -u root -p portfolio_cms

# Update password (hash for "admin123")
UPDATE users SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVSpLHR.aze' WHERE email = 'admin@raypurba.com';
EXIT;

# Or use seed script
npm run prisma:seed
```

---

## 📚 Documentation Commands

### Generate API Documentation

```powershell
# If you add Swagger/OpenAPI later
npm run docs:generate
```

### Generate Database Schema Diagram

```powershell
# Using Prisma ERD
npx prisma generate
# Then use https://prisma-erd.simonknott.de/
```

---

## 🎯 Daily Checklist

### Morning Startup

```powershell
# 1. Start MySQL
Start-Service MySQL80

# 2. Pull latest code
cd d:\FORTOFOLIO\portfolio-api
git pull

cd d:\FORTOFOLIO\portfolio-admin
git pull

# 3. Start backend
cd d:\FORTOFOLIO\portfolio-api
npm run dev

# 4. Start admin (new terminal)
cd d:\FORTOFOLIO\portfolio-admin
npm run dev

# 5. Start portfolio (new terminal)
cd d:\FORTOFOLIO\raypurba-3d
npm run dev
```

### Before Committing

```powershell
# 1. Run type check
npx tsc --noEmit

# 2. Run linter
npx eslint src/

# 3. Test API endpoints
curl http://localhost:5000/api/projects

# 4. Check git status
git status

# 5. Review changes
git diff

# 6. Commit
git add .
git commit -m "descriptive message"
git push
```

---

## 🔗 Important URLs

```
Backend API:        http://localhost:5000
Admin Dashboard:    http://localhost:5173
Portfolio Site:     http://localhost:5174
Prisma Studio:      http://localhost:5555
MySQL Port:         3306
```

---

## 📞 Quick Help

| Issue | Command |
|-------|---------|
| MySQL not running | `Start-Service MySQL80` |
| Port in use | `netstat -ano \| findstr :PORT` then `taskkill /PID <PID> /F` |
| Prisma out of sync | `npx prisma generate` |
| Can't login | `npm run prisma:seed` |
| API not responding | Check terminal logs, restart with `npm run dev` |
| Database error | `npx prisma migrate reset` |
| npm install fails | Delete `node_modules`, `package-lock.json`, run `npm install` |

---

*Keep this file open in a tab for quick reference during development!*
