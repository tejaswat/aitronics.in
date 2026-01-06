import Link from 'next/link'
import AddToCartButton from '../../../components/add-to-cart'
import { getProduct, getRelatedProducts } from '../../../lib/actions'

type Params = { params: { id: string } }

export default async function ProductDetail({ params }: Params) {
  const product = await getProduct(params.id)
  if (!product) return <p>Product not found</p>
  const related = await getRelatedProducts(product.category_id, product.id)

  return (
    <div>
      <Link href="/products">← Back to products</Link>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
        <div className="product-hero">
          <div className="product-image" aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">#{product.category_id || 'general'}</p>
          <h1>{product.name}</h1>
          <p className="muted">{product.description}</p>
          <p className="price">${(product.price / 100).toFixed(2)}</p>
          <p className="stock">{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</p>
          <AddToCartButton product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h3>Related items</h3>
          <div className="grid">
            {related.map((p) => (
              <article key={p.id} className="product-card">
                <h4>
                  <Link href={`/products/${p.id}`}>{p.name}</Link>
                </h4>
                <p className="muted">{p.description}</p>
                <strong>${(p.price / 100).toFixed(2)}</strong>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
