# Portfolio CMS Documentation

Complete documentation untuk portfolio website & CMS system.

---

## 📚 Documentation Index

### ⭐ Custom CMS (Recommended - Build Your Own)
- **[CUSTOM_CMS_ARCHITECTURE.md](./CUSTOM_CMS_ARCHITECTURE.md)** - Complete architecture for building CMS from scratch
  - System architecture & tech stack
  - Database schema (Prisma + MySQL)
  - Backend API (Express + TypeScript)
  - Admin dashboard (React + Shadcn UI)
  - Security & performance
  - **Cost: $0-5/month**

- **[CUSTOM_CMS_SETUP.md](./CUSTOM_CMS_SETUP.md)** - Step-by-step implementation guide
  - Backend API setup (Express + Prisma)
  - Admin dashboard setup (React + Vite)
  - Database configuration
  - Authentication & authorization
  - File upload handling
  - Testing & troubleshooting

- **[CUSTOM_CMS_COMMANDS.md](./CUSTOM_CMS_COMMANDS.md)** - Quick commands reference
  - Development commands (npm, prisma)
  - Database operations (MySQL)
  - API testing
  - Git workflow
  - Deployment commands
  - Troubleshooting one-liners

### 🔌 Third-Party CMS (Alternative - Use Strapi)
- **[ADMIN_CMS_ARCHITECTURE.md](./ADMIN_CMS_ARCHITECTURE.md)** - Architecture overview with Strapi comparison
  - Tech stack comparison (Strapi vs Supabase vs Decap vs Custom)
  - Database schema and relationships
  - API architecture
  - Deployment strategies
  - Cost analysis

- **[CMS_SETUP_MYSQL.md](./CMS_SETUP_MYSQL.md)** - Technical setup guide for Strapi + MySQL
  - Database configuration
  - Content type definitions
  - API integration code
  - Frontend implementation examples
  - Production deployment guide

- **[CMS_INSTALLATION_STEPS.md](./CMS_INSTALLATION_STEPS.md)** - Step-by-step Strapi UI walkthrough
  - Strapi installation process
  - MySQL database setup
  - Content type creation via UI
  - Adding sample data
  - Testing API endpoints

- **[CMS_QUICK_COMMANDS.md](./CMS_QUICK_COMMANDS.md)** - Command reference for daily operations
  - Development commands
  - Database operations
  - Common troubleshooting
  - Deployment commands

---

## 🎯 Choose Your Path

### Path 1: Custom CMS (Recommended) ⭐
**Best for**: Learning, full control, minimal cost, portfolio showcase

**Pros**:
- ✅ 100% customization
- ✅ No third-party dependencies
- ✅ Lightweight & fast
- ✅ Learn full-stack development
- ✅ Free ($0/month in dev, $5/month production)
- ✅ Great for interviews/portfolio

**Cons**:
- ⚠️ 2-3 days development time
- ⚠️ Need to understand backend (Node.js, Express, SQL)
- ⚠️ You maintain the code

**Timeline**: 2-3 days
- Day 1: Backend API (Express + Prisma + MySQL)
- Day 2: Admin Dashboard (React + Shadcn UI)
- Day 3: Portfolio Integration

**Start here**:
1. Read [CUSTOM_CMS_ARCHITECTURE.md](./CUSTOM_CMS_ARCHITECTURE.md)
2. Follow [CUSTOM_CMS_SETUP.md](./CUSTOM_CMS_SETUP.md)

---

### Path 2: Strapi CMS (Alternative)
**Best for**: Quick setup, pre-built admin UI, less code

**Pros**:
- ✅ Ready-made admin panel
- ✅ Plugin ecosystem
- ✅ Auto-generated API
- ✅ Faster initial setup (1 day)
- ✅ Less code to write

**Cons**:
- ⚠️ Larger bundle size
- ⚠️ Plugin dependency
- ⚠️ Less customization (70%)
- ⚠️ Higher cost ($29/month production)
- ⚠️ Updates may break plugins

**Timeline**: 1-2 days
- Day 1: Install & configure Strapi
- Day 2: Portfolio integration

**Start here**:
1. Read [ADMIN_CMS_ARCHITECTURE.md](./ADMIN_CMS_ARCHITECTURE.md)
2. Follow [CMS_INSTALLATION_STEPS.md](./CMS_INSTALLATION_STEPS.md)

---

## 📊 Feature Comparison

| Feature | Custom CMS | Strapi CMS |
|---------|-----------|-----------|
| **Setup time** | 2-3 days | 1 day |
| **Learning curve** | Moderate | Low |
| **Customization** | 100% | 70% |
| **Bundle size** | Minimal (~50MB) | Large (~300MB) |
| **Performance** | Optimized | Good |
| **Cost (dev)** | **$0** | $0 |
| **Cost (prod)** | **$5/month** | $29/month |
| **Admin UI** | Build yourself | Pre-built ✅ |
| **Updates** | You control | Plugin dependent |
| **API speed** | Optimized | Good |
| **Learning value** | High ⭐ | Medium |
| **Interview showcase** | Excellent ⭐ | Good |

**Recommendation**: **Custom CMS** untuk portfolio project karena:
1. Portfolio sederhana (cuma 5 entities)
2. Learn full-stack development
3. No vendor lock-in
4. Smaller bundle size
5. Better for interviews
6. Cheaper ($5 vs $29/month)

---

## 🚀 Quick Start (Custom CMS)

### Prerequisites
```powershell
node --version    # v20+
mysql --version   # 8.0+
npm --version
```

### 30-Second Setup Overview
```powershell
# 1. Backend API
cd d:\FORTOFOLIO
mkdir portfolio-api && cd portfolio-api
npm init -y
npm install express prisma @prisma/client typescript ts-node

# 2. Admin Dashboard
cd d:\FORTOFOLIO
npm create vite@latest portfolio-admin -- --template react-ts

# 3. Database
mysql -u root -p
CREATE DATABASE portfolio_cms;

# 4. Follow detailed guide:
# docs/CUSTOM_CMS_SETUP.md (Part 1-5)
```

**Estimated time**: 2-3 days full development

---

## 📖 What's Inside Each Document

### Custom CMS Docs

#### CUSTOM_CMS_ARCHITECTURE.md (~35KB)
- Full-stack system architecture diagram
- Tech stack decisions (Express, Prisma, React, Shadcn)
- Complete database schema with relationships
- REST API endpoint specifications
- Authentication & security features (JWT, bcrypt)
- Project folder structure
- Development workflow (3-day plan)
- Deployment options ($0-5/month)
- Performance targets (< 100ms response)
- Security checklist
- Comparison with Strapi

#### CUSTOM_CMS_SETUP.md (~25KB)
- **Part 1**: Backend API setup
  - Node.js + Express + TypeScript
  - Prisma ORM + MySQL
  - JWT authentication
  - File upload with Multer
  - Validation with Zod
- **Part 2**: Code implementation
  - Controllers, services, routes
  - Middleware (auth, validation, error)
  - Utils (JWT, password, response)
  - Validation schemas
- **Part 3**: Admin dashboard setup
  - React + Vite + TypeScript
  - Shadcn UI components
  - TanStack Table for data
  - React Hook Form + Zod
- **Part 4**: Database seeding
  - Sample data script
  - Admin user creation
  - Test data
- **Part 5**: Testing
  - API endpoint testing
  - Admin dashboard testing
- **Part 6**: Git setup

### Third-Party CMS Docs

#### ADMIN_CMS_ARCHITECTURE.md (102KB)
- System architecture diagrams
- Technology comparison table
- Database schema (ERD)
- API specifications
- Security considerations
- Deployment architectures
- Cost breakdown

#### CMS_SETUP_MYSQL.md (25KB)
- MySQL + Strapi configuration
- TypeScript integration code
- API service layer
- React hooks
- Production deployment

#### CMS_INSTALLATION_STEPS.md (12KB)
- Visual UI walkthrough
- Content type builder tutorial
- Sample data creation
- API testing

#### CMS_QUICK_COMMANDS.md (8KB)
- npm/prisma/mysql commands
- Git workflow
- Troubleshooting

---

## 🏗️ System Architecture (Custom CMS)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Portfolio Site (raypurba-3d)    │   Admin Dashboard         │
│  - React 18 + Three.js           │   - React 18 + Vite       │
│  - Fetches from API              │   - CRUD Interface        │
│  - Public access                 │   - JWT Protected         │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
                  │     REST API Calls        │
                  │                           │
┌─────────────────┴───────────────────────────┴───────────────┐
│                      API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Express.js + TypeScript                                     │
│  - RESTful endpoints                                         │
│  - JWT authentication                                        │
│  - File upload (Multer)                                      │
│  - Request validation (Zod)                                  │
│  - CORS configuration                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │     Prisma ORM
                  │
┌─────────────────┴───────────────────────────────────────────┐
│                   DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  MySQL 8.0+                                                  │
│  - Users (admin accounts)                                    │
│  - Projects (portfolio items)                                │
│  - Experiences (work history)                                │
│  - Technologies (tech stack)                                 │
│  - Testimonials (client reviews)                             │
│  - Tags (categorization)                                     │
│  - Profile (personal info)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Portfolio Integration

After CMS setup, integrate dengan raypurba-3d:

### 1. Create API Service Layer
```typescript
// src/services/cms.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getProjects = () => api.get('/projects');
export const getExperiences = () => api.get('/experiences');
export const getTechnologies = () => api.get('/technologies');
export const getProfile = () => api.get('/profile');
```

### 2. Update Components
```typescript
// Before: Static data
import { projects } from '@/config/content';

// After: Dynamic data
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/services/cms';

const { data: projects, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: getProjects
});
```

### 3. Environment Variables
```env
# .env.development
VITE_API_URL=http://localhost:5000/api

# .env.production
VITE_API_URL=https://api.raypurba.com/api
```

### 4. Deploy
| Component | Platform | Cost |
|-----------|----------|------|
| Portfolio Frontend | Vercel | Free |
| API Backend | Railway | $5/month |
| Admin Dashboard | Vercel | Free |
| MySQL Database | Railway (included) | $0 |
| **Total** | | **$5/month** |

---

## 💡 Why CMS?

### Current Problem:
- ❌ Content hardcoded di `src/constants/content.ts`
- ❌ Setiap update = edit code + commit + rebuild + deploy
- ❌ No preview before publish
- ❌ No content versioning
- ❌ No media management
- ❌ Can't edit on mobile

### With CMS:
- ✅ Update content via admin UI (no coding)
- ✅ Instant preview
- ✅ Draft/publish workflow
- ✅ Media library
- ✅ Content history & rollback
- ✅ No rebuild needed (API fetch)
- ✅ Edit from anywhere (browser-based)

---

## 📦 Folder Structure After Setup

```
d:\FORTOFOLIO\
│
├── raypurba-3d/                  (Portfolio Frontend - existing)
│   ├── docs/                     (This documentation)
│   │   ├── README.md
│   │   ├── CUSTOM_CMS_ARCHITECTURE.md
│   │   ├── CUSTOM_CMS_SETUP.md
│   │   ├── ADMIN_CMS_ARCHITECTURE.md
│   │   ├── CMS_SETUP_MYSQL.md
│   │   ├── CMS_INSTALLATION_STEPS.md
│   │   └── CMS_QUICK_COMMANDS.md
│   ├── src/
│   │   ├── services/
│   │   │   └── cms.ts           (NEW - API service)
│   │   ├── components/
│   │   └── constants/
│   │       └── content.ts       (Will be deprecated)
│   └── .env                     (Add API_URL)
│
├── portfolio-api/                (Backend API - will be created)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── utils/
│   ├── uploads/
│   └── .env
│
└── portfolio-admin/              (Admin Dashboard - will be created)
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   └── stores/
    └── .env
```

---

## 🔒 Security Checklist

Custom CMS:
- [ ] Strong MySQL password
- [ ] JWT secrets (32+ chars random)
- [ ] bcrypt password hashing (12 rounds)
- [ ] CORS whitelist configured
- [ ] Rate limiting on auth endpoints
- [ ] Input validation (Zod)
- [ ] File upload restrictions (5MB, images only)
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS only in production
- [ ] SQL injection prevention (Prisma)

---

## 📊 Cost Comparison

### Custom CMS
| Service | Plan | Cost |
|---------|------|------|
| Railway (API + MySQL) | Developer | $5/month |
| Vercel (Portfolio) | Hobby | $0 |
| Vercel (Admin) | Hobby | $0 |
| **Total** | | **$5/month** |

### Strapi CMS
| Service | Plan | Cost |
|---------|------|------|
| Railway (Strapi) | Developer | $5/month |
| PlanetScale (MySQL) | Scaler | $29/month |
| Vercel (Portfolio) | Hobby | $0 |
| **Total** | | **$34/month** |

**Savings with Custom CMS**: $29/month ($348/year)

---

## 🎓 Learning Benefits (Custom CMS)

Building custom CMS teaches you:

1. **Backend Development**
   - Express.js server architecture
   - RESTful API design
   - Database modeling with Prisma ORM
   - SQL queries & migrations

2. **Authentication & Security**
   - JWT token authentication
   - Password hashing (bcrypt)
   - Role-based access control
   - API security best practices

3. **Frontend Development**
   - React admin dashboard
   - Form handling (React Hook Form)
   - Data tables (TanStack Table)
   - State management (Zustand)

4. **DevOps**
   - Environment configuration
   - Database deployment
   - API deployment (Railway)
   - CI/CD basics

5. **Full-Stack Integration**
   - API service layer
   - Error handling
   - Loading states
   - Image upload flow

**Perfect untuk interviews!** Bisa explain dari A-Z karena kamu yang buat.

---

## ⏱️ Implementation Timeline

### Custom CMS (2-3 days)

| Phase | Duration | Tasks | Status |
|-------|----------|-------|--------|
| **Day 1: Backend** | 6-8 hours | Setup Express, Prisma, MySQL, JWT auth, CRUD endpoints | 🔜 Next |
| **Day 2: Admin** | 6-8 hours | Setup React dashboard, forms, tables, image upload | 🔜 Next |
| **Day 3: Integration** | 4-6 hours | Connect portfolio, API service, deploy | 🔜 Next |

### Strapi CMS (1-2 days)

| Phase | Duration | Tasks | Status |
|-------|----------|-------|--------|
| **Day 1: Setup** | 4-6 hours | Install Strapi, configure MySQL, create content types | 🔜 Next |
| **Day 2: Integration** | 4-6 hours | Connect portfolio, API service, deploy | 🔜 Next |

---

## 🆘 Support

### Common Questions

**Q: Custom CMS vs Strapi - which should I use?**
A: **Custom CMS** karena:
- Portfolio sederhana (5 entities)
- Full learning experience
- Better for interviews
- Cheaper ($5 vs $34/month)
- Complete control

**Q: Berapa lama buat custom CMS?**
A: 2-3 hari full development following the guide.

**Q: Butuh pengalaman backend?**
A: Basic Node.js & Express sudah cukup. Guide nya lengkap step-by-step.

**Q: Kalau stuck gimana?**
A: Troubleshooting sections ada di setup guide. Setiap common error documented.

**Q: Bisa pakai PostgreSQL?**
A: Bisa! Change Prisma datasource provider ke `postgresql` dan update connection string.

**Q: Gimana kalau mau switch dari Custom ke Strapi nanti?**
A: Database schema sama. Export data → import ke Strapi. Documented in migration guide (will be added).

---

## 📝 Documentation Status

| Document | Type | Status | Updated |
|----------|------|--------|---------|
| CUSTOM_CMS_ARCHITECTURE.md | Custom | ✅ Complete | Oct 30, 2026 |
| CUSTOM_CMS_SETUP.md | Custom | ✅ Complete | Oct 30, 2026 |
| CUSTOM_CMS_COMMANDS.md | Custom | ✅ Complete | Oct 30, 2026 |
| ADMIN_CMS_ARCHITECTURE.md | Strapi | ✅ Complete | Oct 30, 2026 |
| CMS_SETUP_MYSQL.md | Strapi | ✅ Complete | Oct 30, 2026 |
| CMS_INSTALLATION_STEPS.md | Strapi | ✅ Complete | Oct 30, 2026 |
| CMS_QUICK_COMMANDS.md | Strapi | ✅ Complete | Oct 30, 2026 |

---

## 🔄 Recent Updates

### October 30, 2026
- ⭐ **NEW**: Added custom CMS documentation
- ⭐ **NEW**: Complete setup guide for building from scratch
- Architecture comparison (Custom vs Strapi)
- Full-stack implementation guide
- Cost-optimized deployment ($5/month)
- Security best practices
- Testing & troubleshooting

---

## ✅ Ready to Start?

### 👉 Custom CMS (Recommended)
1. Open [CUSTOM_CMS_ARCHITECTURE.md](./CUSTOM_CMS_ARCHITECTURE.md) untuk understand system
2. Follow [CUSTOM_CMS_SETUP.md](./CUSTOM_CMS_SETUP.md) step-by-step

### 👉 Strapi CMS (Alternative)
1. Open [ADMIN_CMS_ARCHITECTURE.md](./ADMIN_CMS_ARCHITECTURE.md) untuk overview
2. Follow [CMS_INSTALLATION_STEPS.md](./CMS_INSTALLATION_STEPS.md) step-by-step

---

**Last Updated:** October 30, 2026  
**Version:** 2.0 (Added Custom CMS)  
**Author:** Ray Purba Portfolio Development Team

*For questions about the portfolio project itself, see the main [README.md](../README.md)*
