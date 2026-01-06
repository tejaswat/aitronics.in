import { describe, it, expect, beforeEach } from 'vitest'
import useCart from './cart'

describe('cart store', () => {
  beforeEach(() => {
    useCart.setState({ items: [] })
  })

  it('adds an item', () => {
    useCart.getState().add({ id: 'p1', name: 'Product 1', price: 1000, quantity: 1 })
    const items = useCart.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('p1')
  })

  it('increments an existing item quantity', () => {
    useCart.getState().add({ id: 'p2', name: 'Product 2', price: 500, quantity: 1 })
    useCart.getState().add({ id: 'p2', name: 'Product 2', price: 500, quantity: 2 })
    const items = useCart.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('removes an item', () => {
    useCart.getState().add({ id: 'p3', name: 'x', price: 100, quantity: 1 })
    expect(useCart.getState().items).toHaveLength(1)
    useCart.getState().remove('p3')
    expect(useCart.getState().items).toHaveLength(0)
  })
})
