import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', display_name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.display_name, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 20, textDecoration: 'none' }}>
            <span style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🚀</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}><span style={{ color: 'var(--accent)' }}>Rollout</span> Report</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6, color: 'var(--text)' }}>Create an account</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Join to upvote and discuss software reviews</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '28px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ fontSize: 13, color: 'var(--red)', padding: '11px 14px', borderRadius: 8, background: 'var(--red-bg)', border: '1px solid var(--red-border)', marginBottom: 16 }}>
                {error}
              </div>
            )}
            <Field label="Display Name">
              <input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} required placeholder="Your name" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min. 8 characters" />
            </Field>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#fff', background: 'var(--accent)', border: 'none', cursor: 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1, transition: 'opacity .15s, background .15s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-dim)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
      {React.cloneElement(children, {
        style: { width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s' },
        onFocus: e => e.target.style.borderColor = 'var(--accent)',
        onBlur:  e => e.target.style.borderColor = 'var(--border)',
      })}
    </div>
  )
}
