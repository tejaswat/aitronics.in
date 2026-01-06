import Skeleton from '../../components/skeleton'

export default function LoadingProducts() {
  return (
    <div className="grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="product-card">
          <Skeleton width="60%" />
          <Skeleton width="80%" />
          <Skeleton width="40%" />
        </div>
      ))}
    </div>
  )
}
