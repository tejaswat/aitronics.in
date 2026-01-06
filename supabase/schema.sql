-- SQL schema for AITRONICS
-- Apply in order: schema.sql then rls.sql

-- Target schema
CREATE SCHEMA IF NOT EXISTS aitronics_storefront;
SET search_path TO aitronics_storefront, public;

-- Enable uuid-ossp for ids (keeps extension in public)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table reference; auth.users is primary managed by the project's auth system
CREATE TABLE IF NOT EXISTS aitronics_storefront.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  email text,
  role text default 'user',
  created_at timestamptz default now(),
  PRIMARY KEY (id)
);

-- Keep profile email in sync with auth.users metadata
CREATE OR REPLACE FUNCTION aitronics_storefront.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO aitronics_storefront.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION aitronics_storefront.handle_new_user();

-- Categories
CREATE TABLE IF NOT EXISTS aitronics_storefront.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz default now()
);

-- Products
CREATE TABLE IF NOT EXISTS aitronics_storefront.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price integer NOT NULL, -- stored in cents
  currency text default 'USD',
  category_id uuid REFERENCES aitronics_storefront.categories(id) ON DELETE SET NULL,
  stock integer default 0,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Carts (for authenticated users syncing with local storage)
CREATE TABLE IF NOT EXISTS aitronics_storefront.carts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamptz default now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_carts_user ON aitronics_storefront.carts(user_id);

CREATE TABLE IF NOT EXISTS aitronics_storefront.cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id uuid REFERENCES aitronics_storefront.carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES aitronics_storefront.products(id),
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  UNIQUE (cart_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS aitronics_storefront.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  status text DEFAULT 'pending',
  total integer NOT NULL,
  currency text DEFAULT 'USD',
  shipping jsonb,
  created_at timestamptz default now()
);

-- Order items
CREATE TABLE IF NOT EXISTS aitronics_storefront.order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES aitronics_storefront.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES aitronics_storefront.products(id),
  quantity integer NOT NULL,
  unit_price integer NOT NULL
);

-- Rate limiting table for edge functions
CREATE TABLE IF NOT EXISTS aitronics_storefront.request_rate_limits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL, -- e.g., ip or user:<id>
  window_start timestamptz NOT NULL,
  requests int DEFAULT 1,
  created_at timestamptz default now()
);

-- Atomic order creation function: creates order, inserts items, decrements stock, all in a single transaction
CREATE OR REPLACE FUNCTION aitronics_storefront.create_order_with_items(p_user uuid, p_items jsonb, p_shipping jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  o_id uuid;
  item jsonb;
  total integer := 0;
  qty integer;
  up integer;
BEGIN
  PERFORM pg_advisory_xact_lock(1); -- avoid concurrent anomalies
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    qty := (item->>'quantity')::int;
    up := (item->>'unit_price')::int;
    total := total + (qty * up);
    -- check stock
    IF NOT EXISTS (SELECT 1 FROM aitronics_storefront.products WHERE id = (item->>'product_id')::uuid AND stock >= qty) THEN
      RAISE EXCEPTION 'out_of_stock for %', item->>'product_id';
    END IF;
  END LOOP;

  INSERT INTO aitronics_storefront.orders (user_id, status, total, shipping) VALUES (p_user, 'pending', total, p_shipping) RETURNING id INTO o_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO aitronics_storefront.order_items (order_id, product_id, quantity, unit_price)
    VALUES (o_id, (item->>'product_id')::uuid, (item->>'quantity')::int, (item->>'unit_price')::int);

    -- decrement stock
    UPDATE aitronics_storefront.products SET stock = stock - (item->>'quantity')::int WHERE id = (item->>'product_id')::uuid;
  END LOOP;

  RETURN o_id;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON aitronics_storefront.products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON aitronics_storefront.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON aitronics_storefront.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON aitronics_storefront.order_items(order_id);
