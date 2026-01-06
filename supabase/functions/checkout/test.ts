// Basic Deno test: ensure the function file contains core keywords (price_mismatch, out_of_stock, rpc/create_order_with_items)
import { assert } from "https://deno.land/std@0.201.0/testing/asserts.ts";

Deno.test('checkout function contains validations', async () => {
  const text = await Deno.readTextFile('./index.ts')
  assert(text.includes('price_mismatch'))
  assert(text.includes('out_of_stock'))
  assert(text.includes('rpc/create_order_with_items') || text.includes('create_order_with_items'))
  assert(text.includes('rate_limit'))
});
