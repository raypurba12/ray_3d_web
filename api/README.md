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
copy .env.example .env   # isi DATABASE_URL, JWT secrets, ADMIN_EMAIL, ADMIN_PASSWORD
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Server berjalan di `http://localhost:5000`. Health check: `GET /api/health`.

### Akun admin (hasil seed)

Seed membaca `ADMIN_EMAIL` dan `ADMIN_PASSWORD` dari environment. Di produksi
keduanya wajib diisi; password minimal 12 karakter dan harus memadukan minimal
3 dari 4 kategori (huruf kecil, huruf besar, angka, simbol). Tidak ada password
default di kode maupun dokumentasi. Ganti juga `JWT_SECRET` dan
`JWT_REFRESH_SECRET` sebelum deploy.

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
| `JWT_EXPIRE` / `JWT_REFRESH_EXPIRE` | `15m` / `30d` | Masa berlaku token |
| `MAX_FILE_SIZE` | `5242880` | Batas upload gambar/PDF (byte) |
| `MAX_VIDEO_FILE_SIZE` | `26214400` | Batas upload video demo MP4/WebM (byte) |
| `UPLOAD_DIR` | `uploads` | Folder lokal untuk file upload; gunakan path absolut di produksi |
| `CLOUDINARY_*` | — | Opsional; jika lengkap, upload disimpan ke Cloudinary |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | — | Kredensial admin untuk `prisma:seed`; wajib di produksi |

Validasi environment berjalan saat boot: nilai lemah, origin `localhost` di
produksi, atau konfigurasi Cloudinary setengah-setengah akan menggagalkan
startup.

## API Endpoints

Semua respons memakai format `{ success, message?, data?, error?, errors? }`.
Login dan refresh mengirim token lewat cookie `HttpOnly` (`rp_access` untuk
`/api`, `rp_refresh` untuk `/api/auth`); respons JSON tidak lagi memuat token.
Klien browser cukup mengirim request dengan `credentials: 'include'`. Endpoint
**protected** bisa juga memakai header `Authorization: Bearer <accessToken>`
untuk klien non-browser.

### Health

| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| GET | `/api/health/live` | Proses hidup (tanpa DB) |
| GET | `/api/health` | Cek `SELECT 1`; 503 bila DB mati |
| GET | `/api/health/ready` | Sama dengan `/api/health` untuk readiness probe |

### Auth

| Method | Endpoint | Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | Public (rate limited) | `{ email, password }`; set cookie sesi |
| POST | `/api/auth/register` | SUPER_ADMIN | `{ email, password, name }` |
| POST | `/api/auth/refresh` | Public | Rotasi token dari cookie `rp_refresh` |
| POST | `/api/auth/logout` | Public | Mencabut sesi + hapus cookie |
| PUT | `/api/auth/password` | Protected | `{ currentPassword, newPassword }` |
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

Body project: `title`, `description`, `image`, `demoUrl?`, `githubUrl?`, `videoUrl?` (link YouTube/Vimeo atau path `/uploads/<file>`), `featured?`, `order?`, `technologies?` (array ID teknologi), `tags?` (array nama tag — dibuat otomatis beserta slug).

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
| POST | `/api/upload/video` | Protected | `file` (MP4/WebM, maks. 25MB) |
| POST | `/api/upload/multiple` | Protected | `files` (maks. 10) |
| DELETE | `/api/upload/:filename` | Protected | — |

Tipe yang diterima: JPEG, PNG, WebP, GIF, dan PDF (SVG sengaja ditolak untuk
mencegah stored XSS). Endpoint `/api/upload/video` khusus MP4/WebM dan memakai
`MAX_VIDEO_FILE_SIZE` (default 25MB); isi file tetap diverifikasi lewat magic
bytes. Ukuran maksimum upload gambar mengikuti `MAX_FILE_SIZE` (default 5MB),
maksimal 10 file per request, dan endpoint upload dibatasi 40 request/15
menit per user. File lokal disajikan di `/uploads/<filename>`.

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
- Access token 15 menit; refresh token 30 hari dan **dirotasi** setiap dipakai.
  Reuse token lama di luar jendela 10 detik mencabut seluruh family token.
- `logout` mencabut refresh session; ganti password menaikkan `tokenVersion`
  sehingga semua access token lama ditolak, lalu mencabut semua refresh session.
- Registrasi admin hanya untuk `SUPER_ADMIN`.
- Rate limit endpoint auth: login 10 req/15 menit, register 20 req/jam per IP.
- Validasi semua body dengan Zod; error validasi mengembalikan detail field.
- CORS whitelist dari `CLIENT_URL` (mendukung beberapa origin dipisah koma).
- Helmet + request logging (pino) dengan request id; header `Authorization`
  diredaksi dari log.
- Prisma mencegah SQL injection; error 500 tidak membocorkan detail internal.
- Upload divalidasi dengan magic bytes, dibatasi tipe/ukuran/jumlah, dan nama
  file dibuat acak oleh server.
- Health check DB mengembalikan 503 saat MySQL tidak tersedia.

## Deploy

Produksi memakai Domainesia cPanel (Node.js App + MySQL). Ikuti
[`../docs/DEPLOY_CPANEL.md`](../docs/DEPLOY_CPANEL.md).

## Catatan Toolchain

- TypeScript 7 menghapus `moduleResolution: node10`, sehingga `tsconfig.json` memakai `module`/`moduleResolution` = `node16` (output tetap CommonJS).
- `ts-node` 10 tidak kompatibel dengan TypeScript 7, jadi script dev/seed memakai `tsx`.
- Express 5 otomatis meneruskan rejection dari async handler ke error middleware.

## Troubleshooting

**MySQL tidak terkoneksi** — pastikan service MySQL (mis. Laragon) berjalan dan `DATABASE_URL` benar.

**Prisma Client belum ada** — jalankan `npm run prisma:generate`.

**Reset database** — `npx prisma migrate reset` lalu `npm run prisma:seed`.

**Port 5000 dipakai** — ubah `PORT` di `.env` atau hentikan proses yang memakai port tersebut.
