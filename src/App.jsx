import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import BookmarksPage from './pages/BookmarksPage'
import BlogPage from './pages/BlogPage'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

function KonamiEgg() {
  const [active, setActive] = useState(false)
  const [seq, setSeq] = useState([])

  useEffect(() => {
    function onKey(e) {
      setSeq(prev => {
        const next = [...prev, e.key].slice(-KONAMI.length)
        if (next.join(',') === KONAMI.join(',')) {
          setActive(true)
          setTimeout(() => setActive(false), 2400)
        }
        return next
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!active) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.92)',
      animation: 'fade-down 0.2s ease',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16, animation: 'upvote-pop 0.5s ease' }}>🚀</div>
      <div style={{
        fontSize: 48, fontWeight: 900, letterSpacing: '-2px',
        background: 'linear-gradient(135deg, #FF6154, #FF9F94)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        fontFamily: 'monospace',
      }}>
        ROLLOUT
      </div>
      <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: 'monospace', letterSpacing: '0.3em' }}>
        ↑↑↓↓←→←→BA
      </div>
      <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
        You found the secret. Now go ship something.
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reviews/:slug" element={<ReviewDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
          </Routes>
          <KonamiEgg />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
