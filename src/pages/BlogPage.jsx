import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getBlogQA, createBlogQA, updateBlogQA, deleteBlogQA } from '../api/blog'

function cardStyle() {
  return { background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow-sm)' }
}

function Placard({ entry, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.answer)
  const qc = useQueryClient()
  const deleteMut = useMutation({
    mutationFn: () => deleteBlogQA(entry.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-qa'] }),
  })

  function startEdit() {
    setDraft(entry.answer)
    setEditing(true)
  }

  function save() {
    onSave(entry.id, draft, () => setEditing(false))
  }

  return (
    <div style={{ ...cardStyle(), display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>{entry.question}</p>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {!editing && (
            <button onClick={startEdit} style={{
              fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              color: 'var(--accent)', background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)',
            }}>
              Edit
            </button>
          )}
          <button onClick={() => { if (confirm('Delete this question?')) deleteMut.mutate() }} style={{
            fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
            color: 'var(--muted)', background: 'var(--bg)', border: '1.5px solid var(--border)',
          }}>
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={6}
            placeholder="Write your answer…"
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
              resize: 'vertical', lineHeight: 1.6,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setEditing(false)} style={{
              fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 7, cursor: 'pointer',
              color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)',
            }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving} style={{
              fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 7, cursor: 'pointer',
              color: '#fff', background: 'var(--accent)', border: 'none', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      ) : entry.answer ? null : (
        <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No answer yet — click Edit to write one.</p>
      )}
    </div>
  )
}

export default function BlogPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [newQuestion, setNewQuestion] = useState('')

  useEffect(() => {
    if (!loading && !user?.is_admin) navigate('/')
  }, [loading, user, navigate])

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['blog-qa'],
    queryFn: getBlogQA,
    enabled: !!user?.is_admin,
  })

  const createMut = useMutation({
    mutationFn: createBlogQA,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog-qa'] }); setNewQuestion('') },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, answer }) => updateBlogQA(id, { answer }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-qa'] }),
  })

  if (loading || !user?.is_admin) return null

  function handleAdd(e) {
    e.preventDefault()
    const q = newQuestion.trim()
    if (q) createMut.mutate(q)
  }

  function handleSave(id, answer, onDone) {
    updateMut.mutate({ id, answer }, { onSuccess: onDone })
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Blog</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Your prep material — questions first, answers behind Edit.</p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
          placeholder="Add a new question…"
          style={{
            flex: 1, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 8,
            padding: '9px 12px', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button type="submit" disabled={createMut.isPending || !newQuestion.trim()} style={{
          fontSize: 14, fontWeight: 600, padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
          color: '#fff', background: 'var(--accent)', border: 'none', opacity: (createMut.isPending || !newQuestion.trim()) ? 0.6 : 1,
        }}>
          + Add
        </button>
      </form>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}
        </div>
      ) : entries.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>No questions yet. Add one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(entry => (
            <Placard key={entry.id} entry={entry} onSave={handleSave} saving={updateMut.isPending} />
          ))}
        </div>
      )}
    </div>
  )
}
