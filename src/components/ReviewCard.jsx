import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleUpvote, toggleBookmark } from '../api/reviews'
import { useAuth } from '../context/AuthContext'
import VerdictBadge from './VerdictBadge'

export default function ReviewCard({ review, rank }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [hovered, setHovered] = useState(false)

  const upvoteMut = useMutation({
    mutationFn: () => toggleUpvote(review.slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  })

  function handleUpvote(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    upvoteMut.mutate()
  }

  return (
    <div
      className="rcard"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 20px',
        transition: 'background .12s',
      }}
    >
      <span className="rcard-rank" style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, width: 18, textAlign: 'center', flexShrink: 0 }}>
        {rank}
      </span>

      <div className="rcard-thumb" style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, border: '1.5px solid var(--border)',
        background: 'var(--bg)', overflow: 'hidden',
      }}>
        {review.category?.icon || '📦'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
          <Link to={`/reviews/${review.slug}`}
            style={{ color: 'var(--text)', transition: 'color .12s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}>
            {review.title}
          </Link>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 7 }}>
          {review.tagline}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {review.category && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)' }}>
              {review.category.name}
            </span>
          )}
          {review.platforms && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5, background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--muted)' }}>
              {review.platforms}
            </span>
          )}
          {review.release_date && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5, background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--muted)' }}>
              {new Date(review.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <VerdictBadge verdict={review.verdict} />

        <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {review.comment_count}
        </div>

        <UpvoteBox count={review.upvote_count} active={review.user_has_upvoted} onClick={handleUpvote} loading={upvoteMut.isPending} />
      </div>
    </div>
  )
}

export function UpvoteBox({ count, active, onClick, loading }) {
  const [hov, setHov] = useState(false)
  const highlight = active || hov
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        minWidth: 52, padding: '7px 10px', borderRadius: 10,
        background: active ? 'var(--accent)' : highlight ? 'var(--accent-soft)' : 'var(--surface)',
        border: `1.5px solid ${highlight ? 'var(--accent)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all .15s',
      }}
    >
      <span style={{ fontSize: 12, color: active ? '#fff' : highlight ? 'var(--accent)' : 'var(--muted)', lineHeight: 1, transition: 'color .15s' }}>▲</span>
      <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1, color: active ? '#fff' : highlight ? 'var(--accent)' : 'var(--text)', transition: 'color .15s' }}>{count}</span>
    </button>
  )
}
