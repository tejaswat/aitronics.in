import { Button, Heading, Text } from "@medusajs/ui"

const CTABanner = () => {
  return (
    <section className="content-container my-16 rounded-[36px] border border-white/10 bg-gradient-to-r from-slate-900 via-[#02050d] to-slate-900 p-8 text-center">
      <Text className="uppercase tracking-[0.4em] text-xs text-ui-fg-subtle">
        Build with Aitronics
      </Text>
      <Heading level="h2" className="mt-2 text-3xl font-semibold text-white">
        Building the future with AI & Electronics
      </Heading>
      <Text className="mt-2 text-sm text-slate-300">
        Gear up for rapid robotics builds with curated AI components and Medusa
        storefront support.
      </Text>
      <div className="mt-6 flex flex-col gap-3 small:flex-row small:justify-center small:gap-4">
        <Button
          variant="filled"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-sm uppercase tracking-wide"
          href="/collections"
        >
          Browse Components
        </Button>
        <Button
          variant="ghost"
          className="px-6 py-3 rounded-full border border-white/20 text-sm uppercase tracking-wide"
          href="/store"
        >
          Start Building
        </Button>
      </div>
    </section>
  )
}

export default CTABanner
