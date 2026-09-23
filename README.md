# Kasir UMKM — Panduan Setup & Deploy

anon 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibG9zeGRnbG1tZWVuYm9mcGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjkyOTIsImV4cCI6MjEwNTc0NTI5Mn0.OBiVO0w6M2UBRHYwBy2Fr10F-yWZ_eGTXh4IZlAG6Do


url :
ublosxdglmmeenbofpdx


Aplikasi kasir sederhana untuk 1 toko: kasir, cetak struk, kelola menu, dan laporan.
Stack: HTML + Alpine.js + Tailwind (CDN, tanpa build step) + Supabase.

## 1. Setup Supabase (5 menit)

1. Buat akun & project baru di https://supabase.com
2. Masuk ke **SQL Editor** di dashboard project kamu → New Query.
3. Copy-paste seluruh isi file `sql/schema.sql` lalu klik **Run**.
   Ini akan membuat semua tabel, RLS policy, dan 1 baris pengaturan toko default.
4. Buka **Authentication → Users → Add User**, buat akun pertamamu (email + password) — ini akan jadi akun **Admin**.
5. Buka lagi **SQL Editor**, jalankan query berikut (ganti `PASTE-USER-ID-DISINI` dengan User ID yang baru dibuat, bisa dilihat di halaman Users):
   ```sql
   insert into users_profile (id, role) values ('8cbf8b44-62a8-4f86-b2c0-93aefdef99eb', 'admin');
   ```
6. Untuk menambah akun kasir nanti: buat user baru di Authentication → Users, lalu jalankan query yang sama tapi dengan `role` = `'kasir'`.
7. Ambil **Project URL** dan **anon public key**: Project Settings → API.

## 2. Isi Konfigurasi

Buka file `js/config.js`, ganti 2 baris ini dengan data dari langkah 7 di atas:

```js
const SUPABASE_URL = "https://GANTI-DENGAN-URL-PROJECTMU.supabase.co";
const SUPABASE_ANON_KEY = "GANTI-DENGAN-ANON-KEY-MU";
```

## 3. Upload ke GitHub

```bash
cd pos-umkm
git init
git add .
git commit -m "Kasir UMKM - initial commit"
git branch -M main
git remote add origin https://github.com/yakinsukses/kasir-umkm.git
git push -u origin main
```

## 4. Deploy ke Vercel

1. Buka https://vercel.com → **Add New Project** → pilih repo GitHub kamu tadi.
2. Framework preset: pilih **Other** (karena tidak ada build step).
3. Build Command: kosongkan. Output Directory: kosongkan (root).
4. Klik **Deploy**. Selesai dalam ~30 detik.
5. Buka domain Vercel yang muncul → halaman login akan tampil.

## 5. Mulai Pakai

1. Login dengan akun Admin yang dibuat di langkah 1.4.
2. Masuk ke halaman **Admin → Kelola Menu** → tambahkan produk/menu jualanmu.
3. Masuk ke **Pengaturan Toko & Struk** → isi nama toko, alamat, dan teks struk.
4. Buka halaman **Kasir** (link di pojok kanan atas) untuk mulai transaksi.
5. Setiap transaksi akan otomatis membuka tab struk yang siap di-print.
6. Cek **Laporan Penjualan** kapan saja untuk lihat omzet dan download Excel/PDF.

## Struktur File

```
pos-umkm/
├── index.html       (halaman login)
├── kasir.html        (halaman kasir/POS)
├── admin.html        (halaman admin: menu, pengaturan, laporan)
├── struk.html         (halaman cetak struk)
├── js/
│   ├── config.js      (isi URL & key Supabase kamu di sini)
│   └── auth.js         (helper login guard & logout)
└── sql/
    └── schema.sql        (jalankan sekali di Supabase SQL Editor)
```

## Catatan

- QRIS di halaman kasir hanya placeholder metode bayar (tanpa integrasi payment gateway) — untuk versi awal, kamu tunjukkan QRIS statis toko secara manual ke pelanggan.
- Kolom `stock` pada produk boleh dikosongkan kalau tidak mau melacak stok — sistem tidak akan memotong stok untuk produk tanpa nilai stok.
- Kalau nanti mau tambah fitur (multi-cabang, payment gateway, dll), tinggal kembangkan dari fondasi ini.
