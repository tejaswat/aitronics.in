import { Text, Heading } from "@medusajs/ui"
import {
  Robot,
  Bolt,
  Sparkles,
  ShieldCheck,
} from "@medusajs/icons"

const solutions = [
  {
    title: "AI Robotics Solutions",
    description:
      "Prebuilt automation stacks with edge compute, sensors, and robotics arms that tie directly into your Medusa storefront.",
    icon: <Robot className="h-6 w-6 text-cyan-400" />,
  },
  {
    title: "Smart Automation",
    description:
      "Connective frameworks for AI-driven workflows, predictive maintenance, and adaptive merchandising.",
    icon: <Bolt className="h-6 w-6 text-emerald-400" />,
  },
  {
    title: "IoT Systems",
    description:
      "Secure, scalable IoT nodes with sensor fusion and Medusa-ready sync to power telemetry-driven commerce.",
    icon: <Sparkles className="h-6 w-6 text-sky-400" />,
  },
  {
    title: "Educational Kits",
    description:
      "Modular robotics labs for universities and makers, complete with AI, controls, and cloud-ready analytics.",
    icon: <ShieldCheck className="h-6 w-6 text-indigo-400" />,
  },
]

const SolutionsSection = () => {
  return (
    <section className="bg-white/5 border-y border-white/10 py-16" id="solutions">
      <div className="content-container">
        <div className="flex flex-col gap-2 max-w-3xl">
          <Text className="uppercase tracking-[0.4em] text-xs text-ui-fg-subtle">
            Solutions
          </Text>
          <Heading level="h2" className="text-3xl font-semibold text-white">
            Engineered use cases for AItronics customers
          </Heading>
          <Text className="text-sm text-slate-300">
            From prototyping boards to full robotics fleets, each pack is curated
            for resilience, verified modules, and Medusa-grade integration.
          </Text>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-4">
          {solutions.map((solution) => (
            <article
              key={solution.title}
              className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[#02050d] p-6"
            >
              <div className="w-fit rounded-3xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/40">
                {solution.icon}
              </div>
              <Heading level="h3" className="text-xl font-semibold text-white">
                {solution.title}
              </Heading>
              <Text className="text-sm text-slate-300">{solution.description}</Text>
              <span className="text-xs uppercase tracking-[0.4em] text-ui-fg-subtle">
                Learn More →
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolutionsSection
