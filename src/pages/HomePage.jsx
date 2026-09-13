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

const PLATFORMS = ['macOS', 'Windows', 'Linux', 'Web', 'iOS', 'Android']

function HeroCard({ review }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const upvoteMut = useMutation({
    mutationFn: () => toggleUpvote(review.slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['review', review.slug] })
    },
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
      <div className="rotd-badge" style={{
        position: 'absolute', top: 14, right: 16,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
        color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
        borderRadius: 5, padding: '3px 8px',
      }}>
        ⚡ PM Pick of the Day
      </div>

      <div style={{
        width: 76, height: 76, borderRadius: 18, flexShrink: 0,
        border: '1.5px solid var(--border)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38, background: 'var(--surface2)',
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
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-soft)'}>
            Read Full Review →
          </Link>
          {review.comment_count > 0 && (
            <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {review.comment_count}
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
      {active && <span style={{ fontSize: 10 }}>✕</span>}
    </button>
  )
}

function SunglassesCat() {
  return (
    <svg width="92" height="104" viewBox="0 0 92 104" fill="none">
      <path d="M18 42 L10 14 L35 28Z" fill="#1a34d4"/>
      <path d="M74 42 L82 14 L57 28Z" fill="#1a34d4"/>
      <ellipse cx="46" cy="62" rx="35" ry="33" fill="#1a34d4"/>
      <circle cx="32" cy="57" r="12" fill="#d8f5e4"/>
      <circle cx="60" cy="57" r="12" fill="#d8f5e4"/>
      <rect x="44" y="55" width="4" height="2.5" rx="1" fill="#1a34d4"/>
      <line x1="20" y1="54" x2="10" y2="51" stroke="#d8f5e4" strokeWidth="2" strokeLinecap="round"/>
      <line x1="72" y1="54" x2="82" y2="51" stroke="#d8f5e4" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="46" cy="71" rx="3" ry="2" fill="#d8f5e4"/>
      <path d="M40 76 Q46 83 52 76" stroke="#d8f5e4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="8" y1="69" x2="35" y2="72" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="8" y1="75" x2="35" y2="75" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="57" y1="72" x2="84" y2="69" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="57" y1="75" x2="84" y2="75" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function BeanieCat() {
  return (
    <svg width="96" height="138" viewBox="0 0 96 138" fill="none">
      <circle cx="48" cy="9" r="9" fill="#1a34d4"/>
      <ellipse cx="48" cy="26" rx="27" ry="19" fill="#1a34d4"/>
      <path d="M21 33 Q48 42 75 33" stroke="#d8f5e4" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <ellipse cx="16" cy="57" rx="12" ry="13" fill="#1a34d4"/>
      <ellipse cx="80" cy="57" rx="12" ry="13" fill="#1a34d4"/>
      <ellipse cx="48" cy="76" rx="34" ry="32" fill="#1a34d4"/>
      <ellipse cx="35" cy="70" rx="5.5" ry="6.5" fill="#d8f5e4"/>
      <ellipse cx="61" cy="70" rx="5.5" ry="6.5" fill="#d8f5e4"/>
      <circle cx="36" cy="71" r="2.5" fill="#1a34d4"/>
      <circle cx="62" cy="71" r="2.5" fill="#1a34d4"/>
      <ellipse cx="48" cy="81" rx="3" ry="2" fill="#d8f5e4"/>
      <path d="M42 86 Q48 93 54 86" stroke="#d8f5e4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="10" y1="79" x2="38" y2="82" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="10" y1="85" x2="38" y2="85" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="58" y1="82" x2="86" y2="79" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="58" y1="85" x2="86" y2="85" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M14 103 Q48 116 82 103 L82 113 Q48 125 14 113Z" fill="#1a34d4"/>
      <path d="M14 103 Q48 111 82 103" stroke="#d8f5e4" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function BowtieCat() {
  return (
    <svg width="96" height="112" viewBox="0 0 96 112" fill="none">
      <path d="M18 40 L10 14 L34 27Z" fill="#1a34d4"/>
      <path d="M78 40 L86 14 L62 27Z" fill="#1a34d4"/>
      <ellipse cx="48" cy="60" rx="36" ry="34" fill="#1a34d4"/>
      <path d="M33 36 Q40 31 46 35" stroke="#d8f5e4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M50 35 Q56 31 63 36" stroke="#d8f5e4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M38 31 Q48 26 58 31" stroke="#d8f5e4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M28 55 Q35 48 42 55" stroke="#d8f5e4" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M54 55 Q61 48 68 55" stroke="#d8f5e4" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="48" cy="67" rx="3" ry="2" fill="#d8f5e4"/>
      <path d="M42 72 Q48 79 54 72" stroke="#d8f5e4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="8" y1="65" x2="36" y2="68" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="8" y1="71" x2="36" y2="71" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="60" y1="68" x2="88" y2="65" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="60" y1="71" x2="88" y2="71" stroke="#d8f5e4" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M22 97 L44 90 L44 104Z" fill="#1a34d4"/>
      <path d="M74 97 L52 90 L52 104Z" fill="#1a34d4"/>
      <ellipse cx="48" cy="97" rx="6" ry="7" fill="#1a34d4"/>
      <ellipse cx="48" cy="97" rx="3" ry="3.5" fill="#d8f5e4"/>
    </svg>
  )
}

function CatBanner() {
  return (
    <div style={{
      background: '#d8f5e4',
      backgroundImage: `linear-gradient(rgba(26,52,212,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(26,52,212,0.10) 1px, transparent 1px)`,
      backgroundSize: '30px 30px',
      borderRadius: 20,
      margin: '20px 0 0',
      padding: '28px 32px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 210,
      border: '1.5px solid rgba(26,52,212,0.13)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', left: 32, bottom: 6, opacity: 0.95 }}><SunglassesCat /></div>
      <div style={{ position: 'absolute', left: '50%', top: 4, transform: 'translateX(-50%)', opacity: 0.95 }}><BeanieCat /></div>
      <div style={{ position: 'absolute', right: 28, bottom: 4, opacity: 0.95 }}><BowtieCat /></div>
      <div style={{ textAlign: 'center', zIndex: 2, padding: '0 160px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#1a34d4', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 10, opacity: 0.6 }}>
          fresh off product hunt
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#1a34d4', letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0 }}>
          The Rollout Report
        </h1>
        <p style={{ fontSize: 15, color: '#1a34d4', opacity: 0.6, marginTop: 10, fontWeight: 500, margin: '10px 0 0' }}>
          A PM's unfiltered take on what just shipped 🚀
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sort     = searchParams.get('sort') || 'recent'
  const category = searchParams.get('category') || ''
  const verdict  = searchParams.get('verdict') || ''
  const platform = searchParams.get('platform') || ''
  const tag      = searchParams.get('tag') || ''
  const q        = searchParams.get('q') || ''
  const page     = parseInt(searchParams.get('page') || '1')

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', { sort, category, verdict, platform, tag, q, page }],
    queryFn: () => getReviews({
      sort,
      category: category || undefined,
      verdict:  verdict  || undefined,
      platform: platform || undefined,
      tag:      tag      || undefined,
      q:        q        || undefined,
      page,
    }),
  })

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  function setParam(key, value) {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  function clearAll() {
    setSearchParams({})
  }

  const hasFilters = verdict || category || platform || tag || q
  const pinned   = data?.items?.find(r => r.is_pinned) || data?.items?.[0]
  const showHero = !q && !tag && sort === 'recent' && page === 1 && pinned

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
      <CatBanner />
      {showHero && <HeroCard review={pinned} />}

      {/* Active filters banner */}
      {(tag || q) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 8px', flexWrap: 'wrap' }}>
          {q && <FilterChip label={`Search: "${q}"`} onRemove={() => setParam('q', '')} />}
          {tag && <FilterChip label={`Tag: #${tag}`} onRemove={() => setParam('tag', '')} />}
        </div>
      )}

      {/* Sort tabs */}
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
        {hasFilters && (
          <button onClick={clearAll}
            style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            Clear filters ×
          </button>
        )}
      </div>

      {/* Content grid */}
      <div className="home-grid" style={{ marginTop: 12 }}>

        {/* Feed */}
        <div>
          {isLoading ? (
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 84, borderBottom: '1px solid var(--border)', borderRadius: 0, opacity: 1 - i * 0.12 }} />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <EmptyFeed hasFilters={!!hasFilters} onClear={clearAll} />
          ) : (
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {data.items.map((r, i) => (
                <ReviewCard key={r.id} review={r} rank={i + 1 + (page - 1) * 20} />
              ))}
            </div>
          )}

          {/* Pagination */}
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

        {/* Sidebar */}
        <aside className="home-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <SidebarCard title="Topics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <CatItem label="All Topics" active={!category} onClick={() => setParam('category', '')} />
              {categories.map(c => (
                <CatItem key={c.id} label={`${c.icon} ${c.name}`} active={category === c.slug} onClick={() => setParam('category', category === c.slug ? '' : c.slug)} />
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title="Platform">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setParam('platform', platform === p ? '' : p)} style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid',
                  borderColor: platform === p ? 'var(--accent)' : 'var(--border)',
                  background: platform === p ? 'var(--accent-soft)' : 'var(--bg)',
                  color: platform === p ? 'var(--accent)' : 'var(--text2)',
                  transition: 'all .12s',
                }}>
                  {p}
                </button>
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
                { v: 'recommended',    desc: 'Solid UX, clear value prop. Use it now.' },
                { v: 'worth_watching', desc: 'Good idea, rough edges. Watch the roadmap.' },
                { v: 'skip_it',        desc: 'Needs a rethink. Wait for v2.' },
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

function FilterChip({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
    </span>
  )
}

function EmptyFeed({ hasFilters, onClear }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      {hasFilters ? (
        <>
          <p style={{ color: 'var(--text2)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No reviews match your filters</p>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Try a different combination or clear the filters.</p>
          <button onClick={onClear} style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}>
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--text2)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Nothing here yet</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            I'm probably stress-testing the onboarding flow of something new. Check back soon.
          </p>
        </>
      )}
    </div>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1.5px solid var(--border)', marginTop: 48, padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text2)' }}>
        <span style={{ color: 'var(--accent)' }}>Rollout</span> Report
      </span>

      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
        A PM's take on what just shipped · by{' '}
        <a href="https://www.linkedin.com/in/chandana-v-04b1b124a/" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--accent)', transition: 'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Chandana Veeturi
        </a>
        {' '}🇮🇳
      </span>

      <div style={{ display: 'flex', gap: 20 }}>
        {['About', 'Archive'].map(l => (
          <span key={l} style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{l}</span>
        ))}
      </div>
    </footer>
  )
}
