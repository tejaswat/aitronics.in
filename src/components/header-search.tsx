'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeaderSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [results, setResults] = useState<Array<{ id: string; name: string; price?: number }>>([])
  const [_loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  useEffect(() => {
    if (!q || q.trim().length === 0) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    timerRef.current = window.setTimeout(() => {
      abortRef.current = new AbortController()
      const url = `/api/search?q=${encodeURIComponent(q)}${category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''}`
      fetch(url, { signal: abortRef.current.signal })
        .then((r) => r.json())
        .then((data) => setResults(data || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 250)
  }, [q, category])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setResults([])
        setActive(-1)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const base = '/products'
    if (!q) return router.push(category && category !== 'all' ? `${base}?category=${encodeURIComponent(category)}` : base)
    const qs = `q=${encodeURIComponent(q)}${category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''}`
    router.push(`${base}?${qs}`)
    setResults([])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      if (active >= 0 && results[active]) {
        router.push(`/products/${results[active].id}`)
        setResults([])
      }
    } else if (e.key === 'Escape') {
      setResults([])
      setActive(-1)
    }
  }

  useEffect(() => {
    // update an aria-live region so screen readers announce category changes
    const el = document.getElementById('nav-search-category-announcer')
    if (el) el.textContent = `Category: ${category === 'all' ? 'All categories' : category}`
  }, [category])

  return (
    <div className="header-search amazon" ref={containerRef}>
      <form onSubmit={onSubmit} style={{ display: 'flex', width: '100%' }} role="search" aria-label="Search products">
        <select
          id="nav-search-category"
          className="search-category"
          aria-label="Search category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All</option>
          <option value="mobiles">Mobiles</option>
          <option value="bestsellers">Bestsellers</option>
          <option value="electronics">Electronics</option>
          <option value="home">Home &amp; Kitchen</option>
          <option value="books">Books</option>
        </select>

        <input
          id="nav-search-input"
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(-1)
          }}
          onKeyDown={onKeyDown}
          placeholder="Search all products"
          aria-label="Search products"
        />
        <button type="submit" aria-label="Search">
          Search
        </button>
      </form>

      {results.length > 0 && (
        <div className="search-suggestions" role="listbox" aria-label="Search suggestions">
          <ul>
            {results.map((r, i) => (
              <li
                key={r.id}
                role="option"
                aria-selected={i === active}
                className={i === active ? 'active' : ''}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  router.push(`/products/${r.id}`)
                  setResults([])
                }}
              >
                <span>{r.name}</span>
                {typeof r.price === 'number' ? <span className="muted">${(r.price / 100).toFixed(2)}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
