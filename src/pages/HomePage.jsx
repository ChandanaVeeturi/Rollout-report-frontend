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
  const C = '#1a34d4', W = 'white'
  return (
    <svg width="116" height="118" viewBox="0 0 116 118" fill="none">
      {/* full cat head silhouette — ears built into path */}
      <path d="M22 44 L6 8 L40 32 Q58 26 76 32 L110 8 L94 44 Q112 56 108 80 Q100 110 58 114 Q16 110 8 80 Q4 56 22 44Z"
        fill={W} stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      {/* left inner ear */}
      <path d="M10 12 L36 34 L22 44Z" fill={C}/>
      {/* right inner ear */}
      <path d="M106 12 L80 34 L94 44Z" fill={C}/>
      {/* left sunglass lens — large oval */}
      <ellipse cx="38" cy="62" rx="20" ry="17" fill={C}/>
      {/* right sunglass lens */}
      <ellipse cx="78" cy="62" rx="20" ry="17" fill={C}/>
      {/* bridge */}
      <line x1="58" y1="62" x2="58" y2="62" stroke={C} strokeWidth="3"/>
      {/* left temple */}
      <line x1="18" y1="55" x2="4" y2="50" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      {/* right temple */}
      <line x1="98" y1="55" x2="112" y2="50" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      {/* nose */}
      <path d="M54 80 L58 77 L62 80Z" fill={C}/>
      {/* mouth */}
      <path d="M50 85 Q58 94 66 85" stroke={C} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* left whiskers */}
      <line x1="2" y1="78" x2="34" y2="80" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="85" x2="34" y2="85" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="92" x2="34" y2="90" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      {/* right whiskers */}
      <line x1="82" y1="80" x2="114" y2="78" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="82" y1="85" x2="114" y2="85" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="82" y1="90" x2="114" y2="92" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function BeanieCat() {
  const C = '#1a34d4', W = 'white'
  return (
    <svg width="110" height="130" viewBox="0 0 110 130" fill="none">
      {/* cat head silhouette with pointy ears at sides of beanie */}
      <path d="M20 48 L8 18 L38 38 Q55 32 72 38 L102 18 L90 48 Q108 60 104 84 Q96 114 55 118 Q14 114 6 84 Q2 60 20 48Z"
        fill={W} stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      {/* left inner ear */}
      <path d="M12 22 L34 40 L20 50Z" fill={C}/>
      {/* right inner ear */}
      <path d="M98 22 L76 40 L90 50Z" fill={C}/>
      {/* beanie hat — sits on top, covering ears */}
      <path d="M14 56 Q14 22 55 22 Q96 22 96 56Z" fill={C}/>
      <rect x="8" y="52" width="94" height="14" rx="7" fill={C}/>
      {/* brim highlight */}
      <path d="M14 60 Q55 68 96 60" stroke={W} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3"/>
      {/* pompom string */}
      <line x1="55" y1="22" x2="55" y2="11" stroke={C} strokeWidth="2"/>
      {/* pompom */}
      <circle cx="55" cy="7" r="9" fill={C}/>
      <circle cx="55" cy="7" r="5" fill={W}/>
      {/* eyes — almond shaped */}
      <ellipse cx="38" cy="80" rx="9" ry="7" fill={C}/>
      <ellipse cx="72" cy="80" rx="9" ry="7" fill={C}/>
      <circle cx="36" cy="78" r="2.5" fill={W}/>
      <circle cx="70" cy="78" r="2.5" fill={W}/>
      {/* nose */}
      <path d="M51 90 L55 87 L59 90Z" fill={C}/>
      {/* mouth */}
      <path d="M48 95 Q55 103 62 95" stroke={C} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* left whiskers */}
      <line x1="2" y1="84" x2="30" y2="86" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="91" x2="30" y2="91" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="98" x2="30" y2="96" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      {/* right whiskers */}
      <line x1="80" y1="86" x2="108" y2="84" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="80" y1="91" x2="108" y2="91" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="80" y1="96" x2="108" y2="98" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      {/* scarf / bandana hanging below */}
      <path d="M22 112 L55 130 L88 112 Q74 104 55 104 Q36 104 22 112Z" fill={C}/>
    </svg>
  )
}

function BowtieCat() {
  const C = '#1a34d4', W = 'white'
  return (
    <svg width="122" height="116" viewBox="0 0 122 116" fill="none">
      {/* full cat head silhouette with big pointed ears */}
      <path d="M24 46 L10 10 L44 36 Q61 30 78 36 L112 10 L98 46 Q116 58 112 82 Q104 112 61 116 Q18 112 10 82 Q6 58 24 46Z"
        fill={W} stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      {/* left inner ear */}
      <path d="M14 14 L40 38 L24 48Z" fill={C}/>
      {/* right inner ear */}
      <path d="M108 14 L82 38 L98 48Z" fill={C}/>
      {/* tabby forehead stripes — 3 curved lines */}
      <path d="M38 48 Q48 40 58 46" stroke={C} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M64 46 Q74 40 84 48" stroke={C} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M44 43 Q61 36 78 43" stroke={C} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* happy squinting eyes ^^ */}
      <path d="M24 66 Q38 54 52 66" stroke={C} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M70 66 Q84 54 98 66" stroke={C} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* nose */}
      <path d="M57 76 L61 73 L65 76Z" fill={C}/>
      {/* big wide smile */}
      <path d="M42 82 Q61 100 80 82" stroke={C} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* left whiskers */}
      <line x1="2" y1="72" x2="36" y2="74" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="79" x2="36" y2="79" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="86" x2="36" y2="84" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      {/* right whiskers */}
      <line x1="86" y1="74" x2="120" y2="72" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="86" y1="79" x2="120" y2="79" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="86" y1="84" x2="120" y2="86" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
      {/* bow tie left wing */}
      <path d="M20 106 L50 96 L50 116Z" fill={C}/>
      {/* bow tie right wing */}
      <path d="M102 106 L72 96 L72 116Z" fill={C}/>
      {/* knot */}
      <ellipse cx="61" cy="106" rx="14" ry="12" fill={C}/>
      {/* knot highlight */}
      <ellipse cx="61" cy="106" rx="6" ry="5" fill={W}/>
    </svg>
  )
}

function CatBanner() {
  return (
    <div style={{
      background: '#c5f5da',
      backgroundImage: `linear-gradient(rgba(50,180,130,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(50,180,130,0.28) 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
      borderRadius: 20,
      margin: '20px 0 0',
      position: 'relative',
      overflow: 'hidden',
      height: 270,
      border: '1.5px solid rgba(50,180,130,0.3)',
    }}>
      {/* Beanie cat — left floor */}
      <div style={{ position: 'absolute', left: 22, bottom: 0, animation: 'cat-sway 3.2s ease-in-out infinite', transformOrigin: 'bottom center' }}>
        <BeanieCat />
      </div>

      {/* Sunglasses cat — centered, bottom lands just above "off" label */}
      <div style={{ position: 'absolute', top: 28, left: '50%' }}>
        <div style={{ transform: 'translateX(-50%)', animation: 'cat-sway-rev 2.8s ease-in-out infinite', transformOrigin: 'bottom center' }}>
          <SunglassesCat />
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
  const tag      = searchParams.get('tag') || ''
  const q        = searchParams.get('q') || ''
  const page     = parseInt(searchParams.get('page') || '1')

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', { sort, category, verdict, tag, q, page }],
    queryFn: () => getReviews({
      sort,
      category: category || undefined,
      verdict:  verdict  || undefined,
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

  const hasFilters = verdict || category || tag || q
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
