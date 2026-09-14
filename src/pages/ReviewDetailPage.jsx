import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getReview, getReviews, getComments, toggleUpvote, toggleBookmark, postComment, editComment, deleteComment } from '../api/reviews'
import VerdictBadge from '../components/VerdictBadge'
import ReviewCard, { UpvoteBox } from '../components/ReviewCard'
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
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.body)

  const delMut = useMutation({
    mutationFn: () => deleteComment(reviewSlug, comment.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', reviewSlug] })
      qc.invalidateQueries({ queryKey: ['review', reviewSlug] })
    },
  })

  const editMut = useMutation({
    mutationFn: () => editComment(reviewSlug, comment.id, editText),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', reviewSlug] })
      setEditing(false)
    },
  })

  const canDelete = user && (user.id === comment.user.id || user.is_admin) && !comment.is_deleted
  const withinEditWindow = user && user.id === comment.user.id && !comment.is_deleted &&
    (Date.now() - new Date(comment.created_at).getTime()) < 15 * 60 * 1000

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: 'var(--accent)',
      }}>
        {comment.user.display_name[0].toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {comment.user.display_name}
          <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 8 }} title={new Date(comment.created_at).toISOString()}>
            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {comment.updated_at !== comment.created_at && !comment.is_deleted && (
            <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11, marginLeft: 6 }}>(edited)</span>
          )}
        </div>

        {editing ? (
          <div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--accent)', borderRadius: 8, padding: '8px 10px', fontSize: 14, color: 'var(--text)', resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => editMut.mutate()}
                disabled={editMut.isPending || !editText.trim()}
                style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', opacity: editMut.isPending ? 0.6 : 1 }}
              >
                {editMut.isPending ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setEditText(comment.body) }}
                style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: comment.is_deleted ? 'var(--muted)' : 'var(--text2)', lineHeight: 1.6, fontStyle: comment.is_deleted ? 'italic' : 'normal' }}>
            {comment.body}
          </p>
        )}
      </div>

      {!editing && (
        <div style={{ display: 'flex', gap: 4, alignSelf: 'flex-start', flexShrink: 0 }}>
          {withinEditWindow && (
            <button onClick={() => setEditing(true)}
              style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: '2px 6px', borderRadius: 4, transition: 'color .12s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text2)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => delMut.mutate()}
              style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '0 4px', transition: 'color .12s' }}
              onMouseEnter={e => e.target.style.color = 'var(--red)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
              ✕
            </button>
          )}
        </div>
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
  const [commentPosted, setCommentPosted] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const verdictRef = useRef(null)

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', slug],
    queryFn: () => getReview(slug),
  })

  // OG meta tags + page title
  useEffect(() => {
    if (!review) return
    document.title = `${review.title} — Rollout Report`

    const setMeta = (attr, attrVal, content) => {
      let el = document.querySelector(`meta[${attr}="${attrVal}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, attrVal); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    const url = window.location.href
    setMeta('property', 'og:title',       `${review.title} — Rollout Report`)
    setMeta('property', 'og:description', review.tagline)
    setMeta('property', 'og:url',         url)
    setMeta('property', 'og:type',        'article')
    if (review.hero_image_url) setMeta('property', 'og:image', review.hero_image_url)
    setMeta('name', 'twitter:title',       `${review.title} — Rollout Report`)
    setMeta('name', 'twitter:description', review.tagline)
    setMeta('name', 'twitter:card',        review.hero_image_url ? 'summary_large_image' : 'summary')

    return () => {
      document.title = 'The Rollout Report'
      ;['og:title','og:description','og:url','og:type','og:image'].forEach(p => {
        const el = document.querySelector(`meta[property="${p}"]`)
        if (el) el.setAttribute('content', '')
      })
    }
  }, [review])

  // Sticky verdict: show when verdict row scrolls out of view
  useEffect(() => {
    const el = verdictRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [review])

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', slug],
    queryFn: () => getComments(slug),
    enabled: !!review,
  })

  // Related reviews: same category
  const { data: relatedData } = useQuery({
    queryKey: ['reviews', { category: review?.category?.slug, per_page: 4 }],
    queryFn: () => getReviews({ category: review?.category?.slug, per_page: 4 }),
    enabled: !!review?.category?.slug,
  })
  const related = (relatedData?.items || []).filter(r => r.slug !== slug).slice(0, 3)

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
      setCommentPosted(true)
      setTimeout(() => setCommentPosted(false), 2000)
    },
  })

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 1800)
    })
  }

  if (isLoading) return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      {[28, 16, 16, 12, 12].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 6, marginBottom: 14, width: i === 0 ? '70%' : i === 1 ? '90%' : '80%' }} />
      ))}
    </div>
  )

  if (error || !review) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>404 — Review not found</h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
        This review got lost in the changelog. Here's what's actually shipping →
      </p>
      <Link to="/" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)', borderRadius: 8, padding: '9px 20px' }}>
        Back to the feed
      </Link>
    </div>
  )

  return (
    <div className="detail-root" style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>

      {/* Sticky verdict pill */}
      {showSticky && (
        <div className="sticky-verdict" style={{
          position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, pointerEvents: 'none',
        }}>
          <VerdictBadge verdict={review.verdict} large />
        </div>
      )}

      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'var(--muted)', marginBottom: 28, transition: 'color .12s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
        ← Back to feed
      </Link>

      {/* Product icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 16, marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, background: 'var(--bg)', border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
      }}>
        {review.hero_image_url
          ? <img src={review.hero_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : review.category?.icon || '📦'}
      </div>

      {review.category && (
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
          {review.category.icon} {review.category.name}
        </div>
      )}

      {/* Title + copy link */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <h1 className="detail-h1" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.2, flex: 1 }}>
          {review.title}
        </h1>
        <div style={{ position: 'relative', flexShrink: 0, marginTop: 6 }}>
          <button onClick={copyLink} title="Copy link" style={{
            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)', border: '1.5px solid var(--border)', cursor: 'pointer', fontSize: 14,
            transition: 'border-color .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            🔗
          </button>
          {linkCopied && (
            <span className="copy-tooltip" style={{
              position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)',
              fontSize: 11, fontWeight: 600, color: '#fff', background: 'var(--text)',
              borderRadius: 5, padding: '3px 8px', whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>
              Copied!
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 18 }}>{review.tagline}</p>

      {/* Verdict + meta pills — this row is watched for sticky */}
      <div ref={verdictRef} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <VerdictBadge verdict={review.verdict} large />
        {review.release_date && <CatPill>Released {new Date(review.release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CatPill>}
        {review.external_url && (
          <a href={review.external_url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
            border: '1.5px solid var(--accent-border)', borderRadius: 6, padding: '3px 10px',
            background: 'var(--accent-soft)', transition: 'background .12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-soft)'}>
            ↗ Visit Site
          </a>
        )}
      </div>

      {/* Upvote + bookmark row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        <UpvoteBox
          count={review.upvote_count}
          active={review.user_has_upvoted}
          onClick={() => { if (!user) { navigate('/login', { state: { from: `/reviews/${slug}` } }); return } upvoteMut.mutate() }}
          loading={upvoteMut.isPending}
        />
        <BookmarkBtn
          active={review.user_has_bookmarked}
          onClick={() => { if (!user) { navigate('/login', { state: { from: `/reviews/${slug}` } }); return } bookmarkMut.mutate() }}
          loading={bookmarkMut.isPending}
        />
      </div>

      {/* Hero image */}
      {review.hero_image_url && (
        <img src={review.hero_image_url} alt={review.title} style={{ width: '100%', borderRadius: 12, marginBottom: 32, objectFit: 'cover', maxHeight: 320, border: '1.5px solid var(--border)' }} />
      )}

      {/* Markdown body */}
      <div className="prose-review" style={{ marginBottom: 40 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{review.body}</ReactMarkdown>
      </div>

      {/* Clickable tags */}
      {review.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 48 }}>
          {review.tags.map(t => (
            <button
              key={t.id}
              onClick={() => navigate(`/?tag=${encodeURIComponent(t.slug)}`)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
                background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text2)',
                cursor: 'pointer', transition: 'border-color .12s, color .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
              title={`Browse all #${t.name} reviews`}
            >
              #{t.name}
            </button>
          ))}
        </div>
      )}

      {/* Comments */}
      <div id="comments" style={{ borderTop: '1.5px solid var(--border)', paddingTop: 32, marginBottom: 48 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>
          Comments{' '}
          <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 14 }}>({review.comment_count})</span>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
              {commentPosted && (
                <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>✓ Posted!</span>
              )}
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
            <Link to="/login" state={{ from: `/reviews/${slug}` }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
            {' '}to join the conversation.
          </div>
        )}

        {comments.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 14 }}>
              This comment section is lonely. Be the first to drop a take.
            </div>
          )
          : comments.map(c => <CommentItem key={c.id} comment={c} reviewSlug={slug} />)
        }
      </div>

      {/* Related reviews */}
      {related.length > 0 && (
        <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
            More in {review.category?.icon} {review.category?.name}
          </h2>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {related.map((r, i) => (
              <ReviewCard key={r.id} review={r} rank={i + 1} />
            ))}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Link to={`/?category=${review.category?.slug}`} style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
              See all {review.category?.name} reviews →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function BookmarkBtn({ active, onClick, loading }) {
  const [pop, setPop] = useState(false)

  function handle() {
    setPop(true)
    onClick()
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      onAnimationEnd={() => setPop(false)}
      className={pop ? 'bookmark-bounce' : ''}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: active ? 'var(--accent-soft)' : 'var(--surface)',
        border: `1.5px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: 8, padding: '7px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        color: active ? 'var(--accent)' : 'var(--text2)',
        transition: 'all .12s',
      }}>
      {active ? '🔖 Saved' : '🔖 Save'}
    </button>
  )
}
