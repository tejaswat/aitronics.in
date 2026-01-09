import { Text, Heading } from "@medusajs/ui"
import { ShieldCheck, Bolt, RocketLaunch, Sparkles } from "@medusajs/icons"

const highlights = [
  {
    title: "High-quality components",
    description:
      "Sourced from trusted vendors, validated for robotics and AI workloads.",
    icon: <Sparkles className="h-5 w-5 text-sky-400" />,
  },
  {
    title: "AI-focused engineering",
    description: "Built with inference-ready modules, sensor fusion, and secure telemetry.",
    icon: <Bolt className="h-5 w-5 text-emerald-400" />,
  },
  {
    title: "Verified modules",
    description: "Each SKU ships with diagnostics, firmware, and QA that integrates with Medusa.",
    icon: <RocketLaunch className="h-5 w-5 text-indigo-400" />,
  },
  {
    title: "Developer & startup friendly",
    description: "Documentation, support, and fast shipping to get you prototyping quickly.",
    icon: <ShieldCheck className="h-5 w-5 text-cyan-400" />,
  },
]

const WhyChoose = () => {
  return (
    <section className="content-container py-16" id="why-choose">
      <div className="max-w-3xl">
        <Text className="uppercase tracking-[0.4em] text-xs text-ui-fg-subtle">
          Why Aitronics
        </Text>
        <Heading level="h2" className="text-3xl font-semibold text-white">
          Modern commerce, traditional trust
        </Heading>
        <Text className="text-sm text-slate-300">
          Aitronics blends engineering rigor with modern digital storefronts tuned
          for MedusaJS.
        </Text>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 small:grid-cols-2">
        {highlights.map((highlight) => (
          <article
            key={highlight.title}
            className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[#05050c] p-6"
          >
            <div className="h-10 w-10 rounded-3xl border border-white/10 bg-ui-bg-subtle flex items-center justify-center">
              {highlight.icon}
            </div>
            <Heading level="h3" className="text-xl font-semibold text-white">
              {highlight.title}
            </Heading>
            <Text className="text-sm text-slate-300">{highlight.description}</Text>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WhyChoose
