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

  if (loading) return null

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Sign in to see your saved reviews.</p>
        <Link to="/login" style={{ background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 80px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 24 }}>
        Saved Reviews
      </h1>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 88, borderRadius: 12, background: 'var(--surface)' }} />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
          <p style={{ marginBottom: 16 }}>No saved reviews yet.</p>
          <Link to="/" style={{ color: 'var(--accent)', fontSize: 14 }}>Browse reviews →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bookmarks.map((r, i) => (
            <ReviewCard key={r.id} review={r} rank={i + 1} />
          ))}
        </div>
      )}

      <footer style={{ borderTop: '1px solid var(--border)', marginTop: 48, padding: '28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}>
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
