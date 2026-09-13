const MAP = {
  recommended:    { label: '🚀 Ship It',       bg: 'var(--green-bg)',  color: 'var(--green)', border: 'var(--green-border)', cls: 'badge-recommended' },
  worth_watching: { label: '👀 Keep Watching', bg: 'var(--amber-bg)',  color: 'var(--amber)', border: 'var(--amber-border)', cls: 'badge-worth_watching' },
  skip_it:        { label: '☠ Hard Pass',      bg: 'var(--red-bg)',    color: 'var(--red)',   border: 'var(--red-border)',   cls: 'badge-skip_it' },
}

export default function VerdictBadge({ verdict, large, onClick }) {
  const v = MAP[verdict] || MAP.recommended
  return (
    <span
      className={v.cls}
      onClick={onClick}
      style={{
        fontSize: large ? 12 : 11, fontWeight: 700,
        padding: large ? '4px 10px' : '3px 8px',
        borderRadius: 6, background: v.bg, color: v.color,
        border: `1px solid ${v.border}`, display: 'inline-block', whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {v.label}
    </span>
  )
}
