#!/usr/bin/env node
'use strict';

/**
 * End-to-end verification for the production deployment.
 *
 * Usage (from the server):
 *   node "$HOME/ray3d-ops/verify-prod.js"
 *
 * Optional environment variables:
 *   VERIFY_BASE_URL      default https://raypurba.my.id
 *   VERIFY_EMAIL         override ADMIN_EMAIL
 *   VERIFY_PASSWORD      override ADMIN_PASSWORD
 *   VERIFY_ENV_FILE      path to the API .env file
 *   VERIFY_DIRECT_API    e.g. http://127.0.0.1:5055/api to test headers the
 *                        hosting proxy strips (Cache-Control)
 *   VERIFY_SKIP_FRONTEND set to 1 to skip docroot checks (local API only)
 *   VERIFY_ALLOW_INSECURE set to 1 to allow cookies without Secure (local HTTP)
 *
 * Credentials fall back to ADMIN_EMAIL / ADMIN_PASSWORD in the API .env.
 * Tokens and cookie values are never printed.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE_URL = (process.env.VERIFY_BASE_URL || 'https://raypurba.my.id').replace(/\/+$/, '');
const API_URL = `${BASE_URL}/api`;
const TIMEOUT_MS = 20_000;
const SKIP_FRONTEND = process.env.VERIFY_SKIP_FRONTEND === '1';
const ALLOW_INSECURE = process.env.VERIFY_ALLOW_INSECURE === '1';
const DIRECT_API_URL = (process.env.VERIFY_DIRECT_API || '').replace(/\/+$/, '');

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

let failures = 0;
let passes = 0;

const pass = (label, detail) => {
  passes += 1;
  console.log(`PASS  ${label}${detail ? ` — ${detail}` : ''}`);
};

const fail = (label, message) => {
  failures += 1;
  console.error(`FAIL  ${label}${message ? ` — ${message}` : ''}`);
};

const skip = (label, reason) => {
  console.log(`SKIP  ${label}${reason ? ` — ${reason}` : ''}`);
};

const check = (label, condition, message, detail) => {
  if (condition) {
    pass(label, detail);
    return true;
  }
  fail(label, message);
  return false;
};

const readEnvValue = (file, key) => {
  try {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match || match[1] !== key) continue;

      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  } catch {
    // Missing or unreadable env file: fall through to other sources.
  }
  return undefined;
};

const envFiles = [
  process.env.VERIFY_ENV_FILE,
  path.join(os.homedir(), 'ray3d-app', 'api', '.env'),
  path.resolve(__dirname, '..', '.env'),
].filter(Boolean);

const envValue = (key) =>
  process.env[key] || envFiles.map((file) => readEnvValue(file, key)).find(Boolean);

const jar = new Map();

const cookieHeader = () =>
  Array.from(jar, ([name, value]) => `${name}=${value}`).join('; ');

const ingestCookies = (headers) => {
  const list =
    typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];

  for (const raw of list) {
    const pair = raw.split(';')[0];
    const separator = pair.indexOf('=');
    if (separator === -1) continue;

    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    const cleared = value === '' || /max-age\s*=\s*0/i.test(raw);

    if (cleared) jar.delete(name);
    else jar.set(name, value);
  }

  return list;
};

const findSetCookie = (list, name) =>
  list.find((raw) => raw.startsWith(`${name}=`));

const describe = (result) => {
  const message = result.json && (result.json.message || result.json.error);
  return message ? `HTTP ${result.status}: ${message}` : `HTTP ${result.status}`;
};

const request = async (method, apiPath, options = {}) => {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  let body;

  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  } else if (options.body !== undefined) {
    body = options.body;
  }

  if (options.cookie !== false && jar.size > 0) {
    headers.Cookie = cookieHeader();
  }

  const response = await fetch(`${API_URL}${apiPath}`, {
    method,
    headers,
    body,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const setCookies = ingestCookies(response.headers);
  const text = await response.text();

  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  return {
    status: response.status,
    headers: response.headers,
    text,
    json,
    setCookies,
  };
};

const page = (urlPath) =>
  fetch(`${BASE_URL}${urlPath}`, {
    headers: { Accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

const isHtml = (response) =>
  /text\/html/i.test(response.headers.get('content-type') || '');

const main = async () => {
  if (Number(process.versions.node.split('.')[0]) < 20) {
    console.error('Node.js 20 atau lebih baru dibutuhkan.');
    process.exit(2);
  }

  const email = process.env.VERIFY_EMAIL || envValue('ADMIN_EMAIL');
  const password = process.env.VERIFY_PASSWORD || envValue('ADMIN_PASSWORD');

  console.log(`Verifikasi ${BASE_URL}`);
  console.log('');

  const health = await request('GET', '/health', { cookie: false });
  check(
    'health API + database',
    health.status === 200 && health.json?.data?.db === 'up',
    describe(health)
  );
  check(
    'header keamanan API',
    /nosniff/i.test(health.headers.get('x-content-type-options') || '') &&
      health.headers.get('x-powered-by') === null,
    'X-Content-Type-Options atau X-Powered-By tidak sesuai'
  );

  const projects = await request('GET', '/projects', { cookie: false });
  check(
    'konten publik',
    projects.status === 200 && Array.isArray(projects.json?.data),
    describe(projects)
  );

  const cache = projects.headers.get('cache-control') || '';
  if (cache) {
    check(
      'cache konten publik',
      /public/.test(cache) && /max-age=30/.test(cache),
      `Cache-Control: ${cache}`
    );
  } else {
    skip('cache konten publik', 'Cache-Control dihapus oleh proxy hosting');
  }

  if (DIRECT_API_URL) {
    try {
      const direct = await fetch(`${DIRECT_API_URL}/projects`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const directCache = direct.headers.get('cache-control') || '';
      check(
        'cache konten publik (API langsung)',
        /public/.test(directCache) && /max-age=30/.test(directCache),
        `Cache-Control: ${directCache || '(kosong)'}`
      );
      check(
        'header keamanan API (langsung)',
        /nosniff/i.test(direct.headers.get('x-content-type-options') || '') &&
          direct.headers.get('x-powered-by') === null,
        'header tidak sesuai'
      );

      const directAuth = await fetch(`${DIRECT_API_URL}/auth/me`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      check(
        'cache auth no-store (API langsung)',
        /no-store/.test(directAuth.headers.get('cache-control') || ''),
        `Cache-Control: ${directAuth.headers.get('cache-control') || '(kosong)'}`
      );
    } catch (error) {
      fail(
        'API langsung',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  if (SKIP_FRONTEND) {
    skip('docroot frontend', 'VERIFY_SKIP_FRONTEND=1');
  } else {
    const root = await page('/');
    const rootHtml = await root.text();
    check(
      'docroot frontend',
      root.status === 200 && isHtml(root) && rootHtml.includes('id="root"'),
      `HTTP ${root.status}`
    );

    const securityHeaders = {
      'strict-transport-security': root.headers.get('strict-transport-security'),
      'content-security-policy': root.headers.get('content-security-policy'),
      'x-content-type-options': root.headers.get('x-content-type-options'),
      'x-frame-options': root.headers.get('x-frame-options'),
      'referrer-policy': root.headers.get('referrer-policy'),
    };
    const missing = Object.entries(securityHeaders)
      .filter(([, value]) => !value)
      .map(([name]) => name);
    check(
      'header keamanan .htaccess',
      missing.length === 0,
      `hilang: ${missing.join(', ')}`
    );

    const adminPage = await page('/admin/login');
    check(
      'deep link /admin/login',
      adminPage.status === 200 && isHtml(adminPage),
      `HTTP ${adminPage.status}`
    );

    const missingAsset = await page('/assets/tidak-ada.js');
    check(
      'aset tidak ditemukan -> 404',
      missingAsset.status === 404,
      `HTTP ${missingAsset.status}`
    );
  }

  if (!email || !password) {
    fail(
      'kredensial admin',
      'isi ADMIN_EMAIL/ADMIN_PASSWORD di api/.env atau VERIFY_EMAIL/VERIFY_PASSWORD'
    );
    return;
  }

  const login = await request('POST', '/auth/login', {
    json: { email, password },
    cookie: false,
  });
  const loggedIn =
    login.status === 200 && login.json?.data?.user?.email === email;
  check('login admin', loggedIn, describe(login));

  if (!loggedIn) {
    return;
  }

  check(
    'token tidak bocor di body login',
    !/"(accessToken|refreshToken)"/.test(login.text),
    'respons login memuat token'
  );
  const loginCache = login.headers.get('cache-control') || '';
  if (loginCache) {
    check(
      'cache login no-store',
      /no-store/.test(loginCache),
      `Cache-Control: ${loginCache}`
    );
  } else {
    skip('cache login no-store', 'Cache-Control dihapus oleh proxy hosting');
  }

  const accessCookie = findSetCookie(login.setCookies, 'rp_access');
  const refreshCookie = findSetCookie(login.setCookies, 'rp_refresh');
  check('cookie sesi terpasang', Boolean(accessCookie && refreshCookie));

  if (accessCookie) {
    check(
      'cookie access HttpOnly + path /api',
      /HttpOnly/i.test(accessCookie) &&
        /Path=\/api(?:;|$)/i.test(accessCookie) &&
        /SameSite=Lax/i.test(accessCookie),
      accessCookie.replace(/=[^;]+/, '=<redacted>')
    );
    if (!ALLOW_INSECURE) {
      check(
        'cookie access Secure',
        /;\s*Secure/i.test(accessCookie),
        'cookie tidak memakai Secure'
      );
    }
  }

  if (refreshCookie) {
    check(
      'cookie refresh HttpOnly + path /api/auth',
      /HttpOnly/i.test(refreshCookie) &&
        /Path=\/api\/auth(?:;|$)/i.test(refreshCookie) &&
        /SameSite=Lax/i.test(refreshCookie),
      refreshCookie.replace(/=[^;]+/, '=<redacted>')
    );
  }

  const me = await request('GET', '/auth/me');
  check(
    'sesi /auth/me',
    me.status === 200 && me.json?.data?.email === email,
    describe(me)
  );

  const refreshBefore = jar.get('rp_refresh');
  const refreshed = await request('POST', '/auth/refresh', { json: {} });
  check(
    'refresh token',
    refreshed.status === 200 && refreshed.json?.data?.user?.email === email,
    describe(refreshed)
  );
  check(
    'rotasi refresh token',
    Boolean(jar.get('rp_refresh')) && jar.get('rp_refresh') !== refreshBefore,
    'cookie refresh tidak berubah'
  );
  check(
    'token tidak bocor di body refresh',
    !/"(accessToken|refreshToken)"/.test(refreshed.text),
    'respons refresh memuat token'
  );

  const meAgain = await request('GET', '/auth/me');
  check(
    'sesi setelah refresh',
    meAgain.status === 200 && meAgain.json?.data?.email === email,
    describe(meAgain)
  );

  const latestRefresh = jar.get('rp_refresh');
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  let projectId;
  let uploadedFilename;
  let projectDeleted = false;
  let uploadDeleted = false;

  try {
    const created = await request('POST', '/projects', {
      json: {
        title: `Verifikasi deploy ${stamp}`,
        description:
          'Catatan verifikasi otomatis jalur tulis API. Aman untuk dihapus.',
        image: '/uploads/verify-prod-placeholder.png',
        technologies: [],
        tags: [],
      },
    });
    projectId = created.json?.data?.id;
    check(
      'buat proyek',
      created.status === 201 && Boolean(projectId),
      describe(created)
    );

    if (projectId) {
      const updated = await request('PUT', `/projects/${projectId}`, {
        json: {
          description:
            'Deskripsi diperbarui oleh verifikasi deploy otomatis.',
        },
      });
      check('ubah proyek', updated.status === 200, describe(updated));

      const form = new FormData();
      form.append(
        'image',
        new Blob([PNG_1X1], { type: 'image/png' }),
        'verify-prod.png'
      );
      const uploaded = await request(
        'POST',
        `/projects/${projectId}/upload`,
        { body: form }
      );
      const stored = uploaded.json?.data?.upload;
      uploadedFilename = stored?.filename;
      check(
        'upload gambar',
        uploaded.status === 200 && typeof uploadedFilename === 'string',
        describe(uploaded)
      );

      if (stored?.storage === 'local' && stored?.path) {
        const asset = await page(stored.path);
        check(
          'akses gambar upload',
          asset.status === 200 &&
            /image\/png/i.test(asset.headers.get('content-type') || ''),
          `HTTP ${asset.status}`
        );

        const removed = await request(
          'DELETE',
          `/upload/${encodeURIComponent(uploadedFilename)}`
        );
        uploadDeleted = removed.status === 200;
        check('hapus file upload', uploadDeleted, describe(removed));
      } else {
        skip('akses gambar upload', 'storage bukan local disk');
      }

      const deleted = await request('DELETE', `/projects/${projectId}`);
      projectDeleted = deleted.status === 200;
      check('hapus proyek', projectDeleted, describe(deleted));

      const gone = await request('GET', `/projects/${projectId}`);
      check('proyek terhapus -> 404', gone.status === 404, describe(gone));
    }
  } catch (error) {
    fail('alur tulis API', error instanceof Error ? error.message : String(error));
  } finally {
    if (uploadedFilename && !uploadDeleted) {
      try {
        await request('DELETE', `/upload/${encodeURIComponent(uploadedFilename)}`);
      } catch {
        console.warn('WARN  file uji upload gagal dibersihkan');
      }
    }
    if (projectId && !projectDeleted) {
      try {
        await request('DELETE', `/projects/${projectId}`);
      } catch {
        console.warn('WARN  proyek uji gagal dibersihkan');
      }
    }
  }

  const logout = await request('POST', '/auth/logout', { json: {} });
  check('logout', logout.status === 200, describe(logout));
  check(
    'cookie sesi dibersihkan',
    !jar.has('rp_access') && !jar.has('rp_refresh'),
    'cookie masih tersisa di jar'
  );

  if (latestRefresh) {
    const replay = await request('POST', '/auth/refresh', {
      json: {},
      cookie: false,
      headers: { Cookie: `rp_refresh=${latestRefresh}` },
    });
    check(
      'refresh dicabut setelah logout',
      replay.status === 401,
      describe(replay)
    );
  }
};

main()
  .catch((error) => {
    fail('verifikasi', error instanceof Error ? error.message : String(error));
  })
  .finally(() => {
    console.log('');
    if (failures > 0) {
      console.error(`${failures} pemeriksaan GAGAL, ${passes} PASS.`);
      process.exitCode = 1;
    } else {
      console.log(`Semua ${passes} pemeriksaan PASS.`);
    }
  });
