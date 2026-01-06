-- ==========================================
-- Aitronics Storefront (Supabase install.sql)
-- Schema + Tables + Trigger + RLS + RPC
-- ==========================================

-- 1) Schema
create schema if not exists aitronics_storefront;

-- 2) UUID support (Supabase typically has pgcrypto enabled already)
create extension if not exists pgcrypto;

-- ==========================================
-- 3) Tables
-- ==========================================

-- Profiles (1:1 with auth.users)
create table if not exists aitronics_storefront.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Categories
create table if not exists aitronics_storefront.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists aitronics_storefront.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null check (price >= 0), -- cents
  currency text not null default 'USD',
  category_id uuid references aitronics_storefront.categories(id) on delete set null,
  stock integer not null default 0 check (stock >= 0),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category
  on aitronics_storefront.products(category_id);

-- Carts
create table if not exists aitronics_storefront.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_cart_user
  on aitronics_storefront.carts(user_id);

-- Cart Items
create table if not exists aitronics_storefront.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references aitronics_storefront.carts(id) on delete cascade,
  product_id uuid not null references aitronics_storefront.products(id),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  unique (cart_id, product_id)
);

-- Orders
create table if not exists aitronics_storefront.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  total integer not null check (total >= 0),
  currency text not null default 'USD',
  shipping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user
  on aitronics_storefront.orders(user_id);

-- Order Items
create table if not exists aitronics_storefront.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references aitronics_storefront.orders(id) on delete cascade,
  product_id uuid not null references aitronics_storefront.products(id),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

create index if not exists idx_order_items_order
  on aitronics_storefront.order_items(order_id);

-- Rate limits (optional)
create table if not exists aitronics_storefront.request_rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null,                       -- ip or user:<uuid>
  window_start timestamptz not null,
  requests int not null default 1,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 4) Trigger: auth.users -> profiles
-- ==========================================

create or replace function aitronics_storefront.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = aitronics_storefront, public
as $$
begin
  insert into aitronics_storefront.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id)
  do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function aitronics_storefront.handle_new_user();

-- ==========================================
-- 5) RLS Enable
-- ==========================================

alter table aitronics_storefront.profiles enable row level security;
alter table aitronics_storefront.categories enable row level security;
alter table aitronics_storefront.products enable row level security;
alter table aitronics_storefront.carts enable row level security;
alter table aitronics_storefront.cart_items enable row level security;
alter table aitronics_storefront.orders enable row level security;
alter table aitronics_storefront.order_items enable row level security;
alter table aitronics_storefront.request_rate_limits enable row level security;

-- Helper: admin check
-- Note: You must set custom JWT claim "role": "admin" for admin users
-- (commonly via Supabase Auth hooks or your own admin tooling).

-- ==========================================
-- 6) Policies
-- ==========================================

-- Public read products/categories
drop policy if exists public_read_products on aitronics_storefront.products;
create policy public_read_products
on aitronics_storefront.products
for select
using (true);

drop policy if exists public_read_categories on aitronics_storefront.categories;
create policy public_read_categories
on aitronics_storefront.categories
for select
using (true);

-- Admin manage products/categories
drop policy if exists admin_manage_products on aitronics_storefront.products;
create policy admin_manage_products
on aitronics_storefront.products
for all
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');

drop policy if exists admin_manage_categories on aitronics_storefront.categories;
create policy admin_manage_categories
on aitronics_storefront.categories
for all
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');

-- Profiles: user can read/update self; admin can read all
drop policy if exists profile_select on aitronics_storefront.profiles;
create policy profile_select
on aitronics_storefront.profiles
for select
using (auth.uid() = id or auth.jwt() ->> 'role' = 'admin');

drop policy if exists profile_update_self on aitronics_storefront.profiles;
create policy profile_update_self
on aitronics_storefront.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Carts: user only
drop policy if exists cart_select on aitronics_storefront.carts;
create policy cart_select
on aitronics_storefront.carts
for select
using (auth.uid() = user_id);

drop policy if exists cart_insert on aitronics_storefront.carts;
create policy cart_insert
on aitronics_storefront.carts
for insert
with check (auth.uid() = user_id);

drop policy if exists cart_update on aitronics_storefront.carts;
create policy cart_update
on aitronics_storefront.carts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists cart_delete on aitronics_storefront.carts;
create policy cart_delete
on aitronics_storefront.carts
for delete
using (auth.uid() = user_id);

-- Cart items: must belong to a cart owned by user

drop policy if exists cart_items_select on aitronics_storefront.cart_items;
create policy cart_items_select
on aitronics_storefront.cart_items
for select
using (
  exists (
    select 1 from aitronics_storefront.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists cart_items_insert on aitronics_storefront.cart_items;
create policy cart_items_insert
on aitronics_storefront.cart_items
for insert
with check (
  exists (
    select 1 from aitronics_storefront.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists cart_items_update on aitronics_storefront.cart_items;
create policy cart_items_update
on aitronics_storefront.cart_items
for update
using (
  exists (
    select 1 from aitronics_storefront.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from aitronics_storefront.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists cart_items_delete on aitronics_storefront.cart_items;
create policy cart_items_delete
on aitronics_storefront.cart_items
for delete
using (
  exists (
    select 1 from aitronics_storefront.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

-- Orders: user sees own; admin sees all
drop policy if exists orders_select on aitronics_storefront.orders;
create policy orders_select
on aitronics_storefront.orders
for select
using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'admin');

-- Orders insert: must be own user_id
drop policy if exists orders_insert on aitronics_storefront.orders;
create policy orders_insert
on aitronics_storefront.orders
for insert
with check (user_id = auth.uid());

-- Orders update: only admin (prevents users changing status/total)
drop policy if exists orders_update_admin on aitronics_storefront.orders;
create policy orders_update_admin
on aitronics_storefront.orders
for update
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');

-- Order items: user can read items for own orders; admin all
drop policy if exists order_items_select on aitronics_storefront.order_items;
create policy order_items_select
on aitronics_storefront.order_items
for select
using (
  exists (
    select 1 from aitronics_storefront.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or auth.jwt() ->> 'role' = 'admin')
  )
);

-- Block direct writes to order_items (force RPC / server-side only)

drop policy if exists order_items_insert_block on aitronics_storefront.order_items;
create policy order_items_insert_block
on aitronics_storefront.order_items
for insert
with check (false);

drop policy if exists order_items_update_block on aitronics_storefront.order_items;
create policy order_items_update_block
on aitronics_storefront.order_items
for update
using (false);

drop policy if exists order_items_delete_block on aitronics_storefront.order_items;
create policy order_items_delete_block
on aitronics_storefront.order_items
for delete
using (false);


-- Rate limits: service role only
drop policy if exists service_rate_limits on aitronics_storefront.request_rate_limits;
create policy service_rate_limits
on aitronics_storefront.request_rate_limits
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- ==========================================
-- 7) RPC: Create order + items + decrement stock (safe)
-- ==========================================

create or replace function aitronics_storefront.create_order_with_items(
  p_items jsonb,
  p_shipping jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = aitronics_storefront, public
as $$
declare
  o_id uuid;
  item jsonb;
  total integer := 0;
  qty integer;
  up integer;
  pid uuid;
begin
  -- Require logged-in user
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  -- Validate + compute total + lock product rows to prevent race
  for item in select * from jsonb_array_elements(p_items)
  loop
    qty := (item->>'quantity')::int;
    up  := (item->>'unit_price')::int;
    pid := (item->>'product_id')::uuid;

    if qty <= 0 or up < 0 then
      raise exception 'invalid_item';
    end if;

    -- lock product row
    perform 1
    from aitronics_storefront.products
    where id = pid
    for update;

    -- check stock
    if not exists (
      select 1 from aitronics_storefront.products
      where id = pid and stock >= qty
    ) then
      raise exception 'out_of_stock:%', pid;
    end if;

    total := total + (qty * up);
  end loop;

  insert into aitronics_storefront.orders (user_id, status, total, shipping)
  values (auth.uid(), 'pending', total, p_shipping)
  returning id into o_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    insert into aitronics_storefront.order_items (order_id, product_id, quantity, unit_price)
    values (
      o_id,
      (item->>'product_id')::uuid,
      (item->>'quantity')::int,
      (item->>'unit_price')::int
    );

    update aitronics_storefront.products
    set stock = stock - (item->>'quantity')::int
    where id = (item->>'product_id')::uuid;
  end loop;

  return o_id;
end;
$$;

-- Allow authenticated users to call the RPC
revoke all on function aitronics_storefront.create_order_with_items(jsonb, jsonb) from public;
grant execute on function aitronics_storefront.create_order_with_items(jsonb, jsonb) to authenticated;
