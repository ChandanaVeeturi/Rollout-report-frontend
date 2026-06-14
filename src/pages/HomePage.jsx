import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReviews, getCategories, toggleUpvote } from '../api/reviews'
import ReviewCard, { UpvoteBox } from '../components/ReviewCard'
import VerdictBadge from '../components/VerdictBadge'
import { useAuth } from '../context/AuthContext'

const SORTS = [
  { key: 'recent',   label: 'Most Recent' },
  { key: 'popular',  label: 'Top Voted' },
  { key: 'trending', label: 'Trending' },
]

function HeroCard({ review }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const upvoteMut = useMutation({
    mutationFn: () => toggleUpvote(review.slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  })

  return (
    <div className="hero-card" style={{
      margin: '24px 0 16px',
      background: 'var(--surface)',
      border: '1.5px solid var(--border)', borderRadius: 16,
      padding: '28px 28px 24px', display: 'flex', gap: 24, alignItems: 'flex-start',
      position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .15s',
    }}>
      <div style={{
        position: 'absolute', top: 14, right: 16,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
        color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
        borderRadius: 5, padding: '3px 8px',
      }}>
        ⚡ Review of the Day
      </div>

      {/* icon */}
      <div style={{
        width: 76, height: 76, borderRadius: 18, flexShrink: 0,
        border: '1.5px solid var(--border)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38, background: '#F0F0F0',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {review.hero_image_url
          ? <img src={review.hero_image_url} alt={review.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{review.category?.icon || '📦'}</span>
        }
      </div>

      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        {review.category && (
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
            {review.category.icon} {review.category.name}
          </div>
        )}
        <h1 className="hero-title" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 6 }}>
          <Link to={`/reviews/${review.slug}`} style={{ color: 'var(--text)', transition: 'color .12s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}>
            {review.title}
          </Link>
        </h1>
        <p className="hero-tagline" style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 14, maxWidth: 520, lineHeight: 1.6 }}>
          {review.tagline}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <VerdictBadge verdict={review.verdict} large />
          {review.platforms && <CatPill>{review.platforms}</CatPill>}
          {review.release_date && <CatPill>Released {new Date(review.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</CatPill>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UpvoteBox
            count={review.upvote_count}
            active={review.user_has_upvoted}
            onClick={() => { if (!user) { navigate('/login'); return } upvoteMut.mutate() }}
            loading={upvoteMut.isPending}
          />
          <Link to={`/reviews/${review.slug}`} style={{
            fontSize: 14, fontWeight: 600, color: 'var(--accent)', padding: '8px 18px',
            border: '1.5px solid var(--accent-border)', borderRadius: 8, background: 'var(--accent-soft)',
            transition: 'background .12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFE5E3'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-soft)'}>
            Read Full Review →
          </Link>
          {review.comment_count > 0 && (
            <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {review.comment_count} comments
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function CatPill({ children }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 6, padding: '3px 10px' }}>
      {children}
    </span>
  )
}

function SidebarCard({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--muted)', marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  )
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sort     = searchParams.get('sort') || 'recent'
  const category = searchParams.get('category') || ''
  const verdict  = searchParams.get('verdict') || ''
  const q        = searchParams.get('q') || ''
  const page     = parseInt(searchParams.get('page') || '1')

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', { sort, category, verdict, q, page }],
    queryFn: () => getReviews({ sort, category: category || undefined, verdict: verdict || undefined, q: q || undefined, page }),
  })

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  function setParam(key, value) {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const pinned   = data?.items?.find(r => r.is_pinned) || data?.items?.[0]
  const showHero = !q && sort === 'recent' && page === 1 && pinned

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
      {showHero && <HeroCard review={pinned} />}

      {/* tabs + filters row */}
      <div style={{ borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {SORTS.map(s => (
            <button key={s.key} onClick={() => setParam('sort', s.key)} style={{
              padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              border: 'none', borderBottom: `2px solid ${sort === s.key ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -2, background: 'transparent',
              color: sort === s.key ? 'var(--accent)' : 'var(--muted)',
              transition: 'color .12s, border-color .12s',
            }}>
              {s.label}
            </button>
          ))}
        </div>
        {(verdict || category || q) && (
          <button onClick={() => { setParam('verdict', ''); setParam('category', ''); setParam('q', '') }}
            style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            Clear filters ×
          </button>
        )}
      </div>

      {/* content grid */}
      <div className="home-grid" style={{ marginTop: 12 }}>

        {/* feed */}
        <div>
          {isLoading ? (
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 84, borderBottom: '1px solid var(--border)', background: 'var(--surface)', opacity: 1 - i * 0.12 }} />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>No reviews yet.</div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {data.items.map((r, i) => (
                <ReviewCard key={r.id} review={r} rank={i + 1 + (page - 1) * 20} />
              ))}
            </div>
          )}

          {/* pagination */}
          {data?.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '20px 0' }}>
              {[...Array(data.pages)].map((_, i) => (
                <button key={i} onClick={() => setParam('page', String(i + 1))} style={{
                  width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: page === i + 1 ? 'var(--accent)' : 'var(--surface)',
                  border: `1.5px solid ${page === i + 1 ? 'var(--accent)' : 'var(--border)'}`,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  color: page === i + 1 ? '#fff' : 'var(--text2)',
                  transition: 'all .12s',
                }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="home-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <SidebarCard title="Topics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <CatItem label="All" active={!category} onClick={() => setParam('category', '')} />
              {categories.map(c => (
                <CatItem key={c.id} label={`${c.icon} ${c.name}`} active={category === c.slug} onClick={() => setParam('category', c.slug)} />
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title="Filter by Verdict">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['recommended', 'worth_watching', 'skip_it'].map(v => (
                <button key={v} onClick={() => setParam('verdict', verdict === v ? '' : v)} style={{
                  textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                  opacity: verdict && verdict !== v ? 0.4 : 1, transition: 'opacity .12s',
                }}>
                  <VerdictBadge verdict={v} large />
                </button>
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title="Verdict Guide">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {[
                { v: 'recommended',    desc: 'Use it now, worth the switch.' },
                { v: 'worth_watching', desc: 'Promising, not daily-driver ready.' },
                { v: 'skip_it',        desc: 'Wait for the next version.' },
              ].map(({ v, desc }) => (
                <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <VerdictBadge verdict={v} />
                  <span style={{ color: 'var(--text2)', fontSize: 12 }}>{desc}</span>
                </div>
              ))}
            </div>
          </SidebarCard>

        </aside>
      </div>

      <Footer />
    </div>
  )
}

function CatItem({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '7px 8px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
        border: 'none',
        background: active ? 'var(--accent-soft)' : hov ? 'var(--bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text2)',
        transition: 'background .12s, color .12s', width: '100%', textAlign: 'left',
      }}>
      {label}
    </button>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1.5px solid var(--border)', marginTop: 48, padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text2)' }}>
        <span style={{ color: 'var(--accent)' }}>Rollout</span> Report
      </span>

      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
        Made with ❤️ by{' '}
        <a href="https://www.chandanaveeturi.com/" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--accent)', transition: 'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Chandana Veeturi
        </a>
        {' '}from India 🇮🇳
      </span>

      <div style={{ display: 'flex', gap: 20 }}>
        {['About', 'Archive', 'RSS'].map(l => (
          <a key={l} href="#" style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, transition: 'color .12s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
            {l}
          </a>
        ))}
      </div>
    </footer>
  )
}
