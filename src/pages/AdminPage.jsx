import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetReviews, adminCreateReview, adminUpdateReview, adminDeleteReview, adminPinReview, getCategories } from '../api/reviews'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import VerdictBadge from '../components/VerdictBadge'

const EMPTY = { title: '', product_slug: '', tagline: '', body: '', verdict: 'recommended', category_id: '', platforms: '', external_url: '', release_date: '', status: 'draft', tags: [], hero_image_url: '' }

function inputStyle(focused) {
  return { width: '100%', background: 'var(--surface2)', border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s' }
}

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--muted)', marginBottom: 5 }}>{children}</label>
}

function ReviewForm({ initial, onSave, onCancel, categories, loading }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [tagInput, setTagInput] = useState('')
  const [focused, setFocused] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const fo = (k) => ({ onFocus: () => setFocused(f => ({ ...f, [k]: true })), onBlur: () => setFocused(f => ({ ...f, [k]: false })) })

  function addTag(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
      if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
      setTagInput('')
    }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>{initial ? 'Edit Review' : 'New Review'}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {[['Title', 'title', 'e.g. Cursor 1.0'], ['Product Slug', 'product_slug', 'e.g. cursor']].map(([lbl, key, ph]) => (
          <div key={key}>
            <Label>{lbl}</Label>
            <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={inputStyle(focused[key])} {...fo(key)} />
          </div>
        ))}
        <div style={{ gridColumn: '1/-1' }}>
          <Label>Tagline (max 160 chars)</Label>
          <input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="One punchy sentence" style={inputStyle(focused.tagline)} {...fo('tagline')} />
        </div>
        <div>
          <Label>Category</Label>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ ...inputStyle(false), cursor: 'pointer' }}>
            <option value="">— None —</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Verdict</Label>
          <select value={form.verdict} onChange={e => set('verdict', e.target.value)} style={{ ...inputStyle(false), cursor: 'pointer' }}>
            <option value="recommended">✓ Recommended</option>
            <option value="worth_watching">👁 Worth Watching</option>
            <option value="skip_it">✗ Skip It</option>
          </select>
        </div>
        {[['Platforms', 'platforms', 'e.g. macOS, Windows, Web'], ['Release Date', 'release_date', '', 'date'], ['External URL', 'external_url', 'https://'], ['Hero Image URL', 'hero_image_url', 'https://']].map(([lbl, key, ph, type]) => (
          <div key={key}>
            <Label>{lbl}</Label>
            <input type={type || 'text'} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={inputStyle(focused[key])} {...fo(key)} />
          </div>
        ))}
        <div>
          <Label>Status</Label>
          <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inputStyle(false), cursor: 'pointer' }}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <Label>Tags (press Enter to add)</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', minHeight: 40 }}>
            {form.tags.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--border)', color: 'var(--muted)' }}>
                #{t}
                <button onClick={() => set('tags', form.tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, padding: 0, fontSize: 11 }}>×</button>
              </span>
            ))}
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder={form.tags.length === 0 ? 'add-tag' : ''} style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text)', minWidth: 60, flex: 1 }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Label>Body (Markdown)</Label>
        <textarea value={form.body} onChange={e => set('body', e.target.value)} rows={14} placeholder="Write your review in Markdown…"
          style={{ ...inputStyle(focused.body), resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6 }} {...fo('body')} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => onSave(form)} disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--accent)', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving…' : 'Save Review'}
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)

  if (!user?.is_admin) { navigate('/'); return null }

  const { data: reviews = [], isLoading } = useQuery({ queryKey: ['admin-reviews'], queryFn: adminGetReviews })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const createMut = useMutation({ mutationFn: adminCreateReview, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); setEditing(null) } })
  const updateMut = useMutation({ mutationFn: ({ slug, data }) => adminUpdateReview(slug, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); setEditing(null) } })
  const deleteMut = useMutation({ mutationFn: adminDeleteReview, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }) })
  const pinMut    = useMutation({ mutationFn: adminPinReview,   onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }) })

  function handleSave(form) {
    if (editing === 'new') createMut.mutate(form)
    else updateMut.mutate({ slug: editing.slug, data: form })
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Admin — Reviews</h1>
        <button onClick={() => setEditing('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
          + New Review
        </button>
      </div>

      {editing && (
        <ReviewForm
          initial={editing === 'new' ? null : editing}
          categories={categories}
          loading={createMut.isPending || updateMut.isPending}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 72, borderRadius: 12, background: 'var(--surface)' }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>No reviews yet. Create one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{r.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <VerdictBadge verdict={r.verdict} />
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: r.status === 'published' ? 'rgba(34,197,94,0.1)' : 'var(--surface2)', color: r.status === 'published' ? '#22c55e' : 'var(--muted)', border: `1px solid ${r.status === 'published' ? 'rgba(34,197,94,0.2)' : 'var(--border)'}` }}>
                    {r.status}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>▲{r.upvote_count} · 💬{r.comment_count}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <IconBtn title="Pin as Review of the Day" onClick={() => pinMut.mutate(r.slug)} active={r.is_pinned}>📌</IconBtn>
                <IconBtn title="Edit" onClick={() => setEditing(r)}>✏️</IconBtn>
                <IconBtn title="Delete" onClick={() => { if (window.confirm(`Delete "${r.title}"?`)) deleteMut.mutate(r.slug) }} danger>🗑</IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, onClick, title, active, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', border: '1px solid var(--border)', background: hov ? (danger ? 'rgba(239,68,68,0.08)' : 'var(--surface2)') : 'transparent', color: active ? 'var(--accent)' : hov && danger ? '#ef4444' : 'var(--muted)', transition: 'all .15s' }}>
      {children}
    </button>
  )
}
