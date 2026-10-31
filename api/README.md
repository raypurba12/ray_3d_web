# Portfolio API — Custom CMS Backend

REST API untuk portfolio `raypurba-3d`, dibangun dengan Express 5, TypeScript, Prisma, dan MySQL sesuai `../docs/CUSTOM_CMS_ARCHITECTURE.md`.

## Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript 7 |
| ORM / DB | Prisma 5.22 + MySQL 8 |
| Auth | JWT (access + refresh) + bcrypt (12 rounds) |
| Validation | Zod 4 |
| Upload | Multer (memory storage) + Cloudinary opsional |
| Dev runner | tsx + nodemon |

## Quick Start

```powershell
cd d:\FORTOFOLIO\raypurba-3d\api
npm install
copy .env.example .env   # lalu sesuaikan DATABASE_URL
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Server berjalan di `http://localhost:5000`.

### Default Admin (hasil seed)

- Email: `admin@raypurba.com`
- Password: `admin123`

> Ganti password/secret sebelum deploy produksi.

## Scripts

| Script | Fungsi |
| :--- | :--- |
| `npm run dev` | Nodemon + tsx (watch mode) |
| `npm run build` | Compile TypeScript ke `dist/` |
| `npm start` | Jalankan hasil build (`dist/index.js`) |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Buat/terapkan migrasi dev |
| `npm run prisma:studio` | Prisma Studio (http://localhost:5555) |
| `npm run prisma:seed` | Seed admin, technologies, tags, profile |

## Environment Variables

| Variable | Contoh | Keterangan |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port server |
| `CLIENT_URL` | `http://localhost:5173` | Whitelist CORS, pisahkan dengan koma jika lebih dari satu |
| `DATABASE_URL` | `mysql://root:@localhost:3306/portfolio_cms` | Koneksi MySQL |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | random 32+ chars | Wajib diisi, tanpa fallback |
| `JWT_EXPIRE` / `JWT_REFRESH_EXPIRE` | `7d` / `30d` | Masa berlaku token |
| `MAX_FILE_SIZE` | `5242880` | Batas upload (byte) |
| `UPLOAD_DIR` | `uploads` | Folder lokal untuk file upload |
| `CLOUDINARY_*` | — | Opsional; jika lengkap, upload disimpan ke Cloudinary |

## API Endpoints

Semua respons memakai format `{ success, message?, data?, error?, errors? }`.
Endpoint **protected** memerlukan header `Authorization: Bearer <accessToken>`.

### Health

| Method | Endpoint | Akses |
| :--- | :--- | :--- |
| GET | `/api/health` | Public |

### Auth

| Method | Endpoint | Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | Public (rate limited) | `{ email, password }` |
| POST | `/api/auth/register` | Protected (ADMIN/SUPER_ADMIN) | `{ email, password, name }` |
| POST | `/api/auth/refresh` | Public | `{ refreshToken }`, token dirotasi |
| GET | `/api/auth/me` | Protected | Data user dari database |

### Projects

| Method | Endpoint | Akses |
| :--- | :--- | :--- |
| GET | `/api/projects` | Public |
| GET | `/api/projects/:id` | Public |
| POST | `/api/projects` | Protected |
| PUT | `/api/projects/:id` | Protected |
| DELETE | `/api/projects/:id` | Protected |
| POST | `/api/projects/:id/upload` | Protected (multipart, field `image`) |

Body project: `title`, `description`, `image`, `demoUrl?`, `githubUrl?`, `featured?`, `order?`, `technologies?` (array ID teknologi), `tags?` (array nama tag — dibuat otomatis beserta slug).

### Technologies

| Method | Endpoint | Akses |
| :--- | :--- | :--- |
| GET | `/api/technologies` | Public |
| GET | `/api/technologies/:id` | Public |
| POST | `/api/technologies` | Protected |
| PUT | `/api/technologies/:id` | Protected |
| DELETE | `/api/technologies/:id` | Protected |

Body: `name`, `icon`, `category` (`FRONTEND` \| `BACKEND` \| `DATABASE` \| `DEVOPS` \| `DESIGN` \| `OTHER`), `order?`.

### Experiences

| Method | Endpoint | Akses |
| :--- | :--- | :--- |
| GET | `/api/experiences` | Public |
| GET | `/api/experiences/:id` | Public |
| POST | `/api/experiences` | Protected |
| PUT | `/api/experiences/:id` | Protected |
| DELETE | `/api/experiences/:id` | Protected |

Body: `title`, `company`, `startDate` (ISO), `endDate?` (`null`/kosong = current), `description`, `companyLogo?`, `location?`, `technologies?` (array ID), `order?`.

### Testimonials

| Method | Endpoint | Akses |
| :--- | :--- | :--- |
| GET | `/api/testimonials` | Public |
| GET | `/api/testimonials/:id` | Public |
| POST | `/api/testimonials` | Protected |
| PUT | `/api/testimonials/:id` | Protected |
| DELETE | `/api/testimonials/:id` | Protected |

Body: `name`, `role`, `company`, `content`, `avatar?`, `rating?` (1–5), `featured?`, `order?`.

### Profile

| Method | Endpoint | Akses |
| :--- | :--- | :--- |
| GET | `/api/profile` | Public |
| PUT | `/api/profile` | Protected |

`PUT` bersifat parsial. Jika profile belum ada, field `name`, `tagline`, `bio`, `avatar`, dan `email` wajib diisi untuk membuat record baru.

### Upload

| Method | Endpoint | Akses | Field multipart |
| :--- | :--- | :--- | :--- |
| POST | `/api/upload` | Protected | `file` |
| POST | `/api/upload/multiple` | Protected | `files` (maks. 10) |
| DELETE | `/api/upload/:filename` | Protected | — |

Tipe yang diterima: JPEG, PNG, WebP, GIF (SVG sengaja ditolak untuk mencegah stored XSS). Ukuran maksimum mengikuti `MAX_FILE_SIZE` (default 5MB). File lokal disajikan di `/uploads/<filename>`.

## Data Conventions

- Field opsional berupa URL bisa dikirim `""` atau `null` untuk mengosongkan nilainya.
- `technologies` selalu berisi **ID** teknologi (ambil dari `GET /api/technologies`).
- `tags` pada project berisi **nama tag**; tag baru dibuat otomatis dengan slug unik.
- Tanggal experience dikirim sebagai string ISO (`2024-01-15` atau ISO lengkap).

## Project Structure

```bash
api/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── index.ts              # Entry point + graceful shutdown
│   ├── server.ts             # Express app, CORS, static, routes
│   ├── config/               # database, paths, cloudinary
│   ├── middleware/           # auth, validate, error, upload, rateLimit
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── schemas/
│   ├── types/
│   └── utils/                # jwt, password, response, errors, slug
├── uploads/
├── .env.example
├── nodemon.json
└── tsconfig.json
```

## Security

- Password di-hash bcrypt (12 rounds); password tidak pernah dikembalikan API.
- JWT access + refresh; secret wajib di-set via environment.
- Rate limit endpoint auth: login 10 req/15 menit, register 20 req/jam per IP.
- Validasi semua body dengan Zod; error validasi mengembalikan detail field.
- CORS whitelist dari `CLIENT_URL` (mendukung beberapa origin dipisah koma).
- Prisma mencegah SQL injection; error 500 tidak membocorkan detail internal.
- Upload dibatasi tipe & ukuran; nama file dibuat acak oleh server.

## Catatan Toolchain

- TypeScript 7 menghapus `moduleResolution: node10`, sehingga `tsconfig.json` memakai `module`/`moduleResolution` = `node16` (output tetap CommonJS).
- `ts-node` 10 tidak kompatibel dengan TypeScript 7, jadi script dev/seed memakai `tsx`.
- Express 5 otomatis meneruskan rejection dari async handler ke error middleware.

## Troubleshooting

**MySQL tidak terkoneksi** — pastikan service MySQL (mis. Laragon) berjalan dan `DATABASE_URL` benar.

**Prisma Client belum ada** — jalankan `npm run prisma:generate`.

**Reset database** — `npx prisma migrate reset` lalu `npm run prisma:seed`.

**Port 5000 dipakai** — ubah `PORT` di `.env` atau hentikan proses yang memakai port tersebut.
