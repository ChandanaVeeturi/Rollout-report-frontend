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
    <div style={{
      margin: '32px 0 24px',
      background: 'linear-gradient(135deg, #1a1630 0%, #0e1629 60%, #0e0e14 100%)',
      border: '1px solid var(--border)', borderRadius: 18,
      padding: '36px 40px', display: 'flex', gap: 40, alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* radial glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,111,247,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(124,111,247,0.12)', border: '1px solid rgba(124,111,247,0.25)', borderRadius: 5, padding: '3px 9px', display: 'inline-block', marginBottom: 14 }}>
          ⚡ Review of the Day
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 10 }}>{review.title}</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 20, maxWidth: 460, lineHeight: 1.6 }}>{review.tagline}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
          <VerdictBadge verdict={review.verdict} large />
          {review.category && <Pill>{review.category.icon} {review.category.name}</Pill>}
          {review.platforms && <Pill>{review.platforms}</Pill>}
          {review.release_date && <Pill>Released {new Date(review.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Pill>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* horizontal upvote for hero */}
          <button
            onClick={() => { if (!user) { navigate('/login'); return } upvoteMut.mutate() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: review.user_has_upvoted ? 'rgba(124,111,247,0.12)' : 'var(--surface2)',
              border: `1px solid ${review.user_has_upvoted ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all .15s',
              color: review.user_has_upvoted ? 'var(--accent)' : 'var(--text)',
            }}
          >
            <span style={{ fontSize: 16 }}>▲</span>
            <span>{review.upvote_count}</span>
          </button>
          <Link to={`/reviews/${review.slug}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', padding: '8px 16px', border: '1px solid rgba(124,111,247,0.3)', borderRadius: 8, transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,247,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Read Full Review →
          </Link>
        </div>
      </div>

      {/* hero image */}
      <div style={{ width: 240, height: 160, borderRadius: 12, background: 'linear-gradient(135deg, #2a2060 0%, #1a3060 100%)', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
        {review.hero_image_url
          ? <img src={review.hero_image_url} alt={review.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
          : <span>{review.category?.icon || '📦'}</span>
        }
      </div>
    </div>
  )
}

function Pill({ children }) {
  return <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 9px' }}>{children}</span>
}

function SidebarCard({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--muted)', marginBottom: 14 }}>{title}</h3>
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

  const pinned = data?.items?.find(r => r.is_pinned) || data?.items?.[0]
  const showHero = !q && sort === 'recent' && page === 1 && pinned

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      {showHero && <HeroCard review={pinned} />}

      {/* feed header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {SORTS.map(s => (
            <button key={s.key} onClick={() => setParam('sort', s.key)}
              style={{ padding: '7px 16px', borderRadius: 7, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all .15s', background: sort === s.key ? 'var(--accent)' : 'transparent', color: sort === s.key ? '#fff' : 'var(--muted)' }}>
              {s.label}
            </button>
          ))}
        </div>
        {(verdict || category) && (
          <button onClick={() => { setParam('verdict', ''); setParam('category', '') }} style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear filters ×
          </button>
        )}
      </div>

      {/* content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        {/* feed */}
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ height: 88, borderRadius: 12, background: 'var(--surface)', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : !data?.items?.length ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>No reviews yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.items.map((r, i) => (
                <ReviewCard key={r.id} review={r} rank={i + 1 + (page - 1) * 20} />
              ))}
            </div>
          )}

          {/* pagination */}
          {data?.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '28px 0' }}>
              {[...Array(data.pages)].map((_, i) => (
                <button key={i} onClick={() => setParam('page', String(i + 1))}
                  style={{ width: 36, height: 36, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: page === i + 1 ? 'var(--accent)' : 'var(--surface)', border: `1px solid ${page === i + 1 ? 'var(--accent)' : 'var(--border)'}`, fontSize: 14, fontWeight: 500, cursor: 'pointer', color: page === i + 1 ? '#fff' : 'var(--text)', transition: 'all .15s' }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <SidebarCard title="Categories">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <CatItem label="All" active={!category} onClick={() => setParam('category', '')} />
              {categories.map(c => (
                <CatItem key={c.id} label={`${c.icon} ${c.name}`} active={category === c.slug} onClick={() => setParam('category', c.slug)} />
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title="Verdict">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['recommended', 'worth_watching', 'skip_it'].map(v => (
                <button key={v} onClick={() => setParam('verdict', verdict === v ? '' : v)}
                  style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', opacity: verdict && verdict !== v ? 0.45 : 1, transition: 'opacity .15s' }}>
                  <VerdictBadge verdict={v} large />
                </button>
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title="Verdict Guide">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {[
                { v: 'recommended',    desc: 'Use it now, worth the switch.' },
                { v: 'worth_watching', desc: 'Promising but not daily-driver ready.' },
                { v: 'skip_it',        desc: 'Not there yet. Wait for the next version.' },
              ].map(({ v, desc }) => (
                <div key={v} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <VerdictBadge verdict={v} />
                  <span style={{ color: 'var(--muted)' }}>{desc}</span>
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
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 14, border: 'none', background: active ? 'var(--surface2)' : hov ? 'var(--surface2)' : 'transparent', color: active ? 'var(--text)' : 'var(--muted)', transition: 'background .15s', width: '100%', textAlign: 'left' }}>
      {label}
    </button>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 48, padding: '28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}>
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
          <a key={l} href="#" style={{ fontSize: 13, color: 'var(--muted)', transition: 'color .15s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
            {l}
          </a>
        ))}
      </div>
    </footer>
  )
}
