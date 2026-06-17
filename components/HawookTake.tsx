type Props = {
  take: string | null | undefined
}

export default function HawookTake({ take }: Props) {
  if (!take) return null

  const paragraphs = take.split('\n\n').filter(Boolean)

  return (
    <div className="mb-10 bg-cream rounded-lg p-6 border-l-4 border-teal">
      <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-4">Hawook&apos;s Take</p>
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-gray-700 leading-relaxed text-sm sm:text-base">{para}</p>
        ))}
      </div>
    </div>
  )
}
