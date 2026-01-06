import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabaseClient'

type CartItem = { id: string; name: string; price: number; quantity: number }

/* eslint-disable no-unused-vars */
type CartState = {
  items: CartItem[]
  hydrated: boolean
  add: (_item: CartItem) => void
  remove: (_id: string) => void
  clear: () => void
  setQuantity: (_id: string, _quantity: number) => void
  syncToSupabase: (_userId: string) => Promise<void>
  loadFromSupabase: (_userId: string) => Promise<void>
}
/* eslint-enable no-unused-vars */

const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      add: (item: CartItem) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id)
          if (exists) {
            return {
              items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
            }
          }
          return { items: [...state.items, item] }
        }),
      remove: (id: string) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      setQuantity: (id: string, quantity: number) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
        })),
      syncToSupabase: async (userId: string) => {
        const items = get().items
        if (!userId || items.length === 0) return

        // ensure cart exists
        const { data: cartRow, error: cartErr } = await supabase
          .from('carts')
          .upsert({ user_id: userId }, { onConflict: 'user_id' })
          .select('id')
          .single()
        if (cartErr || !cartRow?.id) return

        const payload = items.map((i) => ({
          cart_id: cartRow.id,
          product_id: i.id,
          quantity: i.quantity,
          unit_price: i.price
        }))
        await supabase.from('cart_items').upsert(payload, { onConflict: 'cart_id,product_id' })
      },
      loadFromSupabase: async (userId: string) => {
        if (!userId) return
        const { data: cartRow } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle()
        if (!cartRow?.id) {
          set({ hydrated: true })
          return
        }
        const { data: items } = await supabase
          .from('cart_items')
          .select('product_id,quantity,unit_price,products(name)')
          .eq('cart_id', cartRow.id)
        if (items) {
          set({
            items: items.map((i: any) => ({
              id: i.product_id,
              name: (i as any).products?.name ?? 'Item',
              price: i.unit_price,
              quantity: i.quantity
            })),
            hydrated: true
          })
        } else {
          set({ hydrated: true })
        }
      }
    }),
    {
      name: 'fina-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items })
    }
  )
)

export type { CartItem, CartState }
export default useCart
