import { Text } from "@medusajs/ui"
import Image from "next/image"

const MedusaCTA = () => {
  return (
    <Text className="flex items-center gap-2 txt-compact-small-plus">
      Powered by
      <a
        href="https://truedatasoft.com"
        target="_blank"
        rel="noreferrer"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 p-1 shadow-[0_10px_25px_rgba(0,0,0,0.4)] transition hover:bg-white/10"
      >
        <Image
          src="https://truedatasoft.com/favicon.ico"
          alt="TrueData Soft"
          width={24}
          height={24}
          className="h-full w-full object-contain"
        />
      </a>
      &
      <a
        href="https://azranta.com"
        target="_blank"
        rel="noreferrer"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 p-1 shadow-[0_10px_25px_rgba(0,0,0,0.4)] transition hover:bg-white/10"
      >
        <Image
          src="https://azranta.com/favicon.ico"
          alt="Azranta"
          width={24}
          height={24}
          className="h-full w-full object-contain"
        />
      </a>
    </Text>
  )
}

export default MedusaCTA
