const MAP = {
  recommended:    { label: '✓ Recommended',    bg: 'var(--green-bg)',  color: 'var(--green)', border: 'var(--green-border)' },
  worth_watching: { label: '👁 Worth Watching', bg: 'var(--amber-bg)',  color: 'var(--amber)', border: 'var(--amber-border)' },
  skip_it:        { label: '✗ Skip It',         bg: 'var(--red-bg)',    color: 'var(--red)',   border: 'var(--red-border)'   },
}

export default function VerdictBadge({ verdict, large }) {
  const v = MAP[verdict] || MAP.recommended
  return (
    <span style={{
      fontSize: large ? 12 : 11, fontWeight: 700,
      padding: large ? '4px 10px' : '3px 8px',
      borderRadius: 6, background: v.bg, color: v.color,
      border: `1px solid ${v.border}`, display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {v.label}
    </span>
  )
}
