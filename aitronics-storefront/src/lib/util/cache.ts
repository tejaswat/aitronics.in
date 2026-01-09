"use server"

import { revalidateTag } from "next/cache"

import { getCacheTag } from "@lib/data/cookies"

export async function revalidateCacheTag(tag: string) {
  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return
  }

  revalidateTag(cacheTag)
}
