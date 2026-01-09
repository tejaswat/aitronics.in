import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

const quickLinks = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Newsroom", href: "/newsroom" },
  { label: "AI Lab", href: "/ai-lab" },
]

const supportLinks = [
  { label: "Docs", href: "/docs" },
  { label: "Partners", href: "/partners" },
  { label: "Consulting", href: "/consulting" },
  { label: "Contact", href: "/contact" },
]

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-ui-border-base w-full bg-[#02050d] text-slate-200">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-8 py-16 small:flex-row small:items-start small:justify-between">
          <div className="max-w-sm space-y-3">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-white hover:text-sky-400 uppercase"
            >
              AItronics
            </LocalizedClientLink>
            <p className="txt-small text-ui-fg-subtle">
              Precision automation for merchants who want commerce backed by
              adaptive intelligence, transparent data, and human-centered design.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            {productCategories && productCategories.length > 0 && (
              <div className="space-y-2">
                <span className="txt-small-plus uppercase text-ui-fg-base">
                  Categories
                </span>
                <ul className="space-y-1">
                  {productCategories
                    .filter((c) => !c.parent_category)
                    .slice(0, 6)
                    .map((category) => (
                      <li key={category.id}>
                        <LocalizedClientLink
                          className="hover:text-white block text-ui-fg-subtle"
                          href={`/categories/${category.handle}`}
                        >
                          {category.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {collections && collections.length > 0 && (
              <div className="space-y-2">
                <span className="txt-small-plus uppercase text-ui-fg-base">
                  Collections
                </span>
                <ul className="space-y-1">
                  {collections.slice(0, 6).map((collection) => (
                    <li key={collection.id}>
                      <LocalizedClientLink
                        className="hover:text-white block text-ui-fg-subtle"
                        href={`/collections/${collection.handle}`}
                      >
                        {collection.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <span className="txt-small-plus uppercase text-ui-fg-base">
                Company
              </span>
              <ul className="space-y-1">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className="hover:text-white block text-ui-fg-subtle"
                      href={link.href}
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="txt-small-plus uppercase text-ui-fg-base">
                Support
              </span>
              <ul className="space-y-1">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className="hover:text-white block text-ui-fg-subtle"
                      href={link.href}
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted items-center">
          <Text className="txt-compact-small text-ui-fg-subtle">
            © {new Date().getFullYear()} AItronics. All rights reserved.
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
