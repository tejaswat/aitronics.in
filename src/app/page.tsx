import Link from 'next/link'
import { getProducts, getCategories } from '../lib/actions'

export default async function Home() {
  const [featured, categories] = await Promise.all([getProducts({ limit: 4 }), getCategories()])
  const newArrivals = await getProducts({ limit: 4, offset: 4 })

  return (
    <div>
      <section className="hero">
        <div>
          <p className="eyebrow">Trusted by builders</p>
          <h1>Secure commerce for premium hardware.</h1>
          <p className="muted">
            Modern storefront powered by Supabase on gateway.thefina.com. Optimized for speed, safety, and global
            delivery.
          </p>
          <div className="actions">
            <Link className="button primary" href="/products">
              Shop products
            </Link>
            <Link className="button ghost" href="/auth/login?mode=signup">
              Create account
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <p className="muted">Real-time stock validation • Rate-limited checkout • PCI-ready flow</p>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>Featured</h2>
          <Link href="/products">See all</Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <article key={p.id} className="product-card">
              <h3>
                <Link href={`/products/${p.id}`}>{p.name}</Link>
              </h3>
              <p className="muted">{p.description}</p>
              <strong>${(p.price / 100).toFixed(2)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>New arrivals</h2>
          <span className="muted">Fresh inventory just landed.</span>
        </div>
        <div className="grid">
          {newArrivals.map((p) => (
            <article key={p.id} className="product-card">
              <h3>
                <Link href={`/products/${p.id}`}>{p.name}</Link>
              </h3>
              <p className="muted">{p.description}</p>
              <strong>${(p.price / 100).toFixed(2)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>Categories</h2>
        </div>
        <div className="pill-row">
          {categories.map((c) => (
            <Link key={c.id} className="pill" href={`/products?category=${c.id}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
