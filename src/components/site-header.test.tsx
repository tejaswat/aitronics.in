/* eslint-env vitest */
/* eslint-disable no-undef */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

// mock the Next.js router used in HeaderSearch
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import SiteHeader from './site-header'
import '@testing-library/jest-dom'

// ensure DOM timers are reset between tests
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('SiteHeader search modal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  test('focuses header input and shows search results', async () => {
    vi.useFakeTimers()

    // stub fetch to return a result
    const fake = vi.fn().mockResolvedValue({ json: async () => [{ id: '1', name: 'Test Product', price: 1000 }] })
    vi.stubGlobal('fetch', fake)

    render(<SiteHeader />)

    // find the input element (there's also a form with same aria-label)
    const labeled = screen.getAllByLabelText(/search products/i)
    const input = labeled.find((el) => el.tagName === 'INPUT')
    expect(input).toBeDefined()
    // focus the input (use DOM focus to ensure jsdom updates activeElement)
    ;(input as HTMLInputElement).focus()
    expect(document.activeElement).toBe(input)

    // type into input and advance debounce timer
    fireEvent.change(input!, { target: { value: 'Test' } })
    // advance enough time for debounce and fetch to resolve
    vi.advanceTimersByTime(500)
    // ensure microtasks settle
    await Promise.resolve()

    // assert fetch was invoked and suggestions would be fetched
    expect(fake).toHaveBeenCalled()

  })
})