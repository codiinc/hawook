type Props = {
  badge: string | null | undefined
}

export default function HawookBadge({ badge }: Props) {
  if (!badge) return null

  if (badge === 'top_pick') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold font-serif text-white bg-teal px-2.5 py-1 rounded-full">
        ✦ Hawook Top Pick
      </span>
    )
  }

  if (badge === 'recommended') {
    return (
      <span className="inline-flex items-center text-xs font-semibold font-serif text-teal bg-teal-light px-2.5 py-1 rounded-full border border-teal/20">
        Hawook Recommended
      </span>
    )
  }

  return null
}
