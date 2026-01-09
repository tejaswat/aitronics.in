import { Button, Heading, Text } from "@medusajs/ui"

const highlights = [
  {
    title: "Connected intelligence",
    description:
      "Metrics, signals, and customer journeys flow through one graph so your teams ratchet decisions with clarity.",
    detail: "Unified customer & commerce data",
  },
  {
    title: "Composable operations",
    description:
      "Build modular fulfillment, segmentation, and payment flows that swap in and out without costly rip-and-replace work.",
    detail: "Medusa-aware architecture",
  },
  {
    title: "Human-first experiences",
    description:
      "Localized storefronts, flexible checkout, and rich personalization replace friction with delight for every shopper.",
    detail: "Global-ready, accessible",
  },
]

const HomeHighlights = () => {
  return (
    <section className="content-container py-16">
      <div className="mx-auto max-w-4xl text-center space-y-4">
        <Text className="uppercase tracking-[0.4em] text-xs text-ui-fg-subtle">
          AItronics storefront
        </Text>
        <Heading level="h2" className="text-3xl font-semibold text-white">
          Intelligent retail delivered with Medusa-grade reliability
        </Heading>
        <Text className="text-sm text-slate-300">
          The Medusa Next.js starter provides the foundation. AItronics layers on data, automation,
          and modular UI so explorers and engineers can move as one.
        </Text>
        <div>
          <Button
            variant="filled"
            className="px-6 py-3 rounded-full text-sm uppercase tracking-wide bg-gradient-to-r from-sky-500 to-cyan-400"
            href="/contact"
          >
            Book a walkthrough
          </Button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 small:grid-cols-3">
        {highlights.map((highlight) => (
          <div key={highlight.title} className="highlight-card">
            <Text className="text-xs uppercase tracking-[0.4em] text-ui-fg-subtle">
              {highlight.detail}
            </Text>
            <Heading level="h3" className="mt-3 text-xl font-semibold text-white">
              {highlight.title}
            </Heading>
            <Text className="mt-2 text-sm text-slate-300">{highlight.description}</Text>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HomeHighlights
