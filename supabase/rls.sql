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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'public_read_products' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'products'
  ) THEN
    EXECUTE $policy$CREATE POLICY public_read_products ON aitronics_storefront.products FOR SELECT USING (true);$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- Categories: public read-only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'public_read_categories' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'categories'
  ) THEN
    EXECUTE $policy$CREATE POLICY public_read_categories ON aitronics_storefront.categories FOR SELECT USING (true);$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'admin_modify_categories' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'categories'
  ) THEN
    EXECUTE $policy$CREATE POLICY admin_modify_categories ON aitronics_storefront.categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- Orders: users can only INSERT their own orders via service or when authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'user_orders_select' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'orders'
  ) THEN
    EXECUTE $policy$CREATE POLICY user_orders_select ON aitronics_storefront.orders FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'user_orders_insert' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'orders'
  ) THEN
    EXECUTE $policy$CREATE POLICY user_orders_insert ON aitronics_storefront.orders FOR INSERT WITH CHECK (user_id = auth.uid());$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'user_orders_update' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'orders'
  ) THEN
    EXECUTE $policy$CREATE POLICY user_orders_update ON aitronics_storefront.orders FOR UPDATE USING (user_id = auth.uid());$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- Admin role: allow full access when jwt claim role = 'admin'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'admin_full_access_orders' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'orders'
  ) THEN
    EXECUTE $policy$CREATE POLICY admin_full_access_orders ON aitronics_storefront.orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- Prevent exposing sensitive data by not allowing direct product updates from anon clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'no_public_modify_products' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'products'
  ) THEN
    EXECUTE $policy$CREATE POLICY no_public_modify_products ON aitronics_storefront.products FOR UPDATE, DELETE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- For order_items, rely on orders' cascade and server functions for insertion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'order_items_by_order' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'order_items'
  ) THEN
    EXECUTE $policy$CREATE POLICY order_items_by_order ON aitronics_storefront.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM aitronics_storefront.orders o WHERE o.id = aitronics_storefront.order_items.order_id AND (o.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')));$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- Prevent direct inserts by clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'no_public_insert_order_items' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'order_items'
  ) THEN
    EXECUTE $policy$CREATE POLICY no_public_insert_order_items ON aitronics_storefront.order_items FOR INSERT USING (auth.jwt() ->> 'role' = 'admin');$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- Carts: users read/write their own cart
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'user_cart_select' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'carts'
  ) THEN
    EXECUTE $policy$CREATE POLICY user_cart_select ON aitronics_storefront.carts FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);$policy$;
  END IF;
END$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'user_cart_insert' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'carts'
  ) THEN
    EXECUTE $policy$CREATE POLICY user_cart_insert ON aitronics_storefront.carts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);$policy$;
  END IF;
END$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'user_cart_update' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'carts'
  ) THEN
    EXECUTE $policy$CREATE POLICY user_cart_update ON aitronics_storefront.carts FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- Cart items scoped by cart ownership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'cart_items_select' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'cart_items'
  ) THEN
    EXECUTE $policy$CREATE POLICY cart_items_select ON aitronics_storefront.cart_items FOR SELECT USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));$policy$;
  END IF;
END$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'cart_items_insert' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'cart_items'
  ) THEN
    EXECUTE $policy$CREATE POLICY cart_items_insert ON aitronics_storefront.cart_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));$policy$;
  END IF;
END$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'cart_items_update' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'cart_items'
  ) THEN
    EXECUTE $policy$CREATE POLICY cart_items_update ON aitronics_storefront.cart_items FOR UPDATE USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));$policy$;
  END IF;
END$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'cart_items_delete' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'cart_items'
  ) THEN
    EXECUTE $policy$CREATE POLICY cart_items_delete ON aitronics_storefront.cart_items FOR DELETE USING (EXISTS (SELECT 1 FROM aitronics_storefront.carts c WHERE c.id = aitronics_storefront.cart_items.cart_id AND c.user_id = auth.uid()));$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- request_rate_limits: service role only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'service_rate_limits' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'request_rate_limits'
  ) THEN
    EXECUTE $policy$CREATE POLICY service_rate_limits ON aitronics_storefront.request_rate_limits FOR ALL USING (auth.role() = 'service_role');$policy$;
  END IF;
END$$ LANGUAGE plpgsql;

-- profiles: owners or admin read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'profile_select' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'profiles'
  ) THEN
    EXECUTE $policy$CREATE POLICY profile_select ON aitronics_storefront.profiles FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');$policy$;
  END IF;
END$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'profile_update_self' AND p.schemaname = 'aitronics_storefront' AND p.tablename = 'profiles'
  ) THEN
    EXECUTE $policy$CREATE POLICY profile_update_self ON aitronics_storefront.profiles FOR UPDATE USING (auth.uid() = id);$policy$;
  END IF;
END$$ LANGUAGE plpgsql;
