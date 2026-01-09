import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

type Props = {
  countryCode: string
}

export default async function Nav({ countryCode }: Props) {
  const [regions, locales, currentLocale, collectionsResponse] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCollections({ limit: "6" }),
  ])

  const featuredCollections = collectionsResponse?.collections || []

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 flex items-center gap-4">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <form
              action={`/${countryCode}/store`}
              method="get"
              className="hidden items-center gap-2 rounded-full border border-ui-border-base bg-ui-surface px-3 py-1 small:flex"
            >
              <input
                name="q"
                placeholder="Search AItronics catalog"
                className="h-9 w-48 bg-transparent text-xs text-white placeholder:text-ui-fg-muted focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full border border-transparent bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.5em]"
              >
                Search
              </button>
            </form>
            <details className="relative hidden small:block">
              <summary className="cursor-pointer rounded-full border border-ui-border-base px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-ui-fg-base">
                Categories
              </summary>
              <div className="absolute left-0 mt-2 w-56 rounded-[24px] border border-white/10 bg-[#030712] p-4 shadow-2xl shadow-black/30">
                <ul className="flex flex-col gap-3">
                  {featuredCollections.map((collection) => (
                    <li key={collection.id}>
                      <LocalizedClientLink
                        href={`/collections/${collection.handle}`}
                        className="block text-sm text-white hover:text-sky-400"
                      >
                        {collection.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>

          <div className="flex flex-col items-center h-full gap-0">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-base hover:text-ui-fg-base uppercase tracking-[0.35em] md:tracking-[0.25em]"
              data-testid="nav-store-link"
            >
              AItronics
            </LocalizedClientLink>
            <span className="text-[10px] italic tracking-[0.4em] text-ui-fg-subtle uppercase">
              Intelligent retail
            </span>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink className="hover:text-ui-fg-base" href="/collections">
                Solutions
              </LocalizedClientLink>
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                Portal
              </LocalizedClientLink>
            </div>
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
