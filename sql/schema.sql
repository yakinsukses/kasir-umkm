-- ================================================
-- SCHEMA DATABASE — Kasir UMKM
-- Jalankan di Supabase Dashboard -> SQL Editor -> New Query
-- ================================================

create extension if not exists "pgcrypto";

-- Produk / Menu
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric not null default 0,
  photo_url text,
  is_active boolean not null default true,
  stock numeric,
  created_at timestamptz not null default now()
);

-- Transaksi
create table transactions (
  id uuid primary key default gen_random_uuid(),
  cashier_name text,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  payment_method text not null default 'Tunai',
  cash_received numeric default 0,
  change numeric default 0,
  created_at timestamptz not null default now()
);

-- Item per transaksi
create table transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  qty numeric not null default 1,
  price_at_transaction numeric not null default 0
);

-- Pengaturan toko (single row)
create table store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text default 'Toko Saya',
  address text,
  phone text,
  logo_url text,
  receipt_header text default 'Terima kasih telah berbelanja',
  receipt_footer text default 'Sampai jumpa lagi!'
);

-- Profil role user (dihubungkan ke auth.users)
create table users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'kasir' check (role in ('admin', 'kasir')),
  created_at timestamptz not null default now()
);

-- Seed 1 baris default pengaturan toko
insert into store_settings (store_name, address, phone, receipt_header, receipt_footer)
values ('Toko Saya', 'Alamat toko kamu', '08xx-xxxx-xxxx', 'Terima kasih telah berbelanja', 'Sampai jumpa lagi!');

-- ================================================
-- ROW LEVEL SECURITY
-- Karena hanya 1 toko, aturannya sederhana:
-- siapa pun yang SUDAH LOGIN boleh akses semua data.
-- ================================================

alter table products enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table store_settings enable row level security;
alter table users_profile enable row level security;

create policy "authenticated access products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated access transactions" on transactions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated access transaction_items" on transaction_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated access store_settings" on store_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "user can read own profile" on users_profile
  for select using (auth.uid() = id);

-- Catatan: users_profile sengaja TIDAK bisa di-insert/update oleh user biasa
-- (supaya orang tidak bisa naikkan role dirinya sendiri jadi admin).
-- Tambah/ubah role dilakukan manual oleh kamu lewat SQL Editor, lihat README.md.
