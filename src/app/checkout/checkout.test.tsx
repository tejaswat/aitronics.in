import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Checkout from './page'
import * as cartStore from '../../stores/cart'
import axios from 'axios'

vi.mock('axios')
vi.mock('../../lib/supabaseClient', () => ({ supabase: { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) } } }))

describe('Checkout page', () => {
  beforeEach(() => {
    cartStore.default.setState({ items: [ { id: 'p1', name: 'Test', price: 1000, quantity: 1 } ] })
  })

  it('renders order summary and validates shipping', async () => {
    render(<Checkout />)
    expect(screen.getByText('Order Summary')).toBeTruthy()

    const pay = screen.getByRole('button', { name: /pay/i })
    expect(pay).toBeTruthy()

    // click pay without shipping -> validation
    fireEvent.click(pay)
    expect(await screen.findByRole('alert')).toBeTruthy()
  })

  it('submits checkout when valid', async () => {
    (axios.post as any).mockResolvedValue({ data: { orderId: 'abcd' } })
    render(<Checkout />)
    fireEvent.change(screen.getByLabelText('shipping-name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('shipping-address'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('shipping-city'), { target: { value: 'Town' } })
    fireEvent.change(screen.getByLabelText('shipping-postal'), { target: { value: '12345' } })

    const pay = screen.getByRole('button', { name: /pay/i })
    fireEvent.click(pay)

    // since we redirect on success, expect no visible error
    expect(await screen.queryByRole('alert')).toBeNull()
  })
})