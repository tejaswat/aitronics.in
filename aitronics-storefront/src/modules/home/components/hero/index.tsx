import { Button, Heading, Text } from "@medusajs/ui"

const heroStats = [
  { label: "Markets live", value: "14" },
  { label: "Avg. conversion lift", value: "38%" },
  { label: "Automation uptime", value: "99.2%" },
]

const heroHighlights = [
  {
    title: "Adaptive merchandising",
    description: "AI-driven collections that shift as demand, sentiment, and signals evolve.",
  },
  {
    title: "Unified intelligence",
    description: "Customer insights, fulfillment health, and growth pulses on one dashboard.",
  },
  {
    title: "Composable checkout",
    description: "Modular flows that mix human-native commerce with secure, frictionless payments.",
  },
]

const Hero = () => {
  return (
    <div className="relative h-[85vh] w-full border-b border-ui-border-base bg-gradient-to-br from-[#030712] via-[#09122a] to-[#0c172f]">
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_52%)]" />
      <div className="relative z-10 flex flex-col gap-8 small:gap-10 justify-center items-center text-center small:px-32 px-6 py-12">
        <Heading
          level="h1"
          className="text-4xl small:text-[42px] leading-tight text-white font-semibold"
        >
          AItronics Cloud Commerce
        </Heading>
        <Heading
          level="h2"
          className="text-lg small:text-xl text-slate-200 font-light max-w-3xl"
        >
          Intelligent automation, composable storefronts, and frictionless checkout
          tuned for retail brands that move faster than traditional stacks allow.
        </Heading>
        <Text className="text-base text-slate-300 max-w-3xl">
          Seamless checkout, unified customer insights, and flexible product
          flows—designed for AItronics brands moving beyond monolithic commerce.
        </Text>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="filled"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-sm uppercase tracking-wide"
            href="/collections"
          >
            Explore the catalog
          </Button>
          <Button
            variant="ghost"
            className="px-8 py-3 rounded-full border border-slate-200 uppercase text-xs tracking-wide"
            href="/about"
          >
            About AItronics
          </Button>
        </div>
        <div className="glass-card flex flex-col gap-6 small:flex-row items-stretch w-full max-w-5xl">
          <div className="flex-1 grid grid-cols-2 small:grid-cols-3 gap-6">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span className="hero-stat-value text-white">{stat.value}</span>
                <Text className="text-[11px] uppercase tracking-[0.4em] text-ui-fg-subtle">
                  {stat.label}
                </Text>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center gap-2 text-left small:max-w-sm">
            <Text className="uppercase tracking-[0.4em] text-xs text-ui-fg-subtle">
              Live intelligence
            </Text>
            <Text className="text-sm text-slate-300">
              Named next-gen commerce OS in the Medusa community spotlight.
            </Text>
            <span className="accent-pill mx-auto small:mx-0">Realtime orchestration</span>
          </div>
        </div>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-4 w-full max-w-5xl">
          {heroHighlights.map((highlight) => (
            <div key={highlight.title} className="highlight-card">
              <Text className="text-[11px] uppercase tracking-[0.4em] text-sky-400">
                Intelligence layer
              </Text>
              <Heading level="h3" className="mt-3 text-xl font-semibold text-white">
                {highlight.title}
              </Heading>
              <Text className="mt-2 text-sm text-slate-300">{highlight.description}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero
