import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReviews, getCategories, toggleUpvote } from '../api/reviews'
import ReviewCard, { UpvoteBox } from '../components/ReviewCard'
import VerdictBadge from '../components/VerdictBadge'
import { useAuth } from '../context/AuthContext'

const SORTS = [
  { key: 'recent',   label: 'Most Recent' },
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

/* Shared "peeking" cat base — chibi head + shoulders/paws poking up, like a sticker */
function CatBody({ C, W }) {
  return (
    <>
      <path d="M22 112 Q14 146 24 173 Q33 189 50 189 L90 189 Q107 189 116 173 Q126 146 118 112 Q118 96 98 92 L42 92 Q22 96 22 112Z"
        fill={W} stroke={C} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M70 151 L70 185" stroke={C} strokeWidth="2" opacity="0.35"/>
      <path d="M42 159 Q48 153 54 159" stroke={C} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M86 159 Q92 153 98 159" stroke={C} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    </>
  )
}

function CatEars({ C, W }) {
  return (
    <>
      <path d="M24 6 L50 30 L34 42Z" fill={W} stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M116 6 L90 30 L106 42Z" fill={W} stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M28 17 L45 31 L33 35Z" fill={C} opacity="0.85"/>
      <path d="M112 17 L95 31 L107 35Z" fill={C} opacity="0.85"/>
    </>
  )
}

function SunglassesCat() {
  const C = '#1a34d4', W = 'white'
  return (
    <svg width="112" height="152" viewBox="0 0 140 190" fill="none">
      <CatBody C={C} W={W} />
      <CatEars C={C} W={W} />
      <ellipse cx="70" cy="66" rx="50" ry="46" fill={W} stroke={C} strokeWidth="3"/>
      {/* sunglasses — big rounded lenses */}
      <rect x="28" y="55" width="34" height="26" rx="10" fill={C}/>
      <rect x="78" y="55" width="34" height="26" rx="10" fill={C}/>
      <line x1="62" y1="66" x2="78" y2="66" stroke={C} strokeWidth="4"/>
      <line x1="17" y1="57" x2="28" y2="61" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <line x1="123" y1="57" x2="112" y2="61" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <line x1="34" y1="61" x2="42" y2="69" stroke={W} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <line x1="84" y1="61" x2="92" y2="69" stroke={W} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      {/* nose + mouth */}
      <path d="M65 90 L70 86 L75 90Z" fill={C}/>
      <path d="M62 95 Q70 101 78 95" stroke={C} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* whiskers */}
      <line x1="8" y1="84" x2="30" y2="86" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="91" x2="30" y2="91" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="86" x2="132" y2="84" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="91" x2="132" y2="91" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function BeanieCat() {
  const C = '#1a34d4', W = 'white'
  return (
    <svg width="106" height="156" viewBox="0 0 140 205" fill="none">
      <path d="M22 126 Q14 158 24 184 Q33 200 50 200 L90 200 Q107 200 116 184 Q126 158 118 126 Q118 110 98 106 L42 106 Q22 110 22 126Z"
        fill={W} stroke={C} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M70 164 L70 196" stroke={C} strokeWidth="2" opacity="0.35"/>
      {/* scarf draped over shoulders */}
      <path d="M30 104 Q70 126 110 104 L104 120 Q70 136 36 120Z" fill={C}/>
      {/* ears peeking out from under the beanie */}
      <path d="M30 22 L54 44 L40 54Z" fill={W} stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M110 22 L86 44 L100 54Z" fill={W} stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      <ellipse cx="70" cy="78" rx="50" ry="46" fill={W} stroke={C} strokeWidth="3"/>
      {/* beanie */}
      <path d="M18 66 Q18 22 70 22 Q122 22 122 66Z" fill={C}/>
      <rect x="14" y="60" width="112" height="16" rx="8" fill={C}/>
      <path d="M20 68 Q70 78 120 68" stroke={W} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3"/>
      <line x1="70" y1="22" x2="70" y2="17" stroke={C} strokeWidth="3"/>
      <circle cx="70" cy="13" r="9" fill={C}/>
      <circle cx="70" cy="13" r="4" fill={W}/>
      {/* round eyes with pupils */}
      <ellipse cx="50" cy="82" rx="9" ry="11" fill={W} stroke={C} strokeWidth="2"/>
      <ellipse cx="90" cy="82" rx="9" ry="11" fill={W} stroke={C} strokeWidth="2"/>
      <circle cx="51" cy="84" r="5" fill={C}/>
      <circle cx="91" cy="84" r="5" fill={C}/>
      <circle cx="49" cy="81" r="1.5" fill={W}/>
      <circle cx="89" cy="81" r="1.5" fill={W}/>
      {/* nose + mouth */}
      <path d="M65 98 L70 94 L75 98Z" fill={C}/>
      <path d="M62 103 Q70 109 78 103" stroke={C} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* whiskers */}
      <line x1="8" y1="92" x2="30" y2="94" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="99" x2="30" y2="99" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="94" x2="132" y2="92" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="99" x2="132" y2="99" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function BowtieCat() {
  const C = '#1a34d4', W = 'white'
  return (
    <svg width="118" height="160" viewBox="0 0 140 190" fill="none">
      <CatBody C={C} W={W} />
      <CatEars C={C} W={W} />
      <ellipse cx="70" cy="66" rx="50" ry="46" fill={W} stroke={C} strokeWidth="3"/>
      {/* bow tie at the neck */}
      <path d="M32 92 L58 82 L58 100Z" fill={C}/>
      <path d="M108 92 L82 82 L82 100Z" fill={C}/>
      <ellipse cx="70" cy="92" rx="13" ry="11" fill={C}/>
      <ellipse cx="70" cy="92" rx="5.5" ry="4.5" fill={W}/>
      {/* happy squinting eyes */}
      <path d="M28 62 Q40 51 52 62" stroke={C} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M88 62 Q100 51 112 62" stroke={C} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* nose + big smile */}
      <path d="M65 76 L70 72 L75 76Z" fill={C}/>
      <path d="M52 80 Q70 96 88 80" stroke={C} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* joy sparkles */}
      <path d="M112 40 L116 48 L124 50 L116 52 L112 60 L108 52 L100 50 L108 48Z" fill={C} opacity="0.8"/>
      {/* whiskers */}
      <line x1="8" y1="80" x2="30" y2="82" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="87" x2="30" y2="87" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="82" x2="132" y2="80" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="87" x2="132" y2="87" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function CatBanner() {
  return (
    <div style={{
      background: '#d7f8d9',
      backgroundImage: `linear-gradient(rgba(60,110,200,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(60,110,200,0.22) 1px, transparent 1px)`,
      backgroundSize: '28px 28px',
      borderRadius: 20,
      margin: '20px 0 0',
      position: 'relative',
      overflow: 'hidden',
      height: 270,
      border: '1.5px solid rgba(60,110,200,0.25)',
    }}>
      {/* Sunglasses cat — left floor */}
      <div style={{ position: 'absolute', left: 22, bottom: 0, animation: 'cat-sway 3.2s ease-in-out infinite', transformOrigin: 'bottom center' }}>
        <SunglassesCat />
      </div>

      {/* Beanie cat — centered, floating above the "off" label */}
      <div style={{ position: 'absolute', top: 14, left: '50%' }}>
        <div style={{ transform: 'translateX(-50%)', animation: 'cat-sway-rev 2.8s ease-in-out infinite', transformOrigin: 'bottom center' }}>
          <BeanieCat />
        </div>
      </div>

      {/* Bow tie cat — right floor */}
      <div style={{ position: 'absolute', right: 18, bottom: 0, animation: 'cat-sway-slow 3.8s ease-in-out infinite', transformOrigin: 'bottom center' }}>
        <BowtieCat />
      </div>

      {/* Text — absolutely pinned to bottom, never touched by cats */}
      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#1a34d4', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 8, opacity: 0.5 }}>
          fresh off product hunt
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: '#1a34d4', letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0 }}>
          The Rollout Report
        </h1>
        <p style={{ fontSize: 14, color: '#1a34d4', opacity: 0.5, marginTop: 8, fontWeight: 500 }}>
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
