import { Metadata } from "next"

import FeaturedProductsSection from "@modules/home/components/featured-products-section"
import Hero from "@modules/home/components/hero"
import HomeCategories from "@modules/home/components/categories"
import SolutionsSection from "@modules/home/components/solutions"
import WhyChoose from "@modules/home/components/why-choose"
import CTABanner from "@modules/home/components/cta-banner"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "AItronics Storefront",
  description:
    "AItronics delivers intelligent retail experiences with personalized automation, modern commerce flows, and a sleek Next.js interface.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      <Hero />
      <HomeCategories />
      <FeaturedProductsSection countryCode={countryCode} />
      <SolutionsSection />
      <WhyChoose />
      <CTABanner />
    </>
  )
}
