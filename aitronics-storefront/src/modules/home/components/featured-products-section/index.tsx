import { Heading, Text } from "@medusajs/ui"

import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import FeaturedProductCard from "./featured-product-card"

const fetchFeaturedProducts = async ({
  countryCode,
  limit = 6,
}: {
  countryCode: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> => {
  const { collections } = await listCollections({
    handle: "featured",
    limit: "1",
  })

  const queryParams: Record<string, any> = {
    limit,
  }

  if (collections?.length) {
    queryParams.collection_id = [collections[0].id]
  }

  const { response } = await listProducts({
    countryCode,
    queryParams,
  })

  if (response.products.length) {
    return response.products
  }

  const fallback = await listProducts({
    countryCode,
    queryParams: {
      limit,
    },
  })

  return fallback.response.products
}

const FeaturedProductsSection = async ({ countryCode }: { countryCode: string }) => {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const products = await fetchFeaturedProducts({ countryCode, limit: 6 })

  if (!products.length) {
    return null
  }

  return (
    <section className="content-container py-16" id="featured">
      <div className="flex flex-col gap-2 max-w-3xl">
        <Text className="uppercase tracking-[0.4em] text-xs text-ui-fg-subtle">
          Featured products
        </Text>
        <Heading level="h2" className="text-3xl font-semibold text-white">
          Robotics-ready components the community trusts
        </Heading>
        <Text className="text-sm text-slate-300">
          Tap into curated AItronics SKUs with Medusa-backed pricing, inventory,
          and instant cart actions.
        </Text>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 medium:grid-cols-2">
        {products.slice(0, 4).map((product) => (
          <FeaturedProductCard
            key={product.id}
            product={product}
            countryCode={countryCode}
          />
        ))}
      </div>
    </section>
  )
}

export default FeaturedProductsSection
