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

  const upvoteActive = review.user_has_upvoted

  return (
    <div
      className="rcard"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(124,111,247,0.35)' : 'var(--border)'}`,
        borderRadius: 12, padding: '16px 20px',
        transition: 'border-color .15s, background .15s',
      }}
    >
      {/* rank */}
      <span className="rcard-rank" style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, width: 20, textAlign: 'center', flexShrink: 0 }}>
        {rank}
      </span>

      {/* thumb */}
      <div className="rcard-thumb" style={{
        width: 52, height: 52, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, border: '1px solid var(--border)',
        background: 'var(--surface2)',
      }}>
        {review.category?.icon || '📦'}
      </div>

      {/* body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>
          <Link to={`/reviews/${review.slug}`} style={{ transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}>
            {review.title}
          </Link>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 7 }}>
          {review.tagline}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {review.category && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, color: 'var(--accent)', background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.25)' }}>
              {review.category.name}
            </span>
          )}
          {review.platforms && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              {review.platforms}
            </span>
          )}
          {review.release_date && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              {new Date(review.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* right column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <VerdictBadge verdict={review.verdict} />

        {/* mini upvote — vertical */}
        <UpvoteBox count={review.upvote_count} active={upvoteActive} onClick={handleUpvote} loading={upvoteMut.isPending} />

        {/* comment count */}
        <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {review.comment_count}
        </div>
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
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        background: highlight ? 'rgba(124,111,247,0.1)' : 'var(--surface2)',
        border: `1px solid ${highlight ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
        transition: 'all .15s', minWidth: 52, color: highlight ? 'var(--accent)' : 'var(--text)',
      }}
    >
      <span style={{ fontSize: 12 }}>▲</span>
      <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>{count}</span>
      <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>votes</span>
    </button>
  )
}
