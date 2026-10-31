# Custom Portfolio CMS - Architecture Documentation

## Overview
Full-stack custom CMS built from scratch for raypurba-3d portfolio. Complete control over features, performance, and data structure.

---

## System Architecture

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
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend API (`portfolio-api/`)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 20+ | JavaScript runtime |
| Framework | Express.js 4.x | Web framework |
| Language | TypeScript 5.x | Type safety |
| ORM | Prisma 5.x | Database toolkit |
| Database | MySQL 8.0+ | Relational database |
| Auth | jsonwebtoken + bcrypt | JWT tokens + password hashing |
| Validation | Zod | Schema validation |
| File Upload | Multer | Multipart form data |
| Image Storage | Cloudinary / Local | Image hosting |
| CORS | cors | Cross-origin requests |

### Admin Dashboard (`portfolio-admin/`)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 + Vite | UI framework |
| Language | TypeScript | Type safety |
| UI Library | Shadcn UI | Component library |
| Tables | TanStack Table v8 | Data tables |
| Forms | React Hook Form | Form handling |
| Validation | Zod | Client-side validation |
| HTTP Client | Axios | API requests |
| Router | React Router v6 | Navigation |
| State | Zustand | Global state |
| Toast | Sonner | Notifications |

### Frontend Integration (`raypurba-3d/`)
- Update existing API service layer
- Environment variables for API URL
- Dynamic content loading with React Query

---

## Database Schema (Prisma)

### Core Tables

#### 1. Users (Admin Accounts)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  SUPER_ADMIN
}
```

#### 2. Projects
```prisma
model Project {
  id          String       @id @default(cuid())
  title       String
  description String       @db.Text
  image       String       // URL or path
  tags        Tag[]        @relation("ProjectTags")
  technologies Technology[] @relation("ProjectTechnologies")
  demoUrl     String?
  githubUrl   String?
  featured    Boolean      @default(false)
  order       Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

#### 3. Technologies
```prisma
model Technology {
  id          String       @id @default(cuid())
  name        String       @unique
  icon        String       // URL or path
  category    TechCategory
  projects    Project[]    @relation("ProjectTechnologies")
  experiences Experience[] @relation("ExperienceTechnologies")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum TechCategory {
  FRONTEND
  BACKEND
  DATABASE
  DEVOPS
  DESIGN
  OTHER
}
```

#### 4. Experiences
```prisma
model Experience {
  id           String       @id @default(cuid())
  title        String
  company      String
  companyLogo  String?      // URL or path
  location     String?
  startDate    DateTime
  endDate      DateTime?    // null = current
  description  String       @db.Text
  technologies Technology[] @relation("ExperienceTechnologies")
  order        Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

#### 5. Testimonials
```prisma
model Testimonial {
  id        String   @id @default(cuid())
  name      String
  role      String
  company   String
  avatar    String?  // URL or path
  content   String   @db.Text
  rating    Int      @default(5)
  featured  Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 6. Tags
```prisma
model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  color     String?   // hex color
  projects  Project[] @relation("ProjectTags")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

#### 7. Profile (Single Record)
```prisma
model Profile {
  id          String   @id @default("profile") // Always "profile"
  name        String
  tagline     String
  bio         String   @db.Text
  avatar      String
  resumeUrl   String?
  email       String
  phone       String?
  location    String?
  github      String?
  linkedin    String?
  twitter     String?
  website     String?
  updatedAt   DateTime @updatedAt
}
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login           # Login admin
POST   /api/auth/register        # Register new admin (protected)
POST   /api/auth/refresh         # Refresh JWT token
GET    /api/auth/me              # Get current user
```

### Projects
```
GET    /api/projects             # List all projects (public)
GET    /api/projects/:id         # Get single project (public)
POST   /api/projects             # Create project (protected)
PUT    /api/projects/:id         # Update project (protected)
DELETE /api/projects/:id         # Delete project (protected)
POST   /api/projects/:id/upload  # Upload project image (protected)
```

### Technologies
```
GET    /api/technologies         # List all technologies (public)
GET    /api/technologies/:id     # Get single technology (public)
POST   /api/technologies         # Create technology (protected)
PUT    /api/technologies/:id     # Update technology (protected)
DELETE /api/technologies/:id     # Delete technology (protected)
```

### Experiences
```
GET    /api/experiences          # List all experiences (public)
GET    /api/experiences/:id      # Get single experience (public)
POST   /api/experiences          # Create experience (protected)
PUT    /api/experiences/:id      # Update experience (protected)
DELETE /api/experiences/:id      # Delete experience (protected)
```

### Testimonials
```
GET    /api/testimonials         # List all testimonials (public)
GET    /api/testimonials/:id     # Get single testimonial (public)
POST   /api/testimonials         # Create testimonial (protected)
PUT    /api/testimonials/:id     # Update testimonial (protected)
DELETE /api/testimonials/:id     # Delete testimonial (protected)
```

### Profile
```
GET    /api/profile              # Get profile (public)
PUT    /api/profile              # Update profile (protected)
```

### File Upload
```
POST   /api/upload               # Upload single file (protected)
POST   /api/upload/multiple      # Upload multiple files (protected)
DELETE /api/upload/:filename     # Delete file (protected)
```

---

## Security Features

### 1. Authentication
- **JWT tokens** with 7-day expiry
- **Refresh tokens** for extended sessions
- **bcrypt** password hashing (12 rounds)
- **Rate limiting** on auth endpoints

### 2. Authorization
- **Role-based access control** (ADMIN, SUPER_ADMIN)
- **Protected routes** middleware
- **CORS whitelist** for allowed origins

### 3. Input Validation
- **Zod schemas** for all endpoints
- **SQL injection** prevention via Prisma
- **XSS protection** via sanitization
- **File type validation** (images only)

### 4. File Upload Security
- **File size limits** (5MB per image)
- **Allowed MIME types** (image/jpeg, image/png, image/webp)
- **Filename sanitization** (remove special chars)
- **Malware scanning** (optional: ClamAV)

---

## Project Structure

### Backend API Structure
```
portfolio-api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Sample data seeder
│   └── migrations/            # Database migrations
├── src/
│   ├── index.ts               # App entry point
│   ├── server.ts              # Express server setup
│   ├── config/
│   │   ├── database.ts        # Prisma client
│   │   ├── cloudinary.ts      # Image upload config
│   │   └── jwt.ts             # JWT config
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification
│   │   ├── validate.ts        # Zod validation
│   │   ├── error.ts           # Error handler
│   │   └── upload.ts          # Multer config
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── technologies.routes.ts
│   │   ├── experiences.routes.ts
│   │   ├── testimonials.routes.ts
│   │   ├── profile.routes.ts
│   │   └── upload.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── technologies.controller.ts
│   │   ├── experiences.controller.ts
│   │   ├── testimonials.controller.ts
│   │   ├── profile.controller.ts
│   │   └── upload.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── projects.service.ts
│   │   ├── technologies.service.ts
│   │   ├── experiences.service.ts
│   │   ├── testimonials.service.ts
│   │   ├── profile.service.ts
│   │   └── upload.service.ts
│   ├── schemas/              # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── project.schema.ts
│   │   ├── technology.schema.ts
│   │   ├── experience.schema.ts
│   │   ├── testimonial.schema.ts
│   │   └── profile.schema.ts
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── utils/
│       ├── password.ts       # bcrypt utilities
│       ├── jwt.ts            # JWT utilities
│       └── response.ts       # API response formatter
├── uploads/                  # Local file storage (dev)
├── .env                      # Environment variables
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Admin Dashboard Structure
```
portfolio-admin/
├── src/
│   ├── main.tsx              # App entry
│   ├── App.tsx               # Root component
│   ├── routes/
│   │   └── index.tsx         # Route definitions
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── projects/
│   │   │   ├── ProjectsList.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectView.tsx
│   │   ├── experiences/
│   │   │   ├── ExperiencesList.tsx
│   │   │   └── ExperienceForm.tsx
│   │   ├── technologies/
│   │   │   ├── TechnologiesList.tsx
│   │   │   └── TechnologyForm.tsx
│   │   ├── testimonials/
│   │   │   ├── TestimonialsList.tsx
│   │   │   └── TestimonialForm.tsx
│   │   └── profile/
│   │       └── ProfileEdit.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/               # Shadcn components
│   │   ├── forms/
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   └── DatePicker.tsx
│   │   └── tables/
│   │       └── DataTable.tsx
│   ├── services/
│   │   ├── api.ts            # Axios instance
│   │   ├── auth.service.ts
│   │   └── projects.service.ts
│   ├── stores/
│   │   ├── auth.store.ts     # Zustand auth store
│   │   └── ui.store.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── lib/
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Development Workflow

### Phase 1: Backend Setup (Day 1)
1. ✅ Initialize Node.js project
2. ✅ Setup TypeScript + Express
3. ✅ Configure Prisma + MySQL
4. ✅ Create database schema
5. ✅ Setup authentication (JWT + bcrypt)
6. ✅ Build CRUD endpoints
7. ✅ Add file upload functionality
8. ✅ Setup validation + error handling
9. ✅ Seed sample data

### Phase 2: Admin Dashboard (Day 2)
1. ✅ Initialize React + Vite project
2. ✅ Setup Shadcn UI components
3. ✅ Build authentication pages
4. ✅ Create admin layout
5. ✅ Build data tables (TanStack Table)
6. ✅ Create forms for each entity
7. ✅ Implement image upload UI
8. ✅ Add notifications (Sonner)
9. ✅ Setup API integration

### Phase 3: Frontend Integration (Day 3)
1. ✅ Update raypurba-3d API service
2. ✅ Add environment configuration
3. ✅ Replace static content with API calls
4. ✅ Add loading states
5. ✅ Error handling
6. ✅ Image optimization

### Phase 4: Testing & Deployment
1. ✅ API endpoint testing
2. ✅ Admin dashboard E2E tests
3. ✅ Security audit
4. ✅ Performance optimization
5. ✅ Deploy backend (Railway/Render)
6. ✅ Deploy admin (Vercel/Netlify)
7. ✅ Setup production database

---

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="mysql://user:password@localhost:3306/portfolio_cms"

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=./uploads
```

### Admin Dashboard (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Portfolio Admin
```

### Frontend (.env)
```env
VITE_API_URL=https://api.raypurba.com/api
```

---

## Deployment Architecture

### Option 1: All-in-One (Simple)
```
┌─────────────────────────────────────┐
│         Vercel / Netlify            │
│  ┌──────────────┐  ┌──────────────┐ │
│  │  Portfolio   │  │    Admin     │ │
│  │   (Static)   │  │   (Static)   │ │
│  └──────────────┘  └──────────────┘ │
└──────────┬──────────────────────────┘
           │
           │ HTTPS
           │
┌──────────┴──────────────────────────┐
│      Railway / Render               │
│  ┌──────────────────────────────┐   │
│  │     Express API Server       │   │
│  │  (Node.js + Prisma)          │   │
│  └──────────────────────────────┘   │
└──────────┬──────────────────────────┘
           │
           │ MySQL Protocol
           │
┌──────────┴──────────────────────────┐
│      PlanetScale / Railway          │
│  ┌──────────────────────────────┐   │
│  │        MySQL Database        │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Option 2: Distributed (Scalable)
```
Portfolio (Vercel) ──┐
                      │
Admin (Vercel) ───────┼─→ API (Railway) ─→ MySQL (PlanetScale)
                      │         │
External API ─────────┘         └─→ Cloudinary (Images)
```

---

## Cost Estimation

### Free Tier (Development)
| Service | Plan | Cost |
|---------|------|------|
| Railway | Hobby ($5 credit) | $0 |
| PlanetScale | Hobby (5GB) | $0 |
| Vercel | Hobby | $0 |
| Cloudinary | Free (25GB) | $0 |
| **Total** | | **$0/month** |

### Production Tier
| Service | Plan | Cost |
|---------|------|------|
| Railway | Developer | $5/month |
| PlanetScale | Scaler | $29/month |
| Vercel | Pro (optional) | $20/month |
| Cloudinary | Plus | $89/month |
| **Total** | | **$54-143/month** |

### Budget Option (Production)
| Service | Plan | Cost |
|---------|------|------|
| Railway | Developer (API + MySQL) | $5/month |
| Vercel | Hobby | $0 |
| Local Storage | Serve from API | $0 |
| **Total** | | **$5/month** |

---

## Performance Targets

### Backend API
- Response time: < 100ms (95th percentile)
- Throughput: 1000 req/s
- Database queries: < 50ms
- Image upload: < 2s for 5MB

### Admin Dashboard
- First Load: < 2s
- Route change: < 500ms
- Form submission: < 1s
- Table rendering: < 500ms (1000 rows)

### Frontend Portfolio
- No performance impact from dynamic data
- Same loading times as static content
- Cached API responses (5min TTL)

---

## Security Checklist

- [x] Password hashing (bcrypt, 12 rounds)
- [x] JWT token authentication
- [x] HTTPS only in production
- [x] CORS whitelist
- [x] Rate limiting on auth endpoints
- [x] Input validation (Zod)
- [x] SQL injection prevention (Prisma)
- [x] XSS protection
- [x] File upload restrictions
- [x] Environment variables for secrets
- [x] Role-based access control
- [x] Secure cookie settings
- [x] API request logging
- [x] Error messages sanitization

---

## Monitoring & Logging

### Logging Strategy
```typescript
// Use Winston or Pino
logger.info('User login', { userId, email });
logger.error('Database error', { error, query });
logger.warn('Rate limit exceeded', { ip, endpoint });
```

### Metrics to Track
- API response times
- Database query performance
- Error rates by endpoint
- Authentication failures
- File upload sizes
- Active sessions

### Recommended Tools
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: APM monitoring
- **Railway Metrics**: Built-in monitoring

---

## Future Enhancements

### Phase 2 Features
- [ ] Multi-language support (i18n)
- [ ] Draft/Published workflow
- [ ] Version history
- [ ] Bulk operations
- [ ] Export/Import data (JSON/CSV)
- [ ] Activity audit log
- [ ] Email notifications
- [ ] Scheduled publishing
- [ ] SEO metadata editor
- [ ] Analytics integration

### Advanced Features
- [ ] Real-time collaboration
- [ ] Content preview before publish
- [ ] A/B testing support
- [ ] CDN integration
- [ ] GraphQL API option
- [ ] Webhook system
- [ ] Custom fields builder
- [ ] Multi-user roles
- [ ] 2FA authentication
- [ ] API rate limiting per user

---

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- npm or pnpm
- Git

### Quick Start
```bash
# 1. Clone/Setup Backend
cd d:\FORTOFOLIO
mkdir portfolio-api && cd portfolio-api
npm init -y
npm install express prisma @prisma/client typescript ts-node

# 2. Clone/Setup Admin
cd d:\FORTOFOLIO
npm create vite@latest portfolio-admin -- --template react-ts

# 3. Setup Database
mysql -u root -p
CREATE DATABASE portfolio_cms;

# 4. Initialize Prisma
npx prisma init

# 5. Follow detailed setup guide in:
# - CUSTOM_CMS_SETUP.md
# - CUSTOM_CMS_DEVELOPMENT.md
```

---

## Support & Documentation

- **Architecture**: This file
- **Setup Guide**: `CUSTOM_CMS_SETUP.md`
- **Development**: `CUSTOM_CMS_DEVELOPMENT.md`
- **API Reference**: `CUSTOM_CMS_API.md`
- **Deployment**: `CUSTOM_CMS_DEPLOYMENT.md`

---

## Comparison: Custom vs Strapi

| Feature | Custom CMS | Strapi |
|---------|-----------|--------|
| Learning curve | Moderate | Low |
| Customization | 100% | 70% |
| Performance | Optimized | Good |
| Bundle size | Minimal | Large |
| Development time | 2-3 days | 1 day |
| Future maintenance | Full control | Plugin dependent |
| Cost | $0-5/month | $0-29/month |
| **Verdict** | ✅ **Best for this project** | Good alternative |

**Why Custom?**
1. Portfolio is simple (5 entities only)
2. Learn full-stack development
3. No third-party dependencies
4. Smaller bundle size
5. Complete control

---

*Last Updated: October 30, 2026*
