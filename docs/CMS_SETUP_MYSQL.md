# Portfolio CMS Setup Guide — Strapi + MySQL

**Database**: MySQL 8.0+  
**CMS**: Strapi v4  
**Timeline**: 2-3 hari untuk MVP  

---

## Phase 1: MySQL Database Setup

### Option A: Local MySQL (Development)

```bash
# Install MySQL (Windows)
# Download dari: https://dev.mysql.com/downloads/installer/

# Atau pakai chocolatey
choco install mysql

# Start MySQL service
net start MySQL80

# Login ke MySQL
mysql -u root -p
```

**Create Database:**
```sql
CREATE DATABASE portfolio_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'portfolio_admin'@'localhost' IDENTIFIED BY 'your_secure_password_here';

GRANT ALL PRIVILEGES ON portfolio_cms.* TO 'portfolio_admin'@'localhost';

FLUSH PRIVILEGES;
```

### Option B: Cloud MySQL (Production)

**PlanetScale (Recommended — Free Tier)**
1. Sign up: https://planetscale.com
2. Create new database: `portfolio-cms`
3. Copy connection string

**Alternative: AWS RDS MySQL**
```
Endpoint: your-db.xxxxx.ap-southeast-1.rds.amazonaws.com
Port: 3306
Database: portfolio_cms
Username: admin
Password: ***
```

---

## Phase 2: Strapi Installation

### Step 1: Create Strapi Project

```bash
# Create new directory
mkdir portfolio-cms
cd portfolio-cms

# Create Strapi app dengan MySQL
npx create-strapi-app@latest backend --quickstart --no-run

cd backend
```

### Step 2: Install MySQL Dependency

```bash
npm install mysql2
```

### Step 3: Configure Database

**File: `config/database.js`**
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

**File: `.env`**
```bash
HOST=0.0.0.0
PORT=1337

# MySQL Connection
DATABASE_CLIENT=mysql2
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=portfolio_cms
DATABASE_USERNAME=portfolio_admin
DATABASE_PASSWORD=your_secure_password_here
DATABASE_SSL=false

# Secrets (generate dengan: openssl rand -base64 32)
APP_KEYS=generate_random_key_here
API_TOKEN_SALT=generate_random_key_here
ADMIN_JWT_SECRET=generate_random_key_here
TRANSFER_TOKEN_SALT=generate_random_key_here
JWT_SECRET=generate_random_key_here

# Cloudflare R2 for File Upload (Optional)
CF_ACCESS_KEY_ID=your_access_key
CF_SECRET_ACCESS_KEY=your_secret_key
CF_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CF_BUCKET=portfolio-media
CF_PUBLIC_URL=https://media.raypurba.com
```

### Step 4: Start Strapi

```bash
npm run develop
```

Visit: http://localhost:1337/admin

Create admin account:
- Email: your@email.com
- Password: (strong password)

---

## Phase 3: Content Types Setup

### Collection Type: **Projects**

Click **Content-Type Builder** → **Create new collection type**

**Name:** `project`

**Fields:**

| Field Name | Type | Settings |
|------------|------|----------|
| title | Text (Short) | Required, Unique |
| slug | UID (from title) | Required, Unique |
| description | Text (Long) | Required |
| longDescription | Rich Text (Markdown) | Optional |
| status | Enumeration | `draft`, `published` (default: draft) |
| featured | Boolean | Default: false |
| thumbnail | Media (Single) | Required |
| images | Media (Multiple) | Optional |
| videoPreview | Media (Single) | Optional |
| metric | Text (Short) | e.g. "60 FPS • 85% Lower Payload" |
| liveUrl | Text (Short) | Optional |
| githubUrl | Text (Short) | Optional |
| caseStudyUrl | Text (Short) | Optional |
| displayOrder | Number (Integer) | Default: 0 |
| publishedAt | DateTime | Optional |
| tags | Relation (many-to-many with Tag) | |
| technologies | Relation (many-to-many with Technology) | |

**Advanced Settings:**
- Enable draft/publish system
- Enable internationalization (optional)

---

### Collection Type: **Technologies**

**Name:** `technology`

**Fields:**

| Field Name | Type | Settings |
|------------|------|----------|
| name | Text (Short) | Required, Unique |
| slug | UID (from name) | Required, Unique |
| category | Enumeration | `language`, `framework`, `tool`, `platform` |
| icon | Media (Single) | Required |
| description | Text (Long) | Optional |
| proficiencyLevel | Number (Integer) | Min: 1, Max: 5 |
| displayOrder | Number (Integer) | Default: 0 |

---

### Collection Type: **Experiences**

**Name:** `experience`

**Fields:**

| Field Name | Type | Settings |
|------------|------|----------|
| title | Text (Short) | Required (Job Title) |
| company | Text (Short) | Required |
| companyLogo | Media (Single) | Optional |
| location | Text (Short) | Optional |
| employmentType | Enumeration | `full-time`, `contract`, `freelance` |
| startDate | Date | Required |
| endDate | Date | Optional (null = current) |
| description | Rich Text | Required |
| achievements | JSON | Array of strings |
| displayOrder | Number (Integer) | Default: 0 |
| status | Enumeration | `draft`, `published` |
| technologies | Relation (many-to-many with Technology) | |

**JSON Schema for `achievements`:**
```json
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

---

### Collection Type: **Testimonials**

**Name:** `testimonial`

**Fields:**

| Field Name | Type | Settings |
|------------|------|----------|
| quote | Text (Long) | Required |
| author | Text (Short) | Required |
| authorTitle | Text (Short) | Required |
| authorCompany | Text (Short) | Required |
| authorAvatar | Media (Single) | Optional |
| featured | Boolean | Default: false |
| displayOrder | Number (Integer) | Default: 0 |
| status | Enumeration | `draft`, `published` |

---

### Collection Type: **Tags**

**Name:** `tag`

**Fields:**

| Field Name | Type | Settings |
|------------|------|----------|
| name | Text (Short) | Required, Unique |
| slug | UID (from name) | Required, Unique |
| color | Text (Short) | Default: "text-acid" |

---

### Single Type: **Profile**

**Name:** `profile`

**Fields:**

| Field Name | Type | Settings |
|------------|------|----------|
| fullName | Text (Short) | Required |
| email | Email | Required |
| phone | Text (Short) | Optional |
| location | Text (Short) | Required |
| timezone | Text (Short) | Default: "Asia/Jakarta" |
| tagline | Text (Short) | Required |
| bio | Rich Text | Required |
| avatar | Media (Single) | Optional |
| resume | Media (Single) | Optional (PDF) |
| githubUrl | Text (Short) | Optional |
| linkedinUrl | Text (Short) | Optional |
| twitterUrl | Text (Short) | Optional |
| dribbbleUrl | Text (Short) | Optional |
| availability | Enumeration | `available`, `busy`, `unavailable` |

---

## Phase 4: API Configuration

### Enable Public Access

**Settings → Users & Permissions Plugin → Roles → Public**

Enable these permissions:

**Project:**
- `find` ✅
- `findOne` ✅

**Technology:**
- `find` ✅
- `findOne` ✅

**Experience:**
- `find` ✅
- `findOne` ✅

**Testimonial:**
- `find` ✅
- `findOne` ✅

**Tag:**
- `find` ✅

**Profile:**
- `find` ✅

### Generate API Token

**Settings → API Tokens → Create new API Token**

- Name: `Portfolio Frontend`
- Token type: `Read-only`
- Duration: `Unlimited`

Copy token: `xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Phase 5: Custom Controllers (Optional)

### Featured Projects Endpoint

**File: `src/api/project/routes/custom-routes.js`**
```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/projects/featured',
      handler: 'project.findFeatured',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/projects/slug/:slug',
      handler: 'project.findBySlug',
      config: {
        auth: false,
      },
    },
  ],
};
```

**File: `src/api/project/controllers/project.js`**
```javascript
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::project.project', ({ strapi }) => ({
  async findFeatured(ctx) {
    const projects = await strapi.entityService.findMany('api::project.project', {
      filters: { 
        featured: true, 
        status: 'published',
      },
      sort: { displayOrder: 'asc' },
      populate: {
        thumbnail: true,
        tags: true,
        technologies: {
          populate: ['icon'],
        },
      },
    });

    return { data: projects };
  },

  async findBySlug(ctx) {
    const { slug } = ctx.params;

    const projects = await strapi.entityService.findMany('api::project.project', {
      filters: { 
        slug, 
        status: 'published',
      },
      populate: {
        thumbnail: true,
        images: true,
        videoPreview: true,
        tags: true,
        technologies: {
          populate: ['icon'],
        },
      },
    });

    if (!projects || projects.length === 0) {
      return ctx.notFound('Project not found');
    }

    return { data: projects[0] };
  },
}));
```

---

## Phase 6: File Upload (Cloudflare R2)

### Install Plugin

```bash
npm install @strapi/provider-upload-cloudflare-r2
```

### Configure Plugin

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
        cloudflarePublicAccessUrl: env('CF_PUBLIC_URL'),
      },
    },
  },
});
```

**Alternative: Local Upload (Development)**
```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024, // 250MB
    },
  },
});
```

---

## Phase 7: Frontend Integration

### Install Dependencies

```bash
# Di portfolio frontend folder
npm install axios
```

### CMS Service

**File: `src/services/cms.ts`**
```typescript
import axios from 'axios';

const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:1337';
const CMS_TOKEN = import.meta.env.VITE_CMS_TOKEN;

const api = axios.create({
  baseURL: `${CMS_URL}/api`,
  headers: {
    'Authorization': `Bearer ${CMS_TOKEN}`,
  },
});

export interface CMSImage {
  id: number;
  url: string;
  alternativeText?: string;
  width: number;
  height: number;
}

export interface CMSProject {
  id: number;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  metric?: string;
  liveUrl?: string;
  githubUrl?: string;
  thumbnail: { data: { attributes: CMSImage } };
  images?: { data: Array<{ attributes: CMSImage }> };
  tags: { data: Array<{ attributes: { name: string; slug: string; color: string } }> };
  technologies: { data: Array<{ attributes: { name: string; icon: { data: { attributes: CMSImage } } } }> };
}

export interface CMSExperience {
  id: number;
  title: string;
  company: string;
  companyLogo?: { data: { attributes: CMSImage } };
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
  technologies: { data: Array<{ attributes: { name: string } }> };
}

export interface CMSTechnology {
  id: number;
  name: string;
  slug: string;
  category: string;
  icon: { data: { attributes: CMSImage } };
  proficiencyLevel?: number;
}

export interface CMSTestimonial {
  id: number;
  quote: string;
  author: string;
  authorTitle: string;
  authorCompany: string;
  authorAvatar?: { data: { attributes: CMSImage } };
}

export interface CMSProfile {
  fullName: string;
  email: string;
  location: string;
  timezone: string;
  tagline: string;
  bio: string;
  avatar?: { data: { attributes: CMSImage } };
  resume?: { data: { attributes: CMSImage } };
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  availability: string;
}

class CMSService {
  async getProjects(): Promise<CMSProject[]> {
    const { data } = await api.get('/projects', {
      params: {
        'filters[status][$eq]': 'published',
        'populate': 'thumbnail,tags,technologies.icon',
        'sort': 'displayOrder:asc',
      },
    });
    return data.data.map((item: any) => item.attributes);
  }

  async getFeaturedProjects(): Promise<CMSProject[]> {
    const { data } = await api.get('/projects/featured');
    return data.data;
  }

  async getProjectBySlug(slug: string): Promise<CMSProject | null> {
    const { data } = await api.get(`/projects/slug/${slug}`);
    return data.data;
  }

  async getExperiences(): Promise<CMSExperience[]> {
    const { data } = await api.get('/experiences', {
      params: {
        'filters[status][$eq]': 'published',
        'populate': 'companyLogo,technologies',
        'sort': 'startDate:desc',
      },
    });
    return data.data.map((item: any) => item.attributes);
  }

  async getTechnologies(): Promise<CMSTechnology[]> {
    const { data } = await api.get('/technologies', {
      params: {
        'populate': 'icon',
        'sort': 'displayOrder:asc',
      },
    });
    return data.data.map((item: any) => item.attributes);
  }

  async getTestimonials(): Promise<CMSTestimonial[]> {
    const { data } = await api.get('/testimonials', {
      params: {
        'filters[status][$eq]': 'published',
        'populate': 'authorAvatar',
        'sort': 'displayOrder:asc',
      },
    });
    return data.data.map((item: any) => item.attributes);
  }

  async getProfile(): Promise<CMSProfile> {
    const { data } = await api.get('/profile', {
      params: {
        'populate': 'avatar,resume',
      },
    });
    return data.data.attributes;
  }

  // Helper: Get full image URL
  getImageUrl(image: CMSImage | undefined): string {
    if (!image) return '';
    return image.url.startsWith('http') ? image.url : `${CMS_URL}${image.url}`;
  }
}

export const cms = new CMSService();
```

### Environment Variables

**File: `.env`**
```bash
VITE_CMS_URL=http://localhost:1337
VITE_CMS_TOKEN=your_api_token_here
```

### Usage in Components

**File: `src/components/sections/Works.tsx`**
```typescript
import { useEffect, useState } from 'react';
import { cms, CMSProject } from '../../services/cms';

const Works = () => {
  const [projects, setProjects] = useState<CMSProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cms.getProjects()
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="canvas-loader" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  );
};
```

---

## Phase 8: Deploy to Production

### Deploy Strapi (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add MySQL database
railway add

# Set environment variables
railway variables set DATABASE_CLIENT=mysql2
railway variables set DATABASE_HOST=your-mysql-host
railway variables set DATABASE_PORT=3306
railway variables set DATABASE_NAME=railway
railway variables set DATABASE_USERNAME=root
railway variables set DATABASE_PASSWORD=***

# Deploy
railway up
```

### Alternative: Manual VPS Deploy

```bash
# SSH to server
ssh user@your-server.com

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone https://github.com/your-username/portfolio-cms.git
cd portfolio-cms/backend

# Install dependencies
npm install --production

# Build
npm run build

# Install PM2
sudo npm install -g pm2

# Start with PM2
pm2 start npm --name "strapi-cms" -- start

# Save PM2 config
pm2 save
pm2 startup
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name cms.raypurba.com;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Quick Start Commands

```bash
# Development
npm run develop

# Build for production
npm run build

# Start production
npm start

# Reset database
npm run strapi admin:reset-user-password --email=admin@example.com --password=NewPassword123
```

---

## Cost Breakdown (MySQL + Strapi)

| Service | Provider | Cost/Month |
|---------|----------|------------|
| MySQL Database | PlanetScale Free | $0 (5GB storage, 1B rows) |
| Strapi Backend | Railway | $5-10 (512MB RAM) |
| File Storage | Cloudflare R2 | ~$1 (1GB free) |
| **Total** | | **$6-11/month** |

---

**Ready to implement! Mau mulai sekarang?**
