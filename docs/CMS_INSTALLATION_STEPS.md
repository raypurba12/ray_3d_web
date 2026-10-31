# Portfolio CMS — Step-by-Step Installation Guide

## Prerequisites

✅ Node.js 18+ installed  
✅ MySQL 8.0+ installed or PlanetScale account  
✅ Git installed  

---

## Step 1: Create Strapi Backend

```powershell
# Buka terminal di folder ini
cd D:\FORTOFOLIO\portfolio-cms

# Create Strapi project (tunggu 3-5 menit)
npx create-strapi-app@latest backend --quickstart --no-run

# Masuk ke folder backend
cd backend
```

---

## Step 2: Install MySQL Driver

```powershell
npm install mysql2
```

---

## Step 3: Setup MySQL Database

### Option A: Local MySQL

```powershell
# Buka MySQL Command Line
mysql -u root -p
```

```sql
-- Jalankan di MySQL console
CREATE DATABASE portfolio_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'portfolio_admin'@'localhost' IDENTIFIED BY 'Portfolio2026!';

GRANT ALL PRIVILEGES ON portfolio_cms.* TO 'portfolio_admin'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

### Option B: PlanetScale (Cloud)

1. Visit: https://planetscale.com/
2. Sign up / Login
3. Create New Database → `portfolio-cms`
4. Go to "Connect" → Copy connection details

---

## Step 4: Configure Strapi

**Edit file: `backend/config/database.js`**

Replace isi file dengan:

```javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'mysql2',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'portfolio_cms'),
      user: env('DATABASE_USERNAME', 'portfolio_admin'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
    },
    debug: false,
    pool: {
      min: 2,
      max: 10,
    },
  },
});
```

---

## Step 5: Environment Variables

**Edit file: `backend/.env`**

```bash
HOST=0.0.0.0
PORT=1337

# MySQL Connection
DATABASE_CLIENT=mysql2
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=portfolio_cms
DATABASE_USERNAME=portfolio_admin
DATABASE_PASSWORD=Portfolio2026!
DATABASE_SSL=false

# Generate keys dengan command:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

APP_KEYS=GENERATE_KEY_1,GENERATE_KEY_2,GENERATE_KEY_3,GENERATE_KEY_4
API_TOKEN_SALT=GENERATE_RANDOM_KEY
ADMIN_JWT_SECRET=GENERATE_RANDOM_KEY
TRANSFER_TOKEN_SALT=GENERATE_RANDOM_KEY
JWT_SECRET=GENERATE_RANDOM_KEY
```

**Generate Keys:**
```powershell
# Jalankan 5x untuk generate 5 keys
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy hasil keys ke .env file.

---

## Step 6: Start Strapi

```powershell
npm run develop
```

**Wait 30-60 seconds...**

Browser akan auto-open ke: http://localhost:1337/admin

---

## Step 7: Create Admin Account

**First-time setup form:**
- First name: Ray
- Last name: Purba
- Email: admin@raypurba.com
- Password: (buat password kuat, min 8 karakter)

Click **Let's start**

---

## Step 8: Build Content Types

### 8.1 Create "Project" Collection

1. Click **Content-Type Builder** (sidebar)
2. Click **Create new collection type**
3. Display name: `Project`
4. Click **Continue**

**Add Fields:**

Click **Add another field** untuk setiap field:

| Field | Type | Settings |
|-------|------|----------|
| title | Text | Required ✅, Unique ✅ |
| slug | UID | Attached field: `title`, Required ✅ |
| description | Text (Long text) | Required ✅ |
| longDescription | Rich text (Markdown) | |
| status | Enumeration | Values: `draft`, `published`. Default: `draft` |
| featured | Boolean | Default value: `false` |
| thumbnail | Media (Single media) | Required ✅ |
| images | Media (Multiple media) | |
| videoPreview | Media (Single media) | |
| metric | Text | (e.g. "60 FPS • 85% Lower") |
| liveUrl | Text | |
| githubUrl | Text | |
| caseStudyUrl | Text | |
| displayOrder | Number (integer) | Default: `0` |
| publishedAt | Date (datetime) | |

Click **Save** setelah setiap field.

**After all fields added**, click **Finish** → **Save**.

---

### 8.2 Create "Technology" Collection

Repeat process:

1. **Create new collection type** → `Technology`

| Field | Type | Settings |
|-------|------|----------|
| name | Text | Required ✅, Unique ✅ |
| slug | UID | Attached field: `name`, Required ✅ |
| category | Enumeration | Values: `language`, `framework`, `tool`, `platform` |
| icon | Media (Single media) | Required ✅ |
| description | Text (Long text) | |
| proficiencyLevel | Number (integer) | Min: 1, Max: 5 |
| displayOrder | Number (integer) | Default: `0` |

Click **Finish** → **Save**.

---

### 8.3 Create "Experience" Collection

1. **Create new collection type** → `Experience`

| Field | Type | Settings |
|-------|------|----------|
| title | Text | Required ✅ |
| company | Text | Required ✅ |
| companyLogo | Media (Single media) | |
| location | Text | |
| employmentType | Enumeration | Values: `full-time`, `contract`, `freelance` |
| startDate | Date (date) | Required ✅ |
| endDate | Date (date) | |
| description | Rich text | Required ✅ |
| achievements | JSON | |
| displayOrder | Number (integer) | Default: `0` |
| status | Enumeration | Values: `draft`, `published`. Default: `draft` |

Click **Finish** → **Save**.

---

### 8.4 Create "Testimonial" Collection

1. **Create new collection type** → `Testimonial`

| Field | Type | Settings |
|-------|------|----------|
| quote | Text (Long text) | Required ✅ |
| author | Text | Required ✅ |
| authorTitle | Text | Required ✅ |
| authorCompany | Text | Required ✅ |
| authorAvatar | Media (Single media) | |
| featured | Boolean | Default: `false` |
| displayOrder | Number (integer) | Default: `0` |
| status | Enumeration | Values: `draft`, `published` |

Click **Finish** → **Save**.

---

### 8.5 Create "Tag" Collection

1. **Create new collection type** → `Tag`

| Field | Type | Settings |
|-------|------|----------|
| name | Text | Required ✅, Unique ✅ |
| slug | UID | Attached field: `name`, Required ✅ |
| color | Text | Default: `text-acid` |

Click **Finish** → **Save**.

---

### 8.6 Create "Profile" Single Type

1. Click **Create new single type** → `Profile`

| Field | Type | Settings |
|-------|------|----------|
| fullName | Text | Required ✅ |
| email | Email | Required ✅ |
| phone | Text | |
| location | Text | Required ✅ |
| timezone | Text | Default: `Asia/Jakarta` |
| tagline | Text | Required ✅ |
| bio | Rich text | Required ✅ |
| avatar | Media (Single media) | |
| resume | Media (Single media) | |
| githubUrl | Text | |
| linkedinUrl | Text | |
| twitterUrl | Text | |
| dribbbleUrl | Text | |
| availability | Enumeration | Values: `available`, `busy`, `unavailable` |

Click **Finish** → **Save**.

---

## Step 9: Setup Relations

### 9.1 Project ↔ Technology (Many-to-Many)

1. Content-Type Builder → **Project**
2. Click **Add another field to this collection type**
3. Select **Relation**
4. Left side: `Project` has many
5. Right side: `Technology` (and belongs to many `Project`)
6. Click **Finish**
7. Name field: `technologies`
8. Click **Save**

### 9.2 Project ↔ Tag (Many-to-Many)

Same process:
- `Project` has and belongs to many `Tag`
- Field name: `tags`

### 9.3 Experience ↔ Technology (Many-to-Many)

- `Experience` has and belongs to many `Technology`
- Field name: `technologies`

**Click Save** → Wait for restart.

---

## Step 10: Enable Public API Access

1. **Settings** (sidebar)
2. **Users & Permissions Plugin** → **Roles**
3. Click **Public**
4. Scroll down, expand sections dan check:

**Project:**
- ✅ find
- ✅ findOne

**Technology:**
- ✅ find
- ✅ findOne

**Experience:**
- ✅ find
- ✅ findOne

**Testimonial:**
- ✅ find
- ✅ findOne

**Tag:**
- ✅ find

**Profile:**
- ✅ find

5. Click **Save** (top right)

---

## Step 11: Generate API Token

1. **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Name: `Portfolio Frontend`
4. Token type: **Read-only**
5. Token duration: **Unlimited**
6. Click **Save**

**COPY TOKEN SEKARANG** (tidak bisa dilihat lagi):
```
abc123def456...
```

Save token ini untuk frontend `.env`

---

## Step 12: Add Sample Data

### Add Technologies

1. **Content Manager** → **Technology**
2. Click **Create new entry**

Add beberapa:
- React JS (upload icon)
- TypeScript (upload icon)
- Three.js (upload icon)
- Tailwind CSS (upload icon)

Click **Save** dan **Publish**

### Add Projects

1. **Content Manager** → **Project**
2. Click **Create new entry**
3. Fill:
   - Title: "3D Portfolio Website"
   - Description: "Interactive 3D portfolio..."
   - Status: `published`
   - Featured: ✅
   - Upload thumbnail
   - Select technologies
4. Click **Save** dan **Publish**

---

## Step 13: Test API

Open browser:

```
http://localhost:1337/api/projects?populate=*
```

Should return JSON dengan projects.

---

## Step 14: Connect Frontend

**Edit: `d:\FORTOFOLIO\raypurba-3d\.env`**

Add:
```bash
VITE_CMS_URL=http://localhost:1337
VITE_CMS_TOKEN=your_api_token_from_step_11
```

**Copy CMS service file:**

Copy `d:\FORTOFOLIO\raypurba-3d\docs\CMS_SETUP_MYSQL.md` code section "CMS Service" → create file `src/services/cms.ts`

**Test di component:**

```typescript
import { cms } from '../../services/cms';

// In useEffect
cms.getProjects().then(console.log);
```

---

## ✅ Done!

CMS sudah ready. Sekarang bisa:
- CRUD content via http://localhost:1337/admin
- Frontend fetch data via API
- Upload media files
- Publish/unpublish content

---

## Troubleshooting

**Error: ER_NOT_SUPPORTED_AUTH_MODE**
```powershell
# Di MySQL console
ALTER USER 'portfolio_admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Portfolio2026!';
FLUSH PRIVILEGES;
```

**Error: Port 1337 already in use**
```powershell
# Edit .env, change PORT
PORT=1338
```

**Database connection failed**
- Check MySQL service running: `net start MySQL80`
- Check credentials di `.env`
- Check database created: `SHOW DATABASES;`

---

**Need help? Check dokumentasi lengkap di `CMS_SETUP_MYSQL.md`**
