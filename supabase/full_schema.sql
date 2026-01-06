-- Combined schema and RLS for Aitronics Storefront
-- Creates schema aitronics_storefront and all objects within it.
-- Safe to re-run; uses IF NOT EXISTS where possible.

CREATE SCHEMA IF NOT EXISTS aitronics_storefront;

-- Extensions (remain in public)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== Schema ==========

-- Profiles (linked to auth.users)
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

-- Atomic order creation function: creates order, inserts items, decrements stock
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON aitronics_storefront.products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON aitronics_storefront.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON aitronics_storefront.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON aitronics_storefront.order_items(order_id);

-- ========== RLS & Policies ==========

ALTER TABLE aitronics_storefront.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.request_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.profiles ENABLE ROW LEVEL SECURITY;

-- Products: public read-only
CREATE POLICY IF NOT EXISTS public_read_products ON aitronics_storefront.products
  FOR SELECT USING (true);

-- Categories: public read-only
CREATE POLICY IF NOT EXISTS public_read_categories ON aitronics_storefront.categories
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS admin_modify_categories ON aitronics_storefront.categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders: user scoped
CREATE POLICY IF NOT EXISTS user_orders_select ON aitronics_storefront.orders
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY IF NOT EXISTS user_orders_insert ON aitronics_storefront.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS user_orders_update ON aitronics_storefront.orders
  FOR UPDATE USING (user_id = auth.uid());

-- Admin override
CREATE POLICY IF NOT EXISTS admin_full_access_orders ON aitronics_storefront.orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Products: block public modifications
CREATE POLICY IF NOT EXISTS no_public_modify_products ON aitronics_storefront.products
  FOR UPDATE, DELETE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Order items: select scoped to order owner/admin; insert via server only
CREATE POLICY IF NOT EXISTS order_items_by_order ON aitronics_storefront.order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM aitronics_storefront.orders o WHERE o.id = aitronics_storefront.order_items.order_id AND (o.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')));

CREATE POLICY IF NOT EXISTS no_public_insert_order_items ON aitronics_storefront.order_items
  FOR INSERT USING (auth.jwt() ->> 'role' = 'admin');

-- Carts: user scoped
CREATE POLICY IF NOT EXISTS user_cart_select ON aitronics_storefront.carts
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS user_cart_insert ON aitronics_storefront.carts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS user_cart_update ON aitronics_storefront.carts
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Cart items scoped by cart ownership
CREATE POLICY IF NOT EXISTS cart_items_select ON aitronics_storefront.cart_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS cart_items_insert ON aitronics_storefront.cart_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS cart_items_update ON aitronics_storefront.cart_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS cart_items_delete ON aitronics_storefront.cart_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));

-- request_rate_limits: service role only
CREATE POLICY IF NOT EXISTS service_rate_limits ON aitronics_storefront.request_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- profiles: owners or admin read; self-update
CREATE POLICY IF NOT EXISTS profile_select ON aitronics_storefront.profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY IF NOT EXISTS profile_update_self ON aitronics_storefront.profiles
  FOR UPDATE USING (auth.uid() = id);
