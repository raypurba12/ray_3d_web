# Portfolio CMS — Quick Command Reference

## 🚀 Setup & Installation

```powershell
# 1. Create Strapi
cd D:\FORTOFOLIO\portfolio-cms
npx create-strapi-app@latest backend --quickstart --no-run

# 2. Install MySQL
cd backend
npm install mysql2

# 3. Generate secret keys (run 5 times)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 4. Start development server
npm run develop
```

---

## 🗄️ MySQL Commands

```sql
-- Create database
CREATE DATABASE portfolio_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'portfolio_admin'@'localhost' IDENTIFIED BY 'Portfolio2026!';

-- Grant privileges
GRANT ALL PRIVILEGES ON portfolio_cms.* TO 'portfolio_admin'@'localhost';
FLUSH PRIVILEGES;

-- Check connection
SHOW DATABASES;
USE portfolio_cms;
SHOW TABLES;
```

---

## 🔧 Strapi Commands

```powershell
# Development mode (auto-reload)
npm run develop

# Build for production
npm run build

# Start production
npm start

# Reset admin password
npm run strapi admin:reset-user-password --email=admin@raypurba.com --password=NewPass123

# Create admin user (if needed)
npm run strapi admin:create-user -- --email=admin@raypurba.com --password=Admin123! --firstname=Ray --lastname=Purba
```

---

## 📡 API Endpoints

### Projects
```
GET /api/projects?populate=*
GET /api/projects/:id?populate=*
GET /api/projects?filters[status][$eq]=published&populate=*
POST /api/projects (authenticated)
PUT /api/projects/:id (authenticated)
DELETE /api/projects/:id (authenticated)
```

### Technologies
```
GET /api/technologies?populate=*
GET /api/technologies/:id?populate=*
```

### Experiences
```
GET /api/experiences?populate=*&sort=startDate:desc
GET /api/experiences/:id?populate=*
```

### Testimonials
```
GET /api/testimonials?filters[status][$eq]=published
```

### Profile
```
GET /api/profile?populate=*
```

---

## 🧪 Test API

```powershell
# Using curl (PowerShell)
Invoke-RestMethod -Uri "http://localhost:1337/api/projects?populate=*" -Headers @{ "Authorization" = "Bearer YOUR_TOKEN" }

# Or open in browser:
http://localhost:1337/api/projects?populate=*
```

---

## 📦 Frontend Integration

```powershell
# In portfolio frontend folder
cd D:\FORTOFOLIO\raypurba-3d

# Install axios
npm install axios

# Create .env
echo "VITE_CMS_URL=http://localhost:1337" >> .env
echo "VITE_CMS_TOKEN=your_api_token" >> .env

# Start dev server
npm run dev
```

---

## 🔑 Environment Variables Template

```bash
# Strapi Backend (.env)
HOST=0.0.0.0
PORT=1337

DATABASE_CLIENT=mysql2
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=portfolio_cms
DATABASE_USERNAME=portfolio_admin
DATABASE_PASSWORD=Portfolio2026!
DATABASE_SSL=false

APP_KEYS=KEY1,KEY2,KEY3,KEY4
API_TOKEN_SALT=RANDOM_KEY
ADMIN_JWT_SECRET=RANDOM_KEY
TRANSFER_TOKEN_SALT=RANDOM_KEY
JWT_SECRET=RANDOM_KEY

# Optional: Cloudflare R2
CF_ACCESS_KEY_ID=your_key
CF_SECRET_ACCESS_KEY=your_secret
CF_ENDPOINT=https://account.r2.cloudflarestorage.com
CF_BUCKET=portfolio-media
CF_PUBLIC_URL=https://media.raypurba.com
```

```bash
# Frontend (.env)
VITE_CMS_URL=http://localhost:1337
VITE_CMS_TOKEN=your_read_only_token_here
```

---

## 🐛 Troubleshooting Commands

```powershell
# Check MySQL service status
net start | findstr MySQL

# Start MySQL service
net start MySQL80

# Stop MySQL service
net stop MySQL80

# Check Node version (need 18+)
node --version

# Clear Strapi cache
cd backend
rmdir /s /q .cache
rmdir /s /q build
npm run build

# Check port usage
netstat -ano | findstr :1337
```

---

## 📊 Useful SQL Queries

```sql
-- See all tables
USE portfolio_cms;
SHOW TABLES;

-- Count projects
SELECT COUNT(*) FROM projects;

-- See all published projects
SELECT id, title, status FROM projects WHERE status = 'published';

-- Clear all data (careful!)
TRUNCATE TABLE projects;

-- Backup database
mysqldump -u portfolio_admin -p portfolio_cms > backup.sql

-- Restore database
mysql -u portfolio_admin -p portfolio_cms < backup.sql
```

---

## 🚀 Deploy Production

### Option 1: Railway

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Add MySQL
railway add -d mysql

# Deploy
railway up
```

### Option 2: VPS (Ubuntu)

```bash
# SSH to server
ssh user@your-server.com

# Install Node 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server

# Clone & setup
git clone your-repo
cd backend
npm install
npm run build

# Install PM2
sudo npm install -g pm2

# Start
pm2 start npm --name "cms" -- start
pm2 save
pm2 startup
```

---

## 📝 Content Management Workflow

1. **Development** → Add content di localhost admin
2. **Export** → Export content via API atau SQL backup
3. **Production** → Import ke production database
4. **Frontend** → Deploy frontend yang fetch dari production CMS

---

## 🎯 Quick Checklist

Setup:
- [ ] MySQL installed & running
- [ ] Database created
- [ ] Strapi installed
- [ ] database.js configured
- [ ] .env secrets generated
- [ ] Strapi running (npm run develop)

Content Types:
- [ ] Project collection created
- [ ] Technology collection created
- [ ] Experience collection created
- [ ] Testimonial collection created
- [ ] Tag collection created
- [ ] Profile single type created
- [ ] Relations setup

API:
- [ ] Public permissions enabled
- [ ] API token generated
- [ ] Test API endpoints working

Frontend:
- [ ] CMS service created (cms.ts)
- [ ] .env configured
- [ ] Test fetch working

---

**Ready to launch! 🚀**
