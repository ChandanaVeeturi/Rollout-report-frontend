const MAP = {
  recommended:    { label: '✓ Recommended',    bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: 'rgba(34,197,94,0.25)' },
  worth_watching: { label: '👁 Worth Watching', bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: 'rgba(249,115,22,0.25)' },
  skip_it:        { label: '✗ Skip It',         bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
}

export default function VerdictBadge({ verdict, large }) {
  const v = MAP[verdict] || MAP.recommended
  return (
    <span style={{
      fontSize: large ? 12 : 11, fontWeight: 700,
      padding: large ? '4px 10px' : '3px 8px',
      borderRadius: 6, background: v.bg, color: v.color,
      border: `1px solid ${v.border}`, display: 'inline-block',
    }}>
      {v.label}
    </span>
  )
}
