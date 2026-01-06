import Link from 'next/link'
import { getCategories, getProducts } from '../../lib/actions'

type Search = { [key: string]: string | string[] | undefined }

export default async function ProductsPage({ searchParams }: { searchParams?: Search }) {
  const page = Number((searchParams?.page as string) || '1')
  const limit = 12
  const offset = (page - 1) * limit
  const category = (searchParams?.category as string) || null
  const search = (searchParams?.q as string) || null

  const [products, categories] = await Promise.all([getProducts({ limit, offset, category, search }), getCategories()])

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Products</h2>
          <p className="muted">Browse curated hardware with real-time stock.</p>
        </div>
        <form className="filters" action="/products" method="get">
          <input type="text" name="q" defaultValue={search || ''} placeholder="Search products" aria-label="Search" />
          <select name="category" defaultValue={category || ''} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit">Apply</button>
        </form>
      </header>

      <div className="grid">
        {products.map((p) => (
          <article key={p.id} className="product-card">
            <h3>
              <Link href={`/products/${p.id}`}>{p.name}</Link>
            </h3>
            <p className="muted">{p.description}</p>
            <div className="card-footer">
              <strong>${(p.price / 100).toFixed(2)}</strong>
              <Link href={`/products/${p.id}`}>View</Link>
            </div>
          </article>
        ))}
      </div>

      <div className="pagination">
        <Link href={`/products?page=${Math.max(1, page - 1)}${category ? `&category=${category}` : ''}${search ? `&q=${search}` : ''}`} aria-disabled={page === 1}>
          Previous
        </Link>
        <span>Page {page}</span>
        <Link href={`/products?page=${page + 1}${category ? `&category=${category}` : ''}${search ? `&q=${search}` : ''}`}>Next</Link>
      </div>
    </div>
  )
}
