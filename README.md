Admin dashboard kepegawaian (Next.js App Router + Prisma + MariaDB), migrasi dari prototipe Nuxt

## Prasyarat

- Node.js 20+
- MariaDB/MySQL yang sudah jalan (lokal atau remote)

## 1. Install dependency

```bash
npm install
```

## 2. Environment variables

Buat file `.env` di root `next-app/` (belum ter-commit, isi sendiri):

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/next_app"

# SMTP buat kirim OTP login. Pakai Mailtrap Sandbox saat development
# supaya email tidak benar-benar terkirim, cukup dicek di inbox Mailtrap.
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=isi_dari_dashboard_mailtrap
SMTP_PASS=isi_dari_dashboard_mailtrap
MAIL_FROM="JMC Admin <no-reply@next-app.test>"

# Secret buat JWT khusus modul Data Pegawai (terpisah dari session cookie login)
EMPLOYEE_JWT_SECRET=ganti-dengan-string-acak-yang-panjang
```

Pastikan database dengan nama sesuai `DATABASE_URL` (`next_app` di contoh di atas) sudah dibuat di MariaDB sebelum lanjut ke langkah berikutnya.

## 3. Migrasi database

```bash
npx prisma migrate dev
```

Perintah ini otomatis menjalankan `prisma generate` juga. Kalau client Prisma sempat kosong/`stale` setelah pull perubahan schema, jalankan ulang manual:

```bash
npx prisma generate
```

## 4. Seed data awal

```bash
npm run seed
```

Seeder ini idempoten (aman dijalankan berkali-kali), isinya:

- **Roles**: Superadmin, Manager HRD, Admin HRD
- **Modules** + **RolePermission**
- **Department** dan **Position** (masterdata)
- **5 User** login: `testadmin`, `ahmad`, `riko`, `dhea`, `shani` — password semua `Password123!`
- **5 Employee uji coba** (NIP `90000001`-`90000005`) + `AttendanceSummary` bulan berjalan
- **TransportAllowanceSetting** default (kalau belum ada setting aktif sama sekali)
- **Wilayah** beberapa data wilayah sesuai prototype.

## 5. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Login pakai salah satu user hasil seed di atas — setelah submit username/password, sistem kirim kode OTP lewat email (Mailtrap Sandbox), cek inbox Mailtrap buat ambil kodenya.

## Script yang tersedia

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run seed` | Jalankan `prisma/seed.ts` |