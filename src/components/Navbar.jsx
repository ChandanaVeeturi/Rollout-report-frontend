import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <nav className="nav-root" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '0 24px', height: 56,
    }}>
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: 9,
        fontSize: 16, fontWeight: 800, letterSpacing: '-0.4px', whiteSpace: 'nowrap',
        marginRight: 24, flexShrink: 0,
      }}>
        <span style={{
          width: 30, height: 30, background: 'var(--accent)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0,
        }}>🚀</span>
        <span><span style={{ color: 'var(--accent)' }}>Rollout</span> Report</span>
      </Link>

      <form className="nav-search" onSubmit={handleSearch}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg)',
          border: `1.5px solid ${searchFocus ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8, padding: '0 12px', height: 36,
          width: 240, transition: 'border-color .15s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Search reviews…"
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, width: '100%', fontFamily: 'var(--font)' }}
          />
        </div>
      </form>

      <div style={{ display: 'flex', gap: 2, marginLeft: 12, alignItems: 'center' }}>
        <NavLink to="/" className="nav-browse">Launches</NavLink>
        <NavLink to="/" className="nav-browse">Topics</NavLink>
        {user?.is_admin && <NavLink to="/admin">Admin</NavLink>}
      </div>

      <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', alignItems: 'center' }}>
        {user ? (
          <>
            <NavLink to="/bookmarks" className="nav-bookmarks">Bookmarks</NavLink>
            <GhostBtn onClick={logout}>Sign out</GhostBtn>
          </>
        ) : (
          <>
            <GhostBtn onClick={() => navigate('/login')}>Sign in</GhostBtn>
            <Link to="/register" style={{
              background: 'var(--accent)', color: '#fff', borderRadius: 8,
              padding: '7px 16px', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5,
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              + Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, children, className }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link to={to} className={className} style={{
      padding: '6px 12px', borderRadius: 7, fontSize: 14, fontWeight: 500,
      transition: 'color .15s, background .15s', display: 'inline-block',
      color: active ? 'var(--accent)' : 'var(--text2)',
      background: active ? 'var(--accent-soft)' : 'transparent',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg)' }}
      onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--accent)' : 'var(--text2)'; e.currentTarget.style.background = active ? 'var(--accent-soft)' : 'transparent' }}>
      {children}
    </Link>
  )
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: '1.5px solid var(--border)', borderRadius: 8,
      padding: '6px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
      color: 'var(--text2)', transition: 'all .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
      {children}
    </button>
  )
}
