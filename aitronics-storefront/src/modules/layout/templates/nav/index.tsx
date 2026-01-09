import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

type Props = {
  countryCode: string
}

export default async function Nav({ countryCode }: Props) {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories({ limit: 12 }),
  ])

  const menuCategories = categories.slice(0, 4)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular gap-4">
          <div className="flex items-center gap-3">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-base hover:text-ui-fg-base uppercase tracking-[0.35em]"
              data-testid="nav-store-link"
            >
              ai
            </LocalizedClientLink>
          </div>

          <div className="flex-1 flex justify-center px-4">
            <form
              action={`/${countryCode}/store`}
              method="get"
              className="flex w-full max-w-3xl items-stretch gap-2"
            >
              <select
                name="categoryId"
                className="min-w-[125px] rounded-full border border-ui-border-base bg-white px-3 text-xs uppercase tracking-[0.2em] text-ui-fg-base focus:border-ui-border-brand focus:outline-none focus:ring-1 focus:ring-ui-border-brand"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                name="q"
                placeholder="Search intelligent retail"
                className="flex-1 rounded-full border border-ui-border-base bg-white px-3 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus:border-ui-border-brand focus:outline-none focus:ring-1 focus:ring-ui-border-brand"
              />
              <button
                type="submit"
                className="rounded-full border border-transparent bg-gradient-to-r from-sky-500 to-cyan-500 px-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-white transition hover:from-sky-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-x-6">
            <div className="hidden small:flex items-center gap-6">
              {menuCategories.map((category) => (
                <LocalizedClientLink
                  key={category.id}
                  className="hover:text-ui-fg-base"
                  href={`/categories/${category.handle ?? category.id}`}
                >
                  {category.name}
                </LocalizedClientLink>
              ))}
            </div>
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account"
              data-testid="nav-account-link"
            >
              Portal
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
