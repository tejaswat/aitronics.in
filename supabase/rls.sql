-- RLS & Policies for aitronics_storefront schema

SET search_path TO aitronics_storefront, public;

-- Enable RLS where appropriate
ALTER TABLE aitronics_storefront.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.request_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE aitronics_storefront.profiles ENABLE ROW LEVEL SECURITY;

-- Products: public read-only
CREATE POLICY IF NOT EXISTS "public_read_products" ON aitronics_storefront.products
  FOR SELECT USING (true);

-- Categories: public read-only
CREATE POLICY IF NOT EXISTS "public_read_categories" ON aitronics_storefront.categories
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "admin_modify_categories" ON aitronics_storefront.categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders: users can only INSERT their own orders via service or when authenticated
CREATE POLICY IF NOT EXISTS "user_orders_select" ON aitronics_storefront.orders
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "user_orders_insert" ON aitronics_storefront.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "user_orders_update" ON aitronics_storefront.orders
  FOR UPDATE USING (user_id = auth.uid());

-- Admin role: allow full access when jwt claim role = 'admin'
CREATE POLICY IF NOT EXISTS "admin_full_access_orders" ON aitronics_storefront.orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Prevent exposing sensitive data by not allowing direct product updates from anon clients
CREATE POLICY IF NOT EXISTS "no_public_modify_products" ON aitronics_storefront.products
  FOR UPDATE, DELETE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- For order_items, rely on orders' cascade and server functions for insertion
CREATE POLICY IF NOT EXISTS "order_items_by_order" ON aitronics_storefront.order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM aitronics_storefront.orders o WHERE o.id = aitronics_storefront.order_items.order_id AND (o.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')));

-- Prevent direct inserts by clients
CREATE POLICY IF NOT EXISTS "no_public_insert_order_items" ON aitronics_storefront.order_items
  FOR INSERT USING (auth.jwt() ->> 'role' = 'admin');

-- Carts: users read/write their own cart
CREATE POLICY IF NOT EXISTS "user_cart_select" ON aitronics_storefront.carts
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "user_cart_insert" ON aitronics_storefront.carts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "user_cart_update" ON aitronics_storefront.carts
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Cart items scoped by cart ownership
CREATE POLICY IF NOT EXISTS "cart_items_select" ON aitronics_storefront.cart_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "cart_items_insert" ON aitronics_storefront.cart_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "cart_items_update" ON aitronics_storefront.cart_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "cart_items_delete" ON aitronics_storefront.cart_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));

-- request_rate_limits: service role only
CREATE POLICY IF NOT EXISTS "service_rate_limits" ON aitronics_storefront.request_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- profiles: owners or admin read
CREATE POLICY IF NOT EXISTS "profile_select" ON aitronics_storefront.profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY IF NOT EXISTS "profile_update_self" ON aitronics_storefront.profiles
  FOR UPDATE USING (auth.uid() = id);
