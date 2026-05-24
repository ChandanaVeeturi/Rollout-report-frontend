import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <nav className="nav-root" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(14,14,20,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '0 32px', height: 60,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', flexShrink: 0 }} />
        <span><span style={{ color: 'var(--accent)' }}>Rollout</span> Report</span>
      </Link>

      <form className="nav-search" onSubmit={handleSearch} style={{ flex: 1, maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', height: 36 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search reviews…"
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, width: '100%' }}
          />
        </div>
      </form>

      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
        <NavLink to="/" className="nav-browse">Browse</NavLink>
        {user?.is_admin && <NavLink to="/admin" accent>Admin</NavLink>}
        {user ? (
          <>
            <NavLink to="/bookmarks" className="nav-bookmarks">Bookmarks</NavLink>
            <button onClick={logout} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 14, fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .15s' }}
              onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'var(--surface2)' }}
              onMouseLeave={e => { e.target.style.color = 'var(--muted)'; e.target.style.background = 'none' }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <Link to="/register" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, children, accent, className }) {
  return (
    <Link to={to} className={className} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 14, fontWeight: 500, color: accent ? 'var(--accent)' : 'var(--muted)', transition: 'color .15s, background .15s', display: 'inline-block' }}
      onMouseEnter={e => { e.currentTarget.style.color = accent ? 'var(--accent)' : 'var(--text)'; e.currentTarget.style.background = 'var(--surface2)' }}
      onMouseLeave={e => { e.currentTarget.style.color = accent ? 'var(--accent)' : 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}>
      {children}
    </Link>
  )
}
