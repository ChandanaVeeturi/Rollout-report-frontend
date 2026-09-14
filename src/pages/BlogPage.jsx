import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getBlogQA, createBlogQA, updateBlogQA, deleteBlogQA } from '../api/blog'

// Answers store highlights inline as ==marked text== (plain-text friendly, no schema change)
function renderHighlighted(text) {
  const parts = text.split(/(==.+?==)/g)
  return parts.map((part, i) => {
    const m = part.match(/^==(.+)==$/)
    if (!m) return part
    return <mark key={i} style={{ background: '#ffe600', color: '#1a1a1a', borderRadius: 2, padding: '0 2px' }}>{m[1]}</mark>
  })
}

function Tile({ entry, onOpen }) {
  return (
    <button onClick={() => onOpen(entry)} style={{
      textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: '1.5px solid var(--border)',
      borderRadius: 12, padding: '18px 16px', boxShadow: 'var(--shadow-sm)', minHeight: 96,
      display: 'flex', alignItems: 'center',
      transition: 'border-color .15s, transform .1s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <p style={{
        fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {entry.question}
      </p>
    </button>
  )
}

function EntryModal({ entry, onClose, onSave, onDelete, saving }) {
  const [editing, setEditing] = useState(false)
  const [question, setQuestion] = useState(entry.question)
  const [answer, setAnswer] = useState(entry.answer)
  const textareaRef = useRef(null)

  function startEdit() {
    setQuestion(entry.question)
    setAnswer(entry.answer)
    setEditing(true)
  }

  function save() {
    onSave(entry.id, { question, answer }, () => setEditing(false))
  }

  function toggleHighlight() {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    if (start === end) return

    const before = answer.slice(0, start)
    const selected = answer.slice(start, end)
    const after = answer.slice(end)
    const alreadyMarked = /^==.+==$/.test(selected)

    const next = alreadyMarked
      ? before + selected.slice(2, -2) + after
      : before + `==${selected}==` + after
    setAnswer(next)

    const delta = alreadyMarked ? -4 : 4
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start, end + delta)
    })
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14,
        width: '100%', maxWidth: 560, maxHeight: '85vh',
        boxShadow: 'var(--shadow-lg, 0 12px 40px rgba(0,0,0,0.25))', display: 'flex', flexDirection: 'column',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 16, zIndex: 1,
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: '50%',
          cursor: 'pointer', color: 'var(--red)', fontSize: 18, lineHeight: 1, padding: 0,
        }}>×</button>

        <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {editing ? (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--muted)', marginBottom: 5 }}>Question</label>
              <input value={question} onChange={e => setQuestion(e.target.value)} style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '9px 12px', fontSize: 15, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
              }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--muted)' }}>Answer</label>
                <button type="button" onClick={toggleHighlight} title="Select text, then click to highlight it" style={{
                  fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
                  color: 'var(--text2)', background: 'var(--bg)', border: '1.5px solid var(--border)',
                }}>
                  🖍 Highlight
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                rows={10}
                autoFocus
                placeholder="Write your answer…"
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
                  resize: 'vertical', lineHeight: 1.6,
                }}
              />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>Select a sentence, then click Highlight to mark it — click again to remove.</p>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>{entry.question}</h2>
            {entry.answer ? (
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{renderHighlighted(entry.answer)}</p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No answer yet — click Edit to write one.</p>
            )}
          </>
        )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0,
        }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={{
                fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
                color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)',
              }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving} style={{
                fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
                color: '#fff', background: 'var(--accent)', border: 'none', opacity: saving ? 0.6 : 1,
              }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { if (confirm('Delete this question?')) onDelete(entry.id) }} style={{
                fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
                color: 'var(--muted)', background: 'var(--bg)', border: '1.5px solid var(--border)',
              }}>
                Delete
              </button>
              <button onClick={startEdit} style={{
                fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
                color: 'var(--accent)', background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)',
              }}>
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [newQuestion, setNewQuestion] = useState('')
  const [openId, setOpenId] = useState(null)

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
    mutationFn: ({ id, data }) => updateBlogQA(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-qa'] }),
  })
  const deleteMut = useMutation({
    mutationFn: deleteBlogQA,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog-qa'] }); setOpenId(null) },
  })

  if (loading || !user?.is_admin) return null

  const openEntry = entries.find(e => e.id === openId) || null

  function handleAdd(e) {
    e.preventDefault()
    const q = newQuestion.trim()
    if (q) createMut.mutate(q)
  }

  function handleSave(id, data, onDone) {
    updateMut.mutate({ id, data }, { onSuccess: onDone })
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Blog</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Your prep material — click a card to read and edit.</p>

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
        <div className="blog-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 12 }} />)}
        </div>
      ) : entries.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>No questions yet. Add one above.</p>
      ) : (
        <div className="blog-grid">
          {entries.map(entry => (
            <Tile key={entry.id} entry={entry} onOpen={e => setOpenId(e.id)} />
          ))}
        </div>
      )}

      {openEntry && (
        <EntryModal
          entry={openEntry}
          onClose={() => setOpenId(null)}
          onSave={handleSave}
          onDelete={id => deleteMut.mutate(id)}
          saving={updateMut.isPending}
        />
      )}
    </div>
  )
}
