# Portfolio Admin CMS — Architecture & Implementation Plan

**Project**: Ray Purba 3D Portfolio CMS  
**Purpose**: Headless CMS system untuk mengelola konten portfolio tanpa rebuild  
**Last Updated**: 2026-10-30  

---

## 1. Executive Summary

### 1.1 Problem Statement
Saat ini, semua konten portfolio (projects, experience, testimonials, tech stack) di-hardcode di `src/constants/content.ts`. Setiap update memerlukan:
- Edit kode manual
- Git commit
- Rebuild & redeploy frontend
- Tidak ada preview sebelum publish
- Tidak ada versioning/history konten

### 1.2 Solution Overview
Membangun **Headless CMS** terpisah dengan:
- ✅ Admin dashboard untuk CRUD konten
- ✅ REST/GraphQL API untuk frontend
- ✅ Authentication & authorization
- ✅ Media upload (images, videos, PDFs)
- ✅ Draft/Preview/Publish workflow
- ✅ Content versioning & rollback

---

## 2. Architecture Decision

### 2.1 Tech Stack Options

#### **Option A: Full Custom Backend (Node.js + PostgreSQL)**
**Pros:**
- Full control atas data model
- Custom business logic
- Optimized untuk use case spesifik
- Bisa ditambahkan analytics, contact form handling, dll

**Cons:**
- Butuh development time lebih lama
- Harus maintain infrastructure sendiri
- Auth, security, file upload harus dibangun dari scratch

**Stack:**
```
Backend:    Node.js + Express/Fastify
Database:   PostgreSQL + Prisma ORM
Auth:       JWT + bcrypt
Storage:    AWS S3 / Cloudflare R2
Admin UI:   React + TanStack Table + React Hook Form
Hosting:    Railway / Fly.io / AWS
```

---

#### **Option B: Headless CMS Platform (Strapi)**
**Pros:**
- Auto-generated REST & GraphQL API
- Built-in admin panel
- Role-based permissions
- Media library built-in
- Draft/Publish workflow
- Fast setup (1-2 hari vs 1-2 minggu)

**Cons:**
- Less flexibility untuk custom logic
- Lebih berat (full Node.js app)
- Harus follow Strapi conventions

**Stack:**
```
CMS:        Strapi v4
Database:   PostgreSQL
Storage:    Cloudflare R2 / AWS S3
Hosting:    Railway / Heroku / VPS
```

---

#### **Option C: Git-based CMS (Decap CMS / TinaCMS)**
**Pros:**
- No backend server needed
- Content stored di Git repo
- Free (jika pakai GitHub)
- Simple workflow untuk solo developer

**Cons:**
- Setiap edit = Git commit = CI/CD trigger
- Lambat untuk content banyak
- Terbatas untuk media besar
- No preview tanpa rebuild

**Stack:**
```
CMS:        Decap CMS (NetlifyCMS)
Storage:    GitHub repo
Auth:       GitHub OAuth
Hosting:    Sama dengan portfolio (Vercel/Netlify)
```

---

#### **Option D: Supabase (Backend-as-a-Service)**
**Pros:**
- PostgreSQL + Auto REST API
- Built-in auth & storage
- Real-time subscriptions (optional)
- Admin UI bisa pakai react-admin / Refine
- Free tier generous

**Cons:**
- Harus build admin UI sendiri
- Terbatas customization di API layer

**Stack:**
```
Backend:    Supabase (PostgreSQL + REST + Auth + Storage)
Admin UI:   React Admin / Refine / Custom React
Hosting:    Vercel (frontend) + Supabase (backend)
```

---

### 2.2 Recommended Approach: **Option B (Strapi)** atau **Option D (Supabase + Custom Admin)**

**Untuk MVP & Speed: Strapi**  
**Untuk Long-term Flexibility: Supabase + Custom Admin**

Mari kita breakdown kedua opsi:

---

## 3. Option B: Strapi CMS Implementation Plan

### 3.1 Data Model (Content Types)

#### **Collection: Projects**
```typescript
interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string; // Rich text
  status: "draft" | "published";
  featured: boolean;
  
  // Media
  thumbnail: Media;
  images: Media[];
  videoPreview?: Media;
  
  // Metadata
  metric: string; // e.g. "60 FPS • 85% Lower Payload"
  tags: Tag[];
  technologies: Technology[];
  
  // Links
  liveUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  
  // Ordering
  displayOrder: number;
  
  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Collection: Experiences**
```typescript
interface Experience {
  id: string;
  title: string; // Job title
  company: string;
  companyLogo: Media;
  location: string;
  type: "full-time" | "contract" | "freelance";
  
  startDate: Date;
  endDate?: Date; // null = current
  
  description: string; // Rich text
  achievements: string[]; // Bullet points
  technologies: Technology[];
  
  displayOrder: number;
  status: "draft" | "published";
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Collection: Technologies**
```typescript
interface Technology {
  id: string;
  name: string;
  slug: string;
  category: "language" | "framework" | "tool" | "platform";
  icon: Media;
  description?: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  displayOrder: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Collection: Testimonials**
```typescript
interface Testimonial {
  id: string;
  quote: string;
  author: string;
  authorTitle: string;
  authorCompany: string;
  authorAvatar: Media;
  
  featured: boolean;
  displayOrder: number;
  status: "draft" | "published";
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Single Type: Profile**
```typescript
interface Profile {
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  timezone: string;
  
  tagline: string;
  bio: string; // Rich text
  
  avatar: Media;
  resume: Media; // PDF
  
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  };
  
  availability: "available" | "busy" | "unavailable";
  
  updatedAt: Date;
}
```

#### **Collection: Tags**
```typescript
interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string; // Tailwind class
  
  createdAt: Date;
}
```

---

### 3.2 Strapi Setup Flow

#### **Phase 1: Installation & Configuration (Day 1)**

```bash
# 1. Create Strapi project
npx create-strapi-app@latest portfolio-cms --quickstart

# 2. Install plugins
npm install @strapi/plugin-graphql
npm install @strapi/provider-upload-cloudflare-r2

# 3. Configure database (PostgreSQL)
# Edit config/database.js

# 4. Configure file upload
# Edit config/plugins.js
```

**File: `config/plugins.js`**
```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudflare-r2',
      providerOptions: {
        accessKeyId: env('CF_ACCESS_KEY_ID'),
        secretAccessKey: env('CF_SECRET_ACCESS_KEY'),
        endpoint: env('CF_ENDPOINT'),
        params: {
          Bucket: env('CF_BUCKET'),
        },
      },
    },
  },
  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      playgroundAlways: false,
      defaultLimit: 10,
      maxLimit: 20,
    },
  },
});
```

#### **Phase 2: Content Type Builder (Day 1-2)**

1. Buka Strapi admin: `http://localhost:1337/admin`
2. Create admin user
3. Build Content Types via UI:
   - Projects (Collection)
   - Experiences (Collection)
   - Technologies (Collection)
   - Testimonials (Collection)
   - Profile (Single Type)
   - Tags (Collection)

4. Setup relations:
   - Project → many Technologies
   - Project → many Tags
   - Experience → many Technologies

#### **Phase 3: API Configuration (Day 2)**

**File: `src/api/project/routes/project.js`**
```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/projects/featured',
      handler: 'project.findFeatured',
    },
    {
      method: 'GET',
      path: '/projects/slug/:slug',
      handler: 'project.findBySlug',
    },
  ],
};
```

**File: `src/api/project/controllers/project.js`**
```javascript
module.exports = {
  async findFeatured(ctx) {
    const projects = await strapi.entityService.findMany('api::project.project', {
      filters: { featured: true, status: 'published' },
      sort: { displayOrder: 'asc' },
      populate: ['thumbnail', 'tags', 'technologies'],
    });
    return { data: projects };
  },
  
  async findBySlug(ctx) {
    const { slug } = ctx.params;
    const projects = await strapi.entityService.findMany('api::project.project', {
      filters: { slug, status: 'published' },
      populate: ['thumbnail', 'images', 'videoPreview', 'tags', 'technologies'],
    });
    return { data: projects[0] || null };
  },
};
```

#### **Phase 4: Frontend Integration (Day 3)**

**File: `src/services/cms.ts`**
```typescript
const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:1337';
const CMS_TOKEN = import.meta.env.VITE_CMS_TOKEN;

class CMSService {
  private async fetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${CMS_URL}/api${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${CMS_TOKEN}`,
      },
    });
    if (!res.ok) throw new Error(`CMS API Error: ${res.statusText}`);
    return res.json();
  }

  async getProjects() {
    return this.fetch<{ data: Project[] }>('/projects?populate=*');
  }

  async getFeaturedProjects() {
    return this.fetch<{ data: Project[] }>('/projects/featured');
  }

  async getExperiences() {
    return this.fetch<{ data: Experience[] }>('/experiences?populate=*&sort=startDate:desc');
  }

  async getTechnologies() {
    return this.fetch<{ data: Technology[] }>('/technologies?populate=*&sort=displayOrder:asc');
  }

  async getProfile() {
    return this.fetch<{ data: Profile }>('/profile?populate=*');
  }

  async getTestimonials() {
    return this.fetch<{ data: Testimonial[] }>('/testimonials?filters[status][$eq]=published&sort=displayOrder:asc');
  }
}

export const cms = new CMSService();
```

**Usage di Components:**
```typescript
// src/components/sections/Works.tsx
import { useEffect, useState } from 'react';
import { cms } from '../../services/cms';

const Works = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cms.getProjects().then(res => {
      setProjects(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // ... render projects
  );
};
```

#### **Phase 5: Deploy (Day 4)**

**Strapi Hosting:**
- Railway (Recommended, $5-10/month)
- Heroku ($7/month hobby dyno)
- DigitalOcean App Platform ($10/month)
- AWS EC2 + RDS (complex, tapi scalable)

**Deploy Steps:**
```bash
# 1. Setup PostgreSQL database
# 2. Configure environment variables
DATABASE_URL=postgresql://...
CLOUDFLARE_ACCESS_KEY=...
JWT_SECRET=...
ADMIN_JWT_SECRET=...

# 3. Build & deploy
npm run build
npm run start
```

---

## 4. Option D: Supabase + Custom Admin Implementation Plan

### 4.1 Database Schema (PostgreSQL)

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  
  thumbnail_url TEXT,
  video_preview_url TEXT,
  metric TEXT,
  
  live_url TEXT,
  github_url TEXT,
  case_study_url TEXT,
  
  display_order INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technologies table
CREATE TABLE technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('language', 'framework', 'tool', 'platform')),
  icon_url TEXT,
  description TEXT,
  proficiency_level INT CHECK (proficiency_level BETWEEN 1 AND 5),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Technologies (many-to-many)
CREATE TABLE project_technologies (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT 'text-acid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Tags (many-to-many)
CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- Experiences table
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo_url TEXT,
  location TEXT,
  type TEXT CHECK (type IN ('full-time', 'contract', 'freelance')),
  
  start_date DATE NOT NULL,
  end_date DATE,
  
  description TEXT NOT NULL,
  achievements TEXT[],
  
  display_order INT DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experience Technologies (many-to-many)
CREATE TABLE experience_technologies (
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (experience_id, technology_id)
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  author_title TEXT NOT NULL,
  author_company TEXT NOT NULL,
  author_avatar_url TEXT,
  
  featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile table (single record)
CREATE TABLE profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  timezone TEXT,
  
  tagline TEXT,
  bio TEXT,
  
  avatar_url TEXT,
  resume_url TEXT,
  
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  dribbble_url TEXT,
  
  availability TEXT CHECK (availability IN ('available', 'busy', 'unavailable')) DEFAULT 'available',
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Public read policy (published content only)
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published experiences"
  ON experiences FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published testimonials"
  ON testimonials FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read technologies"
  ON technologies FOR SELECT
  USING (true);

CREATE POLICY "Public can read profile"
  ON profile FOR SELECT
  USING (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin full access projects"
  ON projects FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access experiences"
  ON experiences FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access testimonials"
  ON testimonials FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access technologies"
  ON technologies FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access profile"
  ON profile FOR ALL
  USING (auth.role() = 'authenticated');
```

### 4.2 Supabase Setup

```bash
# 1. Create Supabase project (free tier)
# 2. Run SQL schema above in SQL Editor
# 3. Configure Storage buckets:
#    - portfolio-images (public)
#    - portfolio-videos (public)
#    - portfolio-documents (public)

# 4. Enable Authentication
# Email/Password or GitHub OAuth
```

### 4.3 Admin Dashboard (React Admin / Refine)

**Option A: React Admin**
```bash
npm create vite@latest portfolio-admin -- --template react-ts
cd portfolio-admin
npm install react-admin ra-data-supabase @supabase/supabase-js
```

**File: `src/App.tsx`**
```typescript
import { Admin, Resource } from 'react-admin';
import { supabaseDataProvider } from 'ra-data-supabase';
import { createClient } from '@supabase/supabase-js';

import { ProjectList, ProjectEdit, ProjectCreate } from './resources/projects';
import { ExperienceList, ExperienceEdit, ExperienceCreate } from './resources/experiences';
import { TechnologyList, TechnologyEdit, TechnologyCreate } from './resources/technologies';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const dataProvider = supabaseDataProvider(supabase);

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="projects" list={ProjectList} edit={ProjectEdit} create={ProjectCreate} />
    <Resource name="experiences" list={ExperienceList} edit={ExperienceEdit} create={ExperienceCreate} />
    <Resource name="technologies" list={TechnologyList} edit={TechnologyEdit} create={TechnologyCreate} />
    <Resource name="testimonials" />
    <Resource name="profile" />
  </Admin>
);

export default App;
```

**File: `src/resources/projects.tsx`**
```typescript
import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  EditButton,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  Create,
  ImageField,
  ImageInput,
} from 'react-admin';

export const ProjectList = () => (
  <List>
    <Datagrid>
      <TextField source="title" />
      <TextField source="metric" />
      <BooleanField source="featured" />
      <TextField source="status" />
      <EditButton />
    </Datagrid>
  </List>
);

export const ProjectEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" fullWidth />
      <TextInput source="slug" fullWidth />
      <TextInput source="description" multiline fullWidth />
      <TextInput source="metric" />
      <BooleanInput source="featured" />
      <ImageInput source="thumbnail" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
      {/* ... more fields */}
    </SimpleForm>
  </Edit>
);

export const ProjectCreate = () => (
  <Create>
    <SimpleForm>
      {/* Same fields as Edit */}
    </SimpleForm>
  </Create>
);
```

---

## 5. Implementation Roadmap

### **Week 1: Backend Setup**
- [ ] Day 1-2: Setup Strapi/Supabase
- [ ] Day 2-3: Define data models & relations
- [ ] Day 3-4: Configure API endpoints
- [ ] Day 4-5: Setup file storage (Cloudflare R2)
- [ ] Day 5: Test CRUD operations

### **Week 2: Admin Dashboard**
- [ ] Day 1-2: Build admin UI (React Admin/Strapi admin)
- [ ] Day 3: Setup authentication
- [ ] Day 4: Test content management flow
- [ ] Day 5: Deploy admin to subdomain (admin.raypurba.com)

### **Week 3: Frontend Integration**
- [ ] Day 1-2: Create CMS service layer
- [ ] Day 2-3: Refactor sections untuk fetch dari API
- [ ] Day 3-4: Implement loading states & error handling
- [ ] Day 4-5: Add ISR/SSG dengan Next.js (optional)

### **Week 4: Polish & Launch**
- [ ] Day 1-2: Migrate existing content ke CMS
- [ ] Day 2-3: Test end-to-end workflow
- [ ] Day 3-4: Performance optimization (caching, CDN)
- [ ] Day 4-5: Documentation & training

---

## 6. Cost Estimation

### **Option B: Strapi**
| Service | Cost/Month |
|---------|------------|
| Railway (Backend + DB) | $10-20 |
| Cloudflare R2 (Storage) | ~$1 (1GB free) |
| Domain (admin subdomain) | $0 (jika sudah punya) |
| **Total** | **$11-21/month** |

### **Option D: Supabase**
| Service | Cost/Month |
|---------|------------|
| Supabase (Free Tier) | $0 (500MB DB, 1GB storage) |
| Vercel/Netlify (Admin hosting) | $0 (hobby plan) |
| **Total** | **$0/month** (sampai scale up) |

---

## 7. Recommendations

### **For MVP (Launch in 2-3 weeks):**
✅ **Go with Supabase + React Admin**
- Free tier
- Fast setup
- PostgreSQL power
- Custom admin UI flexibility

### **For Production Scale (3-6 months):**
✅ **Migrate to Strapi or Custom Backend**
- Better content workflows
- More control
- Built-in versioning
- Better media management

---

## 8. Next Steps

1. **Decision**: Pilih antara Strapi atau Supabase
2. **Setup**: Spin up backend (1 hari)
3. **Model**: Define schema (1 hari)
4. **Admin**: Build CRUD UI (2-3 hari)
5. **Integration**: Connect frontend (2-3 hari)
6. **Migration**: Migrate content (1 hari)
7. **Deploy**: Push to production (1 hari)

**Total Timeline: 2-3 weeks untuk MVP**

---

**Ready to implement? Mau mulai dari mana?**
