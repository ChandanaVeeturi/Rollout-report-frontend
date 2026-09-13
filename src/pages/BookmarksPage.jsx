import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookmarks } from '../api/reviews'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'

export default function BookmarksPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!user,
  })

  if (loading) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 80px' }}>
        <div className="skeleton" style={{ height: 28, width: 180, marginBottom: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12, opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Your reading list is empty</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>Sign in to save reviews and read them later.</p>
        <Link to="/login" state={{ from: '/bookmarks' }} style={{ background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px' }}>
          🔖 Saved Reviews
          {bookmarks.length > 0 && (
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', marginLeft: 10 }}>
              {bookmarks.length} saved
            </span>
          )}
        </h1>
        <Link to="/" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
          Browse more →
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12, opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ color: 'var(--text2)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Your reading list is empty
          </p>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            Hit the 🔖 Save button on any review to stash it here for later.
          </p>
          <Link to="/" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
            Find something worth saving →
          </Link>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {bookmarks.map((r, i) => (
            <ReviewCard key={r.id} review={r} rank={i + 1} />
          ))}
        </div>
      )}

      <footer style={{ borderTop: '1px solid var(--border)', marginTop: 48, padding: '28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text2)' }}>
          <span style={{ color: 'var(--accent)' }}>Rollout</span> Report
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          Made with ❤️ by{' '}
          <a href="https://www.chandanaveeturi.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            Chandana Veeturi
          </a>
          {' '}from India 🇮🇳
        </span>
      </footer>
    </div>
  )
}
