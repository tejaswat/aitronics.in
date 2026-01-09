"use server"

import { addToCart } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { Button, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

export type FeaturedProductCardProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export async function addToCartAction(formData: FormData) {
  const variantId = formData.get("variantId")
  const countryCode = formData.get("countryCode")

  if (typeof variantId !== "string" || typeof countryCode !== "string") {
    return
  }

  await addToCart({
    variantId,
    quantity: 1,
    countryCode,
  })
}

const FeaturedProductCard = ({ product, countryCode }: FeaturedProductCardProps) => {
  const { cheapestPrice } = getProductPrice({ product })
  const variantId =
    product.variants?.find((variant) => !!variant.id && !!variant.calculated_price)
      ?.id || product.variants?.[0]?.id

  return (
    <article className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-[#030712] p-6">
      <LocalizedClientLink href={`/products/${product.handle}`} className="group">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={true}
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <Text className="text-lg font-semibold text-white">{product.title}</Text>
          {cheapestPrice?.calculated_price && (
            <Text className="text-sm font-semibold text-slate-300">
              {cheapestPrice.calculated_price}
            </Text>
          )}
        </div>
      </LocalizedClientLink>
      {variantId && (
        <form action={addToCartAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="variantId" value={variantId} />
          <input type="hidden" name="countryCode" value={countryCode} />
          <Button
            type="submit"
            variant="filled"
            className="px-6 py-2 rounded-full text-xs uppercase tracking-[0.3em] bg-gradient-to-r from-sky-500 to-cyan-400 text-white"
          >
            Add to Cart
          </Button>
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="text-xs uppercase tracking-[0.3em] text-ui-fg-subtle"
          >
            View Product →
          </LocalizedClientLink>
        </form>
      )}
    </article>
  )
}

export default FeaturedProductCard
