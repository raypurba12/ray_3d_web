# Custom CMS - Complete Setup Guide

Step-by-step guide untuk setup custom CMS dari nol sampai running.

---

## Prerequisites

### System Requirements
- **Node.js**: v20.x or higher
- **MySQL**: v8.0 or higher
- **npm/pnpm**: Latest version
- **Git**: For version control
- **Code Editor**: VS Code (recommended)

### Check Installations
```powershell
node --version    # Should be v20+
npm --version
mysql --version   # Should be 8.0+
```

---

## Part 1: Backend API Setup

### Step 1: Create Project Structure
```powershell
# Navigate to workspace
cd d:\FORTOFOLIO

# Create backend folder
mkdir portfolio-api
cd portfolio-api
```

### Step 2: Initialize Node.js Project
```powershell
# Create package.json
npm init -y

# Install dependencies
npm install express cors dotenv bcryptjs jsonwebtoken zod multer cloudinary
npm install @prisma/client mysql2

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer ts-node nodemon prisma
```

### Step 3: Setup TypeScript
```powershell
# Create tsconfig.json
npx tsc --init
```

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Setup Prisma
```powershell
# Initialize Prisma
npx prisma init --datasource-provider mysql
```

This creates:
- `prisma/schema.prisma`
- `.env` file

### Step 5: Configure Environment Variables

Edit `.env`:
```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="mysql://root:your_password@localhost:3306/portfolio_cms"

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-also-change-this-in-production
JWT_REFRESH_EXPIRE=30d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Cloudinary (optional - for production)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `.env.example` (untuk repo):
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="mysql://root:password@localhost:3306/portfolio_cms"
JWT_SECRET=change-this-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=change-this-refresh-secret
JWT_REFRESH_EXPIRE=30d
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Step 6: Create Database

Open MySQL:
```powershell
mysql -u root -p
```

Create database:
```sql
CREATE DATABASE portfolio_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
USE portfolio_cms;
```

Exit MySQL:
```sql
EXIT;
```

### Step 7: Define Prisma Schema

Edit `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Admin Users
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  ADMIN
  SUPER_ADMIN
}

// Projects/Portfolio Items
model Project {
  id           String       @id @default(cuid())
  title        String
  description  String       @db.Text
  image        String
  tags         Tag[]        @relation("ProjectTags")
  technologies Technology[] @relation("ProjectTechnologies")
  demoUrl      String?
  githubUrl    String?
  featured     Boolean      @default(false)
  order        Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@map("projects")
}

// Technologies/Skills
model Technology {
  id          String       @id @default(cuid())
  name        String       @unique
  icon        String
  category    TechCategory
  projects    Project[]    @relation("ProjectTechnologies")
  experiences Experience[] @relation("ExperienceTechnologies")
  order       Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("technologies")
}

enum TechCategory {
  FRONTEND
  BACKEND
  DATABASE
  DEVOPS
  DESIGN
  OTHER
}

// Work Experience
model Experience {
  id           String       @id @default(cuid())
  title        String
  company      String
  companyLogo  String?
  location     String?
  startDate    DateTime
  endDate      DateTime?
  description  String       @db.Text
  technologies Technology[] @relation("ExperienceTechnologies")
  order        Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@map("experiences")
}

// Client Testimonials
model Testimonial {
  id        String   @id @default(cuid())
  name      String
  role      String
  company   String
  avatar    String?
  content   String   @db.Text
  rating    Int      @default(5)
  featured  Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("testimonials")
}

// Tags for categorization
model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  color     String?   // hex color
  projects  Project[] @relation("ProjectTags")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("tags")
}

// Profile Info (single record)
model Profile {
  id        String   @id @default("profile")
  name      String
  tagline   String
  bio       String   @db.Text
  avatar    String
  resumeUrl String?
  email     String
  phone     String?
  location  String?
  github    String?
  linkedin  String?
  twitter   String?
  website   String?
  updatedAt DateTime @updatedAt

  @@map("profile")
}
```

### Step 8: Run Prisma Migration

```powershell
# Generate Prisma Client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init

# Check database
npx prisma studio
```

Prisma Studio akan buka di browser (http://localhost:5555) - kamu bisa lihat tables nya.

### Step 9: Create Folder Structure

```powershell
# Create folders
mkdir src
mkdir src\config
mkdir src\middleware
mkdir src\routes
mkdir src\controllers
mkdir src\services
mkdir src\schemas
mkdir src\types
mkdir src\utils
mkdir uploads
```

### Step 10: Update package.json Scripts

Edit `package.json`:
```json
{
  "name": "portfolio-api",
  "version": "1.0.0",
  "description": "Custom CMS API for raypurba-3d portfolio",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "keywords": ["cms", "portfolio", "api"],
  "author": "Ray Purba",
  "license": "MIT"
}
```

Create `nodemon.json`:
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node src/index.ts"
}
```

---

## Part 2: Backend Code Implementation

### Step 11: Database Config

Create `src/config/database.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

### Step 12: JWT Utilities

Create `src/utils/jwt.ts`:
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
};
```

Create `src/utils/password.ts`:
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

Create `src/utils/response.ts`:
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (error: string, errors?: any[]): ApiResponse => ({
  success: false,
  error,
  errors,
});
```

### Step 13: Authentication Middleware

Create `src/middleware/auth.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('No token provided'));
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid or expired token'));
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json(errorResponse('Admin access required'));
  }
  next();
};
```

### Step 14: Validation Middleware

Create `src/middleware/validate.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json(errorResponse('Validation failed', error.errors));
    }
  };
};
```

Create `src/middleware/error.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json(errorResponse(message));
};
```

### Step 15: Upload Middleware

Create `src/middleware/upload.ts`:
```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
```

### Step 16: Validation Schemas

Create `src/schemas/auth.schema.ts`:
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});
```

Create `src/schemas/project.schema.ts`:
```typescript
import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url('Invalid image URL'),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  technologies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
```

---

## Part 3: Admin Dashboard Setup

### Step 17: Create Admin Project

```powershell
# Navigate back to workspace
cd d:\FORTOFOLIO

# Create Vite React app
npm create vite@latest portfolio-admin -- --template react-ts

# Navigate to admin
cd portfolio-admin

# Install dependencies
npm install
```

### Step 18: Install Admin Dependencies

```powershell
# UI & Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-toast

# Form handling
npm install react-hook-form @hookform/resolvers zod

# Tables
npm install @tanstack/react-table

# HTTP & State
npm install axios zustand

# Router
npm install react-router-dom

# Utils
npm install clsx tailwind-merge lucide-react sonner date-fns

# Dev dependencies
npm install -D @types/node tailwindcss postcss autoprefixer
```

### Step 19: Setup Tailwind CSS

```powershell
npx tailwindcss init -p
```

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

### Step 20: Setup Shadcn UI

```powershell
# Initialize Shadcn
npx shadcn@latest init
```

Answer prompts:
- TypeScript: Yes
- Style: Default
- Base color: Zinc
- CSS variables: Yes

Add components:
```powershell
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add toast
```

### Step 21: Create Admin Environment

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Portfolio Admin
```

Create `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Portfolio Admin
```

---

## Part 4: Database Seeding

### Step 22: Create Seed Script

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@raypurba.com' },
    update: {},
    create: {
      email: 'admin@raypurba.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create technologies
  const technologies = [
    { name: 'React', icon: '/tech/react.png', category: 'FRONTEND' },
    { name: 'TypeScript', icon: '/tech/typescript.png', category: 'FRONTEND' },
    { name: 'Three.js', icon: '/tech/threejs.svg', category: 'FRONTEND' },
    { name: 'Node.js', icon: '/tech/nodejs.png', category: 'BACKEND' },
    { name: 'MySQL', icon: '/tech/mysql.png', category: 'DATABASE' },
  ];

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { name: tech.name },
      update: {},
      create: tech,
    });
  }
  console.log('✅ Created technologies');

  // Create tags
  const tags = [
    { name: 'Web Development', slug: 'web-dev', color: '#3b82f6' },
    { name: '3D Graphics', slug: '3d-graphics', color: '#10b981' },
    { name: 'Full Stack', slug: 'full-stack', color: '#8b5cf6' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log('✅ Created tags');

  // Create profile
  await prisma.profile.upsert({
    where: { id: 'profile' },
    update: {},
    create: {
      id: 'profile',
      name: 'Ray Purba',
      tagline: 'Full Stack Developer',
      bio: 'Passionate developer specializing in 3D web experiences.',
      avatar: '/avatar.jpg',
      email: 'hello@raypurba.com',
      location: 'Indonesia',
      github: 'https://github.com/raypurba',
      linkedin: 'https://linkedin.com/in/raypurba',
    },
  });
  console.log('✅ Created profile');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```powershell
npm run prisma:seed
```

---

## Part 5: Testing

### Step 23: Start Backend Server

```powershell
cd d:\FORTOFOLIO\portfolio-api
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ Database connected
```

### Step 24: Start Admin Dashboard

Open new terminal:
```powershell
cd d:\FORTOFOLIO\portfolio-admin
npm run dev
```

You should see:
```
  VITE ready in 500 ms
  ➜  Local:   http://localhost:5173/
```

### Step 25: Test API Endpoints

Using PowerShell (or Postman):
```powershell
# Test health check
curl http://localhost:5000/api/health

# Test login
$body = @{
    email = "admin@raypurba.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

---

## Part 6: Git Setup

### Step 26: Create .gitignore

Backend `.gitignore`:
```
node_modules/
dist/
.env
uploads/
*.log
.DS_Store
```

Admin `.gitignore`:
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

### Step 27: Initialize Git

```powershell
# Backend
cd d:\FORTOFOLIO\portfolio-api
git init
git add .
git commit -m "Initial backend setup"

# Admin
cd d:\FORTOFOLIO\portfolio-admin
git init
git add .
git commit -m "Initial admin setup"
```

---

## Next Steps

1. ✅ Backend API setup complete
2. ✅ Admin dashboard scaffolding complete
3. ⏭️ Implement API endpoints (see `CUSTOM_CMS_DEVELOPMENT.md`)
4. ⏭️ Build admin UI pages
5. ⏭️ Integrate with portfolio frontend

---

## Troubleshooting

### MySQL Connection Error
```
Error: Can't connect to MySQL server
```
**Solution**: Check if MySQL is running:
```powershell
# Check MySQL service
Get-Service MySQL*

# Start MySQL if stopped
Start-Service MySQL80
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: Change PORT in `.env` or kill the process:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Prisma Migration Failed
```
Error: Migration failed
```
**Solution**: Reset database:
```powershell
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## Useful Commands Reference

```powershell
# Backend
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database

# Admin
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create and apply migration
npx prisma migrate reset # Reset database
npx prisma studio        # GUI for database
```

---

*Setup complete! Proceed to `CUSTOM_CMS_DEVELOPMENT.md` for implementation details.*
