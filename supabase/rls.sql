-- RLS & Policies

-- Enable RLS where appropriate
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Products: public read-only
CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (true);

-- Categories: public read-only
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "admin_modify_categories" ON categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders: users can only INSERT their own orders via service or when authenticated
CREATE POLICY "user_orders_select" ON orders
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "user_orders_insert" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_orders_update" ON orders
  FOR UPDATE USING (user_id = auth.uid());

-- Admin role: allow full access when jwt claim role = 'admin'
CREATE POLICY "admin_full_access_orders" ON orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Prevent exposing sensitive data by not allowing direct product updates from anon clients
CREATE POLICY "no_public_modify_products" ON products
  FOR UPDATE, DELETE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- For order_items, rely on orders' cascade and server functions for insertion
CREATE POLICY "order_items_by_order" ON order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')));

-- Prevent direct inserts by clients
CREATE POLICY "no_public_insert_order_items" ON order_items
  FOR INSERT USING (auth.jwt() ->> 'role' = 'admin');

-- Carts: users read/write their own cart
CREATE POLICY "user_cart_select" ON carts
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "user_cart_insert" ON carts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "user_cart_update" ON carts
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Cart items scoped by cart ownership
CREATE POLICY "cart_items_select" ON cart_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY "cart_items_insert" ON cart_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY "cart_items_update" ON cart_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));
CREATE POLICY "cart_items_delete" ON cart_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));

-- request_rate_limits: service role only
CREATE POLICY "service_rate_limits" ON request_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- profiles: owners or admin read
CREATE POLICY "profile_select" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "profile_update_self" ON profiles
  FOR UPDATE USING (auth.uid() = id);
