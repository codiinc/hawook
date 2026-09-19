interface DataItem {
  label: string
  value: string | number
}

interface DataListProps {
  items: DataItem[]
  columns?: 2 | 3 | 4 | 5
  className?: string
}

export function DataList({ items, columns, className }: DataListProps) {
  return (
    <dl
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns ?? Math.min(items.length, 5)}, 1fr)`,
        gap: 0,
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            padding: 'var(--space-5) var(--space-6) var(--space-5) 0',
          }}
        >
          <dt className="hw-label" style={{ marginBottom: 'var(--space-2)' }}>{item.label}</dt>
          <dd
            className="hw-num"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
