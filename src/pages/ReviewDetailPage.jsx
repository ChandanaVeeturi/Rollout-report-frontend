import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getReview, getComments, toggleUpvote, toggleBookmark, postComment, deleteComment } from '../api/reviews'
import VerdictBadge from '../components/VerdictBadge'
import { UpvoteBox } from '../components/ReviewCard'
import { useAuth } from '../context/AuthContext'

function CatPill({ children }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 6, padding: '3px 10px' }}>
      {children}
    </span>
  )
}

function CommentItem({ comment, reviewSlug }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const delMut = useMutation({
    mutationFn: () => deleteComment(reviewSlug, comment.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', reviewSlug] })
      qc.invalidateQueries({ queryKey: ['review', reviewSlug] })
    },
  })
  const canDelete = user && (user.id === comment.user.id || user.is_admin) && !comment.is_deleted

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: 'var(--accent)',
      }}>
        {comment.user.display_name[0].toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {comment.user.display_name}
          <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{comment.body}</p>
      </div>
      {canDelete && (
        <button onClick={() => delMut.mutate()} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '0 4px', alignSelf: 'flex-start', transition: 'color .12s' }}
          onMouseEnter={e => e.target.style.color = 'var(--red)'}
          onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
          ✕
        </button>
      )}
    </div>
  )
}

export default function ReviewDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [commentText, setCommentText] = useState('')

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', slug],
    queryFn: () => getReview(slug),
  })

  useEffect(() => {
    if (review) document.title = `${review.title} — The Rollout Report`
    return () => { document.title = 'The Rollout Report' }
  }, [review])

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', slug],
    queryFn: () => getComments(slug),
    enabled: !!review,
  })

  const upvoteMut = useMutation({
    mutationFn: () => toggleUpvote(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review', slug] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
  })

  const bookmarkMut = useMutation({
    mutationFn: () => toggleBookmark(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['review', slug] }),
  })

  const commentMut = useMutation({
    mutationFn: (body) => postComment(slug, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', slug] })
      qc.invalidateQueries({ queryKey: ['review', slug] })
      setCommentText('')
    },
  })

  if (isLoading) return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: 24, borderRadius: 6, background: 'var(--surface)', border: '1.5px solid var(--border)', marginBottom: 12 }} />
      ))}
    </div>
  )

  if (error || !review) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--muted)' }}>Review not found.</div>
  )

  return (
    <div className="detail-root" style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'var(--muted)', marginBottom: 28, transition: 'color .12s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
        ← Back to feed
      </Link>

      {/* product icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 16, marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, background: 'var(--bg)', border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {review.category?.icon || '📦'}
      </div>

      {review.category && (
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
          {review.category.icon} {review.category.name}
        </div>
      )}

      <h1 className="detail-h1" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 8 }}>{review.title}</h1>
      <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 18 }}>{review.tagline}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <VerdictBadge verdict={review.verdict} large />
        {review.platforms && <CatPill>{review.platforms}</CatPill>}
        {review.release_date && <CatPill>Released {new Date(review.release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CatPill>}
        {review.external_url && (
          <a href={review.external_url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
            border: '1.5px solid var(--accent-border)', borderRadius: 6, padding: '3px 10px',
            background: 'var(--accent-soft)', transition: 'background .12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFE5E3'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-soft)'}>
            ↗ Visit Site
          </a>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <UpvoteBox
          count={review.upvote_count}
          active={review.user_has_upvoted}
          onClick={() => { if (!user) { navigate('/login'); return } upvoteMut.mutate() }}
          loading={upvoteMut.isPending}
        />
        <button onClick={() => { if (!user) { navigate('/login'); return } bookmarkMut.mutate() }} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: review.user_has_bookmarked ? 'var(--accent-soft)' : 'var(--surface)',
          border: `1.5px solid ${review.user_has_bookmarked ? 'var(--accent-border)' : 'var(--border)'}`,
          borderRadius: 8, padding: '7px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          color: review.user_has_bookmarked ? 'var(--accent)' : 'var(--text2)',
          transition: 'all .12s',
        }}>
          {review.user_has_bookmarked ? '🔖 Saved' : '🔖 Save'}
        </button>
      </div>

      {review.hero_image_url && (
        <img src={review.hero_image_url} alt={review.title} style={{ width: '100%', borderRadius: 12, marginBottom: 32, objectFit: 'cover', maxHeight: 320, border: '1.5px solid var(--border)' }} />
      )}

      <div className="prose-review" style={{ marginBottom: 40 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{review.body}</ReactMarkdown>
      </div>

      {review.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 48 }}>
          {review.tags.map(t => (
            <span key={t.id} style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 6, background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text2)' }}>
              #{t.name}
            </span>
          ))}
        </div>
      )}

      <div id="comments" style={{ borderTop: '1.5px solid var(--border)', paddingTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>
          Comments <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 14 }}>({review.comment_count})</span>
        </h2>

        {user ? (
          <div style={{ marginBottom: 24 }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share your experience…"
              rows={3}
              style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--text)', resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s', marginBottom: 8 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                disabled={!commentText.trim() || commentMut.isPending}
                onClick={() => commentMut.mutate(commentText)}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: !commentText.trim() ? 0.5 : 1, transition: 'opacity .15s, background .15s' }}
                onMouseEnter={e => { if (commentText.trim()) e.currentTarget.style.background = 'var(--accent-dim)' }}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
                {commentMut.isPending ? '…' : 'Post'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 18px', borderRadius: 8, background: 'var(--surface)', border: '1.5px solid var(--border)', fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link> to leave a comment.
          </div>
        )}

        {comments.length === 0
          ? <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, padding: '32px 0' }}>No comments yet. Be the first.</p>
          : comments.map(c => <CommentItem key={c.id} comment={c} reviewSlug={slug} />)
        }
      </div>
    </div>
  )
}
