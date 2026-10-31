# Deploy Produksi — DomaiNesia cPanel + Apache Reverse Proxy

Dokumen ini adalah runbook produksi untuk `https://raypurba.my.id` dan panduan
redeploy dari GitHub. Nilai rahasia (password DB, JWT, kredensial admin) tidak
boleh ditulis di repo; semuanya berada di `.env` server dengan izin `600`.

## 1. Arsitektur aktual

| Komponen | Lokasi / cara jalan |
| :--- | :--- |
| Frontend React/Vite/Three.js | Isi `dist/` di document root `~/raypurba.my.id` |
| API Express + TypeScript | `node dist/index.js` dari `~/ray3d-app/api`, listen `127.0.0.1:5055` |
| Reverse proxy | `.htaccess` Apache: `/api/*` dan `/uploads/*` → `127.0.0.1:5055` |
| Database | MySQL/MariaDB cPanel, Prisma 5, prefix database akun |
| Upload file | `~/ray3d-uploads` (persisten, di luar app dan docroot) |
| Log API | `~/ray3d-logs/api.log` |
| Proses persisten | `setsid nohup` + cron `@reboot` + watchdog tiap 5 menit |
| Backup Laravel lama | `~/backups/ray3d-deploy-<timestamp>/` |

**Keterbatasan hosting:** fitur Passenger (`passengerapps`) dinonaktifkan,
modul Node.js Selector tidak tersedia, dan binary Passenger bawaan rusak. Karena
itu API **tidak** dijalankan sebagai cPanel Node.js App. Alternatif yang dipakai
adalah proses Node latar belakang + reverse proxy Apache + cron watchdog.

Konsekuensi:

- Restart aplikasi dilakukan lewat script ops (bukan tombol cPanel).
- Proses diawasi cron tiap 5 menit; jika mati, script start akan menyalakannya.
- Port `5055` **hanya** mendengarkan `127.0.0.1`; akses publik hanya lewat HTTPS
  `https://raypurba.my.id/api`.
- `mod_proxy` Apache wajib aktif (sudah terverifikasi di server ini).

## 2. Struktur path server

```text
$HOME/
├── ray3d-app/                 # clone GitHub (branch main)
│   ├── api/                   # source + dist API
│   ├── dist/                  # hasil build frontend
│   ├── .env.production        # VITE_API_URL / VITE_SITE_URL (build-time)
│   └── api/.env               # runtime API (600, tidak masuk Git)
├── raypurba.my.id/            # document root (isi dist/ + .htaccess)
├── ray3d-uploads/             # file upload CMS
├── ray3d-logs/                # api.log, api.pid, log build
├── ray3d-ops/                 # start/stop/status + verify-prod.js
└── backups/
    ├── ray3d-deploy-<timestamp>/
    │   ├── laravel-source.tar.gz
    │   ├── docroot-raypurba.tar.gz
    │   ├── db-laravel.sql.gz
    │   ├── docroot-files-<timestamp>/   # file docroot lama + symlink
    │   └── SHA256SUMS
    └── temp-domain-htaccess/  # backup .htaccess domain staging
```

## 3. Environment produksi

File `~/ray3d-app/api/.env` (izin `600`) berisi:

| Variable | Keterangan |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `HOST` | `127.0.0.1` (hanya loopback) |
| `PORT` | `5055` |
| `CLIENT_URL` | `https://raypurba.my.id,https://www.raypurba.my.id` |
| `DATABASE_URL` | `mysql://<db_user>:<pass>@127.0.0.1:3306/<db_name>` |
| `JWT_SECRET` | 48+ karakter acak |
| `JWT_REFRESH_SECRET` | 48+ karakter acak, berbeda |
| `JWT_EXPIRE` / `JWT_REFRESH_EXPIRE` | `15m` / `30d` |
| `MAX_FILE_SIZE` | `5242880` |
| `UPLOAD_DIR` | `/home/<user>/ray3d-uploads` (absolut, di luar app) |
| `CLOUDINARY_*` | opsional; harus lengkap atau kosong |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | dipakai untuk seed admin |

File `~/ray3d-app/.env.production` berisi nilai build-time:

```dotenv
VITE_API_URL=https://raypurba.my.id/api
VITE_SITE_URL=https://raypurba.my.id
```

Nilainya ter-embed saat `vite build`; mengubahnya membutuhkan rebuild frontend.

Kredensial admin yang dibuat saat deployment disimpan di
`~/ray-3d-admin-credentials.txt` (izin `600`). Jangan pindahkan ke repo.

## 4. Deploy pertama (ringkasan yang sudah dilakukan)

1. Audit hosting: cek Passenger/Node/MySQL/Apache.
2. Backup source Laravel, docroot, dan dump database; verifikasi checksum.
3. Clone repo GitHub, buat database + user MySQL khusus.
4. Isi `.env`, jalankan `prisma validate`, `prisma generate`,
   `prisma migrate deploy` (7 migrasi), lalu seed admin.
5. Build frontend dengan env produksi, build API.
6. Jalankan API di `127.0.0.1:5055`, pasang cron watchdog.
7. Uji semuanya di domain staging, lalu ganti isi docroot (file lama dipindah,
   tidak dihapus) dan pasang `.htaccess` final.

## 5. Redeploy dari GitHub (branch `main`)

Jalankan di server dengan Node alt build CloudLinux:

```bash
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$PATH"
cd "$HOME/ray3d-app"

# 1. Ambil source terbaru (repo publik, tanpa kredensial)
git pull --ff-only origin main

# 2. Dependency (ulangi bila package-lock berubah)
npm ci
npm ci --prefix api

# 3. Migrasi database — JANGAN pakai migrate reset / db push
cd api
npx prisma validate
npx prisma generate
npx prisma migrate deploy
cd ..

# 4. Build frontend (memakai .env.production) dan API
npm run build
npm run build --prefix api

# 5. Salin build frontend ke docroot (.htaccess ikut dari public/.htaccess)
cp -a dist/. "$HOME/raypurba.my.id/"
find "$HOME/raypurba.my.id" -type d -exec chmod 755 {} +
find "$HOME/raypurba.my.id" -type f -exec chmod 644 {} +

# 6. Restart API
"$HOME/ray3d-ops/stop-backend.sh" || true
"$HOME/ray3d-ops/start-backend.sh"
"$HOME/ray3d-ops/status-backend.sh"
```

Catatan:

- `api/.env` dan `.env.production` **tidak** ada di Git; jangan tertimpa.
- `npm ci` di root menginstal devDependencies (Vite, TypeScript) yang dibutuhkan
  untuk build.
- Migrasi produksi selalu `prisma migrate deploy`. Dilarang `migrate reset`,
  `db push`, atau `DROP DATABASE`.
- Setelah deploy, jalankan verifikasi di bagian 7.

## 6. Operasional API

Script tersedia di `~/ray3d-ops/`:

| Script | Fungsi |
| :--- | :--- |
| `start-backend.sh` | Start jika belum berjalan (`setsid nohup`, cek `pgrep`) |
| `stop-backend.sh` | Hentikan proses berdasarkan `api.pid` |
| `status-backend.sh` | Tampilkan PID + health lokal |
| `verify-prod.js` | Verifikasi end-to-end lewat domain publik |

Cron yang terpasang:

```cron
@reboot /home/<user>/ray3d-ops/start-backend.sh >/dev/null 2>&1
*/5 * * * * /home/<user>/ray3d-ops/start-backend.sh >/dev/null 2>&1
```

Wajib ada `HOST=127.0.0.1` di `api/.env` dan di kode `app.listen(port, host)`.
Verifikasi binding:

```bash
awk '$2 ~ /:13BF$/ {print $2, $4}' /proc/net/tcp   # 0100007F:13BF 0A = 127.0.0.1:5055 LISTEN
```

Jika baris kosong padahal health lokal hidup, proses mungkin listen di interface
lain — segera restart dengan build terbaru.

Log: `~/ray3d-logs/api.log`. Rotasi manual bila perlu:

```bash
mv "$HOME/ray3d-logs/api.log" "$HOME/ray3d-logs/api.log.$(date +%F)"
"$HOME/ray3d-ops/stop-backend.sh"; "$HOME/ray3d-ops/start-backend.sh"
```

## 7. Verifikasi pasca-deploy

Cek cepat:

```bash
curl -sSI https://raypurba.my.id/ | head -20
curl -sS  https://raypurba.my.id/api/health
curl -sS -o /dev/null -w "%{http_code}\n" https://raypurba.my.id/admin/login
curl -sS -o /dev/null -w "%{http_code}\n" https://raypurba.my.id/assets/tidak-ada.js
```

Cek end-to-end (login, refresh, CRUD, upload, logout) tanpa menampilkan token:

```bash
/opt/alt/alt-nodejs22/root/usr/bin/node "$HOME/ray3d-ops/verify-prod.js"
```

Semua baris harus `PASS`.

## 8. Backup dan rollback Laravel lama

Backup yang sudah diverifikasi (SHA256 cocok):

```bash
cd "$HOME/backups/ray3d-deploy-<timestamp>"
sha256sum -c SHA256SUMS
```

Isi:

- `laravel-source.tar.gz` — source Laravel lengkap.
- `docroot-raypurba.tar.gz` — docroot lama (mayoritas symlink).
- `docroot-files-<timestamp>/` — file + symlink docroot lama yang dipindahkan
  saat pergantian (`.htaccess`, `index.php`, `.user.ini`, `php.ini`, symlink).
- `db-laravel.sql.gz` — dump database Laravel (30 tabel).

Rollback frontend lama (tanpa menyentuh database baru):

```bash
D="$HOME/raypurba.my.id"
BK="$HOME/backups/ray3d-deploy-<timestamp>/docroot-files-<timestamp>"
# pindahkan build baru ke samping, bukan hapus
mv "$D" "$HOME/raypurba.my.id.react"
mkdir -p "$D"
cp -a "$BK"/. "$D"/
# symlink build/images/models/storage sudah menunjuk source Laravel yang utuh
```

Database Laravel tidak diubah dan tidak dihapus. Jika perlu restore dump:

```bash
gunzip -c "$HOME/backups/ray3d-deploy-<timestamp>/db-laravel.sql.gz" | mysql -u <user> -p <db_lama>
```

Lakukan hanya jika benar-benar diperlukan; database CMS baru terpisah dan tidak
terpengaruh.

## 9. Troubleshooting

| Gejala | Cek |
| :--- | :--- |
| 503 di `/api/*` | `status-backend.sh`, `api.log`, cron watchdog, binding 5055 |
| 500 setelah ubah `.htaccess` | Sintaks Apache; bandingkan dengan `public/.htaccess` |
| Upload gagal | Izin `~/ray3d-uploads`, `MAX_FILE_SIZE`, signature file, rate limit |
| Login 401 | `ADMIN_EMAIL`/`ADMIN_PASSWORD` di `api/.env`; sinkronkan hash admin |
| Gambar upload tidak tampil | Pastikan CMS memakai `path` (`/uploads/...`), bukan `url` |
| Deep link 404 | `mod_rewrite` + fallback `index.html` di `.htaccess` |
| CORS ditolak | `CLIENT_URL` harus memuat origin persis (tanpa slash) |
| Prisma error koneksi | `DATABASE_URL`, user DB, izin `ALL PRIVILEGES` |

### Limitasi: `url` absolut pada respons upload

Karena Apache `mod_proxy` mengganti header `Host` menjadi `127.0.0.1:5055`,
respons upload dari API memuat `url` absolut `http(s)://127.0.0.1:5055/uploads/...`.
Aplikasi CMS menyimpan dan menampilkan `path` (`/uploads/<file>`), sehingga
gambar tetap tampil normal lewat domain publik. Jangan memakai field `url` di
klien pihak ketiga; gunakan `path`.

### Limitasi: header cache untuk HTML

Hosting ini menghapus `Cache-Control`/`Expires` yang diset dari `.htaccess`
untuk respons HTML dan teks. Aset ber-hash di `/assets` tetap memakai cache
`immutable`; `index.html` mengandalkan validasi ulang bawaan browser. Kontrol
cache penuh harus dilakukan di level hosting, bukan `.htaccess`.

## 10. Keamanan

- Dokumen root hanya berisi hasil build + `.htaccess`; tidak ada source, `.env`,
  atau `node_modules`.
- API listen di loopback; port `5055` tidak dapat diakses dari internet.
- HTTPS + HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, dan `Permissions-Policy` aktif.
- `.env` dan file kredensial berizin `600`.
- Repo publik tidak memuat rahasia; `.env` di-ignore oleh Git.
- Jangan menonaktifkan firewall/Apache security untuk kerja normal.
