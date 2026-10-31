# Deploy ke Domainesia cPanel (Shared/Cloud Hosting)

Target arsitektur:

- **Frontend statis** (hasil `vite build`) di `public_html` domain utama.
- **API Node.js** sebagai cPanel Node.js App (Passenger) di app root di luar
  `public_html`, diakses lewat subdomain `api.<domain>`.
- **MySQL** dari cPanel, user/database berprefix akun.
- **Upload** disimpan di folder persisten di luar app root.

> Ganti placeholder berikut sebelum mulai: `<domain>`, `<user>` (username
> cPanel), `<db_name>`, `<db_user>`, `<db_pass>`.

---

## 0. Prasyarat

1. Domain utama sudah aktif dan mengarah ke hosting.
2. Subdomain `api.<domain>` dibuat (Document Root boleh apa saja; Passenger
   akan mengabaikannya).
3. Database MySQL + user dibuat di cPanel, lalu user ditambahkan ke database
   dengan ALL PRIVILEGES.
4. "Setup Node.js App" tersedia dan Node.js 20 atau 22 bisa dipilih.
5. Akses Terminal/SSH (disarankan). Tanpa SSH, build API dilakukan di lokal
   dan file diunggah.

Catat:

- Versi Node yang tersedia di cPanel.
- OpenSSL server (`openssl version` di Terminal) untuk `binaryTargets` Prisma.
- Nama database, user, dan password yang sudah di-URL-encode bila mengandung
  karakter khusus.

---

## 1. Frontend (public_html)

Build di lokal, bukan di server, agar env `VITE_*` ter-embed saat build.

```bash
# dari root repo
npm ci
VITE_API_URL=https://api.<domain>/api \
VITE_SITE_URL=https://<domain> \
VITE_CONTACT_EMAIL=you@example.com \
npm run build
```

Windows PowerShell:

```powershell
$env:VITE_API_URL="https://api.<domain>/api"
$env:VITE_SITE_URL="https://<domain>"
$env:VITE_CONTACT_EMAIL="you@example.com"
npm run build
```

Unggah **isi** `dist/` ke `public_html` (bukan foldernya), termasuk:

- `index.html`
- `assets/`
- `.htaccess` — SPA rewrite, HTTPS, cache, security headers
- `robots.txt`, `sitemap.xml`, `logo.svg`, `logo.png`

Jangan upload `.env`, `node_modules`, atau folder `src/`.

Setelah upload, cek:

- `https://<domain>/admin/projects` mengembalikan `index.html` (200), bukan 404.
- Aset `/assets/...` dan `/logo.svg` mengembalikan 200.
- `http://<domain>` redirect ke HTTPS.

---

## 2. API (cPanel Node.js App)

### 2.1 Buat aplikasi

Di cPanel → **Setup Node.js App** → Create Application:

| Field | Nilai |
| :--- | :--- |
| Node.js version | 20 atau 22 |
| Application mode | Production |
| Application root | `api_app` (di luar `public_html`, mis. `/home/<user>/api_app`) |
| Application URL | `api.<domain>` |
| Application startup file | `dist/index.js` |

Passenger menjalankan aplikasi dengan `process.env.PORT` yang diberikan
hosting. Kode sudah memakai `listen(process.env.PORT)` tanpa konversi paksa,
jadi jangan mengganti startup file ke `npm start` atau nodemon.

### 2.2 Environment variables (UI cPanel)

Tambahkan lewat tombol **Add Environment Variable**. Jangan membuat `.env` di
server — file `.env` akan menimpa nilai cPanel.

| Variable | Contoh |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://<domain>,https://www.<domain>` |
| `DATABASE_URL` | `mysql://<db_user>:<url_encoded_pass>@127.0.0.1:3306/<db_name>` |
| `JWT_SECRET` | 48+ karakter acak |
| `JWT_REFRESH_SECRET` | 48+ karakter acak, berbeda dari `JWT_SECRET` |
| `JWT_EXPIRE` | `15m` |
| `JWT_REFRESH_EXPIRE` | `30d` |
| `MAX_FILE_SIZE` | `5242880` |
| `UPLOAD_DIR` | `/home/<user>/portfolio-uploads` |
| `CLOUDINARY_CLOUD_NAME` | opsional |
| `CLOUDINARY_API_KEY` | opsional |
| `CLOUDINARY_API_SECRET` | opsional |
| `ADMIN_EMAIL` | email admin asli |
| `ADMIN_PASSWORD` | password kuat (12+ karakter) |

Catatan:

- `CLIENT_URL` adalah daftar origin persis, tanpa trailing slash, dipisah koma.
  Sertakan versi `www` bila dipakai.
- Jika password database mengandung karakter khusus, URL-encode
  (mis. `@` → `%40`).
- Gunakan `127.0.0.1` bila `localhost` gagal menghubungi MySQL cPanel.
- Cloudinary harus diisi lengkap atau dikosongkan semua; konfigurasi
  setengah-setengah membuat API gagal boot.

### 2.3 Upload kode + install

Build di lokal:

```bash
cd api
npm ci
npm run build
npx prisma generate
```

Unggah ke application root (`/home/<user>/api_app`):

- `dist/`
- `prisma/` (termasuk `schema.prisma` dan folder `migrations/`)
- `package.json`, `package-lock.json`

Di Terminal cPanel:

```bash
cd ~/api_app
npm install --omit=dev        # postinstall menjalankan prisma generate untuk Linux
npx prisma migrate deploy     # terapkan migrasi produksi
```

Jika Node/Prisma gagal memuat engine, sesuaikan `generator client` di
`prisma/schema.prisma`:

```prisma
binaryTargets = ["native", "debian-openssl-3.0.x"]
# tambahkan "debian-openssl-1.1.x" bila OpenSSL server masih 1.1
```

Lalu jalankan ulang `npx prisma generate`.

Buat folder upload persisten:

```bash
mkdir -p ~/portfolio-uploads
```

Pastikan kepemilikan/izin dapat ditulis oleh proses Passenger. Jalankan
**Restart** aplikasi dari UI cPanel setelah mengubah env atau kode.

### 2.4 Seed admin (sekali)

Karena `tsx` adalah devDependency dan server di-install dengan
`--omit=dev`, pilih salah satu:

**A. Dari lokal (disarankan).** Aktifkan Remote MySQL di cPanel dan
whitelist IP lokal, lalu dari `api/`:

```bash
DATABASE_URL="mysql://<db_user>:<pass>@<server_ip>:3306/<db_name>" \
ADMIN_EMAIL="you@example.com" \
ADMIN_PASSWORD="Strong-Password-123!" \
npm run prisma:seed
```

**B. Di server.** Install `tsx` sementara lalu jalankan seed:

```bash
cd ~/api_app
npm install --no-save tsx
npx prisma db seed
```

Keduanya harus dijalankan setelah `npx prisma migrate deploy`.

---

## 3. Verifikasi pasca-deploy

1. `curl https://api.<domain>/api/health` → 200 `{ "db": "up" }`.
2. Restart Node app dari cPanel → health tetap 200.
3. Login admin di `https://<domain>/admin`.
4. Upload satu gambar, restart app, pastikan URL upload masih bisa dibuka
   (file persisten di `UPLOAD_DIR`).
5. Buka deep link `https://<domain>/admin/projects`.
6. Kirim satu pesan kontak dan buka halaman publik sekali; cek baris baru di
   `ContactMessage` dan `PageView`.
7. Matikan Node app sementara → frontend menampilkan cache + banner retry,
   bukan data palsu.
8. Pastikan origin lain ditolak CORS dan HTTPS/HSTS aktif.

---

## 4. Rollback

- **Frontend:** simpan salinan `public_html` sebelum upload; kembalikan folder
  `assets/` + `index.html` versi sebelumnya.
- **API:** deploy folder rilis per versi (mis. `api_app_releases/<timestamp>`)
  dan arahkan Application root ke versi sebelumnya, lalu Restart.
- **Database:** migrasi Prisma tidak otomatis rollback. Buat dump MySQL sebelum
  `prisma migrate deploy`:
  `mysqldump -u <db_user> -p <db_name> > backup-$(date +%F).sql`.
- **Upload:** folder `~/portfolio-uploads` tidak tersentuh rollback kode; tetap
  backup berkala.

---

## 5. Jebakan umum

- **Jangan upload `node_modules` Windows.** Prisma client dan engine Linux harus
  di-generate di server.
- **Jangan upload `.env`.** Env cPanel akan tertimpa.
- **Perubahan `VITE_*` butuh rebuild frontend**; env tidak dibaca saat runtime.
- **Passenger:** startup file harus `dist/index.js`; jangan pakai `npm start`.
- **Uploads:** taruh `UPLOAD_DIR` di luar app root agar tidak hilang saat
  redeploy.
- **CORS:** origin harus persis (`https://domain` vs `https://www.domain`).
- **MySQL cPanel:** user/database berprefix akun; URL-encode password.
- **OpenSSL:** `binaryTargets` harus cocok dengan server, jika tidak Prisma
  gagal start.
- **Rate limit di belakang proxy:** API membaca `req.ip`; pastikan Passenger
  meneruskan IP klien dengan benar. Jika semua request terlihat dari satu IP,
  aktifkan `trust proxy` di `server.ts` sesuai kebutuhan hosting.
