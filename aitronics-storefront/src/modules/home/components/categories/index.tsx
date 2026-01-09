import { Text, Heading } from "@medusajs/ui"

import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const gradients = [
  "from-sky-500/70 to-cyan-500/80",
  "from-indigo-500/70 to-sky-500/80",
  "from-emerald-500/70 to-teal-500/80",
  "from-purple-500/70 to-slate-500/80",
  "from-cyan-500/70 to-blue-500/80",
  "from-emerald-400/70 to-lime-400/80",
]

const CategoryCard = ({
  name,
  description,
  handle,
  gradient,
}: {
  name: string
  description?: string
  handle?: string | null
  gradient: string
}) => {
  if (!handle) {
    return null
  }

  return (
    <LocalizedClientLink
      href={`/categories/${handle}`}
      className="group block rounded-[28px] border border-white/10 bg-gradient-to-br p-[1px] transition duration-300 ease-out hover:shadow-[0_20px_40px_rgba(2,6,23,0.65)]"
    >
      <div className="rounded-[27px] bg-ui-surface p-6 h-full flex flex-col gap-3">
        <div
          className={`h-12 w-12 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl text-white shadow-lg shadow-black/40`}
        >
          <span aria-hidden="true">⚡</span>
        </div>
        <Heading level="h3" className="text-lg text-white font-semibold">
          {name}
        </Heading>
        <Text className="text-sm text-ui-fg-subtle line-clamp-3">
          {description ||
            "Curated category powered by Medusa collections and AI-first sourcing."}
        </Text>
      </div>
    </LocalizedClientLink>
  )
}

const HomeCategories = async () => {
  const categories = await listCategories({ limit: 8 })
  const featured = categories.filter((category) => !category.parent_category).slice(0, 6)

  if (!featured.length) {
    return null
  }

  return (
    <section className="content-container py-16" id="categories">
      <div className="flex flex-col gap-2 max-w-3xl">
        <Text className="uppercase tracking-[0.4em] text-xs text-ui-fg-subtle">
          Explore by category
        </Text>
        <Heading level="h2" className="text-3xl font-semibold text-white">
          Hardware tiers for every AItronics build
        </Heading>
        <Text className="text-sm text-slate-300">
          Browse AI modules, robotics kits, sensors, and smart components sourced
          through Medusa collections.
        </Text>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-3">
        {featured.map((category, index) => (
          <CategoryCard
            key={category.id}
            name={category.name || "Category"}
            description={category.description || undefined}
            handle={category.handle}
            gradient={gradients[index % gradients.length]}
          />
        ))}
      </div>
    </section>
  )
}

export default HomeCategories
