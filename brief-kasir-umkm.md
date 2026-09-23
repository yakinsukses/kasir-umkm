# Brief Rekonstruksi Aplikasi Kasir UMKM

## Tujuan

Bangun ulang aplikasi kasir sederhana untuk satu toko UMKM dari nol sampai siap deploy di Vercel, dengan database Supabase, autentikasi email/password, role admin dan kasir, transaksi penjualan, cetak struk, laporan, upload foto, serta dukungan offline dasar.

Aplikasi harus terasa sederhana, cepat, nyaman dipakai di desktop dan mobile, serta menggunakan Bahasa Indonesia.

## Stack yang diminta

- Next.js App Router terbaru atau implementasi web modern yang kompatibel dengan Vercel.
- TypeScript.
- Tailwind CSS dan komponen UI yang accessible.
- Supabase:
  - Supabase Auth email/password.
  - PostgreSQL Database.
  - Supabase Storage untuk foto produk dan logo toko.
  - Row Level Security.
- Vercel untuk deployment.
- Jangan menaruh URL, anon key, service role key, password, atau credential asli di source code. Gunakan environment variables.

Environment variables yang dibutuhkan:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan di server-side code dan tidak boleh dikirim ke browser.

## Pengguna dan role

Gunakan Supabase Auth sebagai sumber autentikasi.

Role:

- `admin`: dapat mengelola produk, kategori, pengaturan toko, logo, dan melihat laporan.
- `kasir`: dapat membuka halaman kasir, memilih produk, membuat transaksi, dan mencetak struk.

Setelah login, baca role dari tabel `users_profile`. Redirect:

- admin ke `/admin`
- kasir ke `/kasir`

Jika user login tetapi belum memiliki profile/role, tampilkan pesan bahwa akun belum dikonfigurasi dan jangan berikan akses aplikasi.

Gunakan server-side route protection/middleware. Jangan hanya menyembunyikan tombol di frontend.

## Halaman aplikasi

### 1. Login `/`

Tampilan login bersih dan sederhana:

- Branding `Kasir UMKM`.
- Input email.
- Input password.
- Tombol `Masuk`.
- Pesan error Bahasa Indonesia yang jelas tetapi tidak membocorkan detail sensitif.
- Jika session masih aktif, redirect otomatis ke halaman sesuai role.

### 2. Halaman kasir `/kasir`

Header:

- Judul `Kasir`.
- Email/nama user yang sedang login.
- Tombol `Keluar`.

Area produk:

- Input pencarian berdasarkan nama produk.
- Filter kategori berbentuk chip/tab: `Semua` dan semua kategori aktif.
- Grid kartu produk responsif.
- Kartu berisi foto produk, nama, dan harga Rupiah.
- Jika tidak ada foto, tampilkan fallback yang rapi.
- Produk nonaktif tidak ditampilkan.
- Jika stok dilacak, jangan izinkan pembelian melebihi stok.

Keranjang:

- Nama produk.
- Harga satuan.
- Jumlah.
- Tombol kurang/tambah.
- Total per item dan total transaksi.
- Tombol `Bayar` disabled jika keranjang kosong.

Dialog pembayaran:

- Total transaksi.
- Pilihan metode `Tunai` dan `QRIS`.
- Untuk tunai:
  - Input `Uang Diterima`.
  - Input menerima angka Rupiah dengan pemisah ribuan tampilan, tetapi disimpan sebagai angka murni.
  - Tombol nominal cepat: 5.000, 10.000, 15.000, 20.000, 50.000, 100.000.
  - Hitung kembalian secara real time.
  - Tombol konfirmasi disabled jika uang kurang.
- Untuk QRIS:
  - Tampilkan instruksi bahwa kasir menunjukkan QRIS toko secara manual.
  - Tidak perlu payment gateway pada versi ini.

Saat konfirmasi:

1. Validasi total, qty, harga, dan stok di server/database.
2. Buat transaksi.
3. Buat item transaksi.
4. Kurangi stok jika stok tidak null.
5. Kosongkan keranjang.
6. Buka halaman struk dengan transaction ID.
7. Hindari transaksi/item duplikat jika request diulang dengan idempotency key.

### 3. Halaman admin `/admin`

Sediakan tab/menu berikut.

#### Kelola Menu

Tabel produk dengan kolom:

- Nama.
- Kategori.
- Harga.
- Stok.
- Status aktif/nonaktif.
- Aksi edit/hapus.

Tombol `Tambah Produk` membuka modal/form:

- Nama produk wajib.
- Kategori dropdown.
- Tombol tambah kategori baru.
- Tombol hapus kategori dengan konfirmasi.
- Harga jual wajib, input visual Rupiah.
- Stok opsional.
- Upload foto produk.
- Preview foto setelah upload.
- Checkbox `Aktif (tampil di kasir)`.
- Tombol batal dan simpan.

Kategori harus benar-benar disimpan ke tabel `product_categories`, bukan hanya state frontend. Setelah kategori baru dibuat, kategori harus langsung muncul di dropdown tanpa reload manual. Kategori lama juga harus dimigrasikan dari nilai `products.category` yang sudah ada.

Upload foto:

- Validasi MIME image.
- Batas ukuran maksimal 5 MB.
- Simpan ke bucket `kasir-images` dengan path terstruktur, misalnya `products/{userId}/{uuid}-{filename}`.
- Simpan public URL atau signed URL yang sesuai ke `products.photo_url`.
- Tampilkan error asli yang aman dan actionable jika upload gagal.
- Jangan membuat nama file yang berbahaya atau memperbolehkan path traversal.

#### Pengaturan Toko & Struk

Form:

- Nama toko.
- Alamat.
- Nomor telepon.
- Upload logo toko.
- Header struk.
- Footer struk.
- Preview logo.
- Tombol simpan.

Hanya satu row `store_settings` yang digunakan untuk toko ini.

#### Laporan Penjualan

- Filter tanggal mulai dan tanggal akhir.
- Daftar transaksi.
- Tanggal/waktu.
- Kasir.
- Metode pembayaran.
- Total.
- Ringkasan total omzet.
- Jumlah transaksi.
- Export Excel.
- Export PDF.

Query laporan harus aman, memakai filter tanggal server-side, dan tidak mengambil data yang tidak diperlukan.

### 4. Halaman struk `/struk?id={transactionId}`

Tampilan seperti struk kasir dengan lebar sempit dan font mudah dibaca.

Isi:

- Logo toko.
- Nama toko.
- Alamat.
- Telepon.
- Header struk.
- Tanggal dan waktu.
- Daftar item, qty, harga, subtotal item.
- Total.
- Metode pembayaran.
- Uang diterima.
- Kembalian jika tunai.
- Footer struk.
- Tombol `Cetak Struk`, disembunyikan saat print.

Gunakan CSS print yang hanya mencetak area struk.

## Database Supabase

Gunakan migration yang repeatable/idempotent. Semua tabel publik yang diakses melalui API wajib mengaktifkan RLS.

### `products`

```sql
id uuid primary key default gen_random_uuid()
name text not null
category text
price numeric not null default 0
photo_url text
is_active boolean not null default true
stock numeric null
created_at timestamptz not null default now()
```

### `product_categories`

```sql
id uuid primary key default gen_random_uuid()
name text not null unique
created_at timestamptz not null default now()
```

### `transactions`

```sql
id uuid primary key default gen_random_uuid()
cashier_name text
subtotal numeric not null default 0
total numeric not null default 0
payment_method text not null default 'Tunai'
cash_received numeric not null default 0
change numeric not null default 0
idempotency_key text unique
created_at timestamptz not null default now()
```

### `transaction_items`

```sql
id uuid primary key default gen_random_uuid()
transaction_id uuid not null references transactions(id) on delete cascade
product_id uuid references products(id) on delete set null
qty numeric not null default 1
price_at_transaction numeric not null default 0
```

Tambahkan unique constraint yang mencegah item duplikat dalam transaksi jika desain transaksi mengharuskan satu row per produk.

### `store_settings`

```sql
id uuid primary key default gen_random_uuid()
store_name text default 'Toko Saya'
address text
phone text
logo_url text
receipt_header text default 'Terima kasih telah berbelanja'
receipt_footer text default 'Sampai jumpa lagi!'
```

### `users_profile`

```sql
id uuid primary key references auth.users(id) on delete cascade
role text not null default 'kasir' check (role in ('admin', 'kasir'))
created_at timestamptz not null default now()
```

## RLS dan keamanan

Implementasikan policy berbasis role dengan aman.

- Jangan gunakan `user_metadata` untuk authorization.
- Jangan gunakan `auth.role()` yang deprecated; gunakan `to authenticated` dan predicate yang sesuai.
- Admin boleh CRUD produk, kategori, pengaturan, dan laporan.
- Kasir boleh membaca produk/kategori/pengaturan dan membuat transaksi.
- Kasir tidak boleh mengubah role, menghapus produk, atau mengubah pengaturan toko.
- User tidak boleh mengubah role dirinya sendiri.
- Semua query yang menyentuh data user harus memiliki scope yang sesuai.
- Untuk aksi pembayaran/stok, gunakan server action atau route handler dan transaksi database atomik.
- Validasi ulang harga, qty, total, stok, payment method, dan idempotency key di server.
- Jangan percaya total dari browser.

Sediakan SQL seed untuk:

1. Satu row pengaturan toko default.
2. Migrasi kategori dari `products.category` ke `product_categories`.
3. Bucket Storage `kasir-images`.
4. Policy Storage untuk upload/update/delete oleh user yang berwenang dan read sesuai kebutuhan.

## Offline mode dan sinkronisasi

Aplikasi perlu tetap usable saat koneksi terputus untuk operasi kasir dasar.

Gunakan IndexedDB, bukan localStorage, untuk cache dan antrean.

Cache minimal:

- Produk aktif.
- Kategori.
- Pengaturan toko.
- Transaksi lokal.
- Item transaksi lokal.

Saat offline:

- Kasir tetap dapat melihat cache produk.
- Kasir dapat membuat transaksi lokal dengan UUID client.
- Tampilkan indikator `Offline`.
- Simpan mutation queue di IndexedDB.
- Jangan menampilkan seolah transaksi sudah tersinkron jika belum.

Saat online kembali:

- Jalankan sync queue.
- Gunakan idempotency key/upsert agar retry tidak membuat data ganda.
- Tandai queue item sebagai synced setelah semua tahap sukses.
- Jika gagal, pertahankan queue dan tampilkan status retry.
- Konflik stok harus ditangani aman dan tidak boleh membuat stok negatif.

Service worker boleh digunakan untuk asset caching, tetapi jangan cache response privat secara sembarangan.

## UX dan visual

Gaya visual:

- Modern, bersih, profesional, cocok untuk UMKM.
- Warna utama biru untuk aksi utama, hijau untuk pembayaran/sukses, merah untuk aksi destruktif.
- Latar abu-abu sangat muda dan card putih.
- Border radius medium, shadow ringan.
- Font sans-serif yang mudah dibaca.
- Layout mobile-first dan responsive.
- Modal harus accessible: focus trap, tombol close/batal, label input, keyboard support.
- Semua gambar memiliki alt text.
- Jangan memakai emoji sebagai ikon utama; gunakan icon library.
- Gunakan toast/alert yang konsisten dan pesan Bahasa Indonesia.

## Struktur kode yang diharapkan

Contoh struktur Next.js:

```text
app/
  page.tsx
  kasir/page.tsx
  admin/page.tsx
  struk/[id]/page.tsx
  auth/callback/route.ts
  api/transactions/route.ts
  api/products/route.ts
  api/upload/route.ts
components/
  auth/login-form.tsx
  cashier/product-grid.tsx
  cashier/cart.tsx
  cashier/payment-dialog.tsx
  admin/product-form.tsx
  admin/category-manager.tsx
  admin/store-settings-form.tsx
  admin/sales-report.tsx
  receipt/receipt-view.tsx
lib/
  supabase/client.ts
  supabase/server.ts
  supabase/proxy.ts
  validation.ts
  currency.ts
  offline-db.ts
supabase/
  migrations/
public/
```

Pisahkan komponen besar. Jangan membuat satu file page yang sangat panjang.

## Flow setup dan deployment

1. Buat project Next.js.
2. Install dependency Supabase SSR/client, validation, UI, export Excel/PDF, dan IndexedDB helper bila diperlukan.
3. Buat Supabase project atau hubungkan Supabase yang sudah ada.
4. Jalankan migration schema dan RLS sebelum menguji UI.
5. Buat user admin melalui Supabase Auth.
6. Buat row `users_profile` role admin.
7. Uji login admin.
8. Buat produk tanpa foto.
9. Buat kategori baru dan pastikan langsung muncul di dropdown.
10. Upload foto produk dan pastikan preview serta URL tersimpan.
11. Simpan pengaturan toko dan logo.
12. Login sebagai kasir.
13. Buat transaksi tunai dan QRIS.
14. Pastikan stok berkurang sesuai qty.
15. Pastikan struk dapat dibuka dan dicetak.
16. Uji laporan dan export Excel/PDF.
17. Uji offline dengan memutus network, membuat transaksi, mengembalikan network, lalu memastikan queue tersinkron tanpa duplikasi.
18. Tambahkan environment variables di Vercel.
19. Deploy ke Vercel.
20. Uji production URL dari browser desktop dan mobile.

## Acceptance criteria

Aplikasi dianggap selesai apabila:

- User dapat login dengan email/password.
- Redirect role admin/kasir berjalan.
- Admin dapat menambah, edit, nonaktifkan, dan hapus produk.
- Kategori baru langsung muncul di dropdown dan tersimpan di database.
- Produk baru berhasil disimpan ke database.
- Upload foto produk dan logo berhasil, preview tampil, dan URL tersimpan.
- Kasir dapat mencari/filter produk dan mengelola keranjang.
- Pembayaran tunai menghitung kembalian benar.
- Pembayaran QRIS dapat dikonfirmasi tanpa input uang tunai.
- Transaksi dan item transaksi tersimpan konsisten.
- Stok berkurang dengan benar dan tidak negatif.
- Struk tampil lengkap dan dapat dicetak.
- Laporan berdasarkan rentang tanggal benar.
- Export Excel dan PDF berjalan.
- Offline cache dan sync queue tidak menggandakan transaksi.
- RLS tidak membolehkan user biasa mengubah role atau pengaturan admin.
- Tidak ada secret yang bocor ke client.
- Production deploy Vercel berhasil.

## Catatan penting

- QRIS pada versi ini hanya metode pembayaran manual. Jangan mengklaim pembayaran sudah diverifikasi otomatis.
- Harga dan total dalam database harus berupa angka, bukan string berformat Rupiah.
- Jangan menaruh credential Supabase asli di file brief, source code, README publik, atau commit.
- Jika terjadi kegagalan upload, tampilkan penyebab yang bisa ditindaklanjuti: bucket tidak ada, policy ditolak, sesi login habis, tipe file salah, atau ukuran file terlalu besar.
- Semua fitur harus dibuat ulang dari awal, bukan mengandalkan file HTML lama sebagai dependency runtime.

## Prompt singkat untuk Vercel/v0 lain

> Bangun ulang aplikasi Kasir UMKM production-ready dari brief ini menggunakan Next.js App Router, TypeScript, Tailwind, Supabase Auth/Postgres/Storage, RLS, dan Vercel. Ikuti seluruh schema, role, flow kasir, admin, kategori, upload foto, transaksi, struk, laporan, offline IndexedDB, validasi server-side, dan acceptance criteria. Mulai dengan memeriksa koneksi Supabase dan schema live, terapkan migration sebelum menulis data-access code, lalu implementasikan UI, backend, testing browser, dan deployment Vercel tanpa mengekspos credential.

## Checklist handoff

- [ ] Brief ini dikirim bersama screenshot referensi bila diperlukan.
- [ ] Supabase project sudah dipilih.
- [ ] Environment variables tersedia di project tujuan.
- [ ] Admin user dibuat melalui Supabase Auth.
- [ ] Role admin dibuat di `users_profile`.
- [ ] Migration database sudah dijalankan.
- [ ] Storage bucket dan policies sudah diverifikasi.
- [ ] Semua acceptance criteria sudah diuji.
- [ ] Production URL sudah diuji.
- [ ] Tidak ada secret yang dikomit.

---

Dokumen ini adalah spesifikasi rekonstruksi aplikasi, bukan salinan credential atau konfigurasi rahasia.
