import api from './client'
import { MOCK_REVIEWS, MOCK_CATEGORIES, MOCK_COMMENTS } from './mockData'

// ── mock helpers ──────────────────────────────────────────────────────────────

function filterReviews({ sort, category, verdict, q, page = 1, pageSize = 20 } = {}) {
  let items = [...MOCK_REVIEWS]

  if (category) items = items.filter(r => r.category.slug === category)
  if (verdict)  items = items.filter(r => r.verdict === verdict)
  if (q)        items = items.filter(r =>
    r.title.toLowerCase().includes(q.toLowerCase()) ||
    r.tagline.toLowerCase().includes(q.toLowerCase())
  )

  if (sort === 'popular')  items.sort((a, b) => b.upvote_count - a.upvote_count)
  else if (sort === 'trending') items.sort((a, b) => b.comment_count - a.comment_count)
  else items.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))

  const pages = Math.ceil(items.length / pageSize)
  items = items.slice((page - 1) * pageSize, page * pageSize)
  return { items, pages }
}

// ── upvote state (in-memory for mock session) ─────────────────────────────────
const upvoted   = new Set()
const bookmarked = new Set()

function applyUserState(reviews) {
  return reviews.map(r => ({
    ...r,
    user_has_upvoted:   upvoted.has(r.slug),
    user_has_bookmarked: bookmarked.has(r.slug),
    upvote_count: r.upvote_count + (upvoted.has(r.slug) ? 1 : 0),
  }))
}

// ── API functions with mock fallback ─────────────────────────────────────────

export async function getReviews(params) {
  try {
    return await api.get('/reviews', { params }).then(r => r.data)
  } catch {
    const result = filterReviews(params)
    return { ...result, items: applyUserState(result.items) }
  }
}

export async function getReview(slug) {
  try {
    return await api.get(`/reviews/${slug}`).then(r => r.data)
  } catch {
    const review = MOCK_REVIEWS.find(r => r.slug === slug)
    if (!review) throw new Error('Not found')
    return {
      ...review,
      user_has_upvoted: upvoted.has(slug),
      user_has_bookmarked: bookmarked.has(slug),
      upvote_count: review.upvote_count + (upvoted.has(slug) ? 1 : 0),
    }
  }
}

export async function getComments(slug) {
  try {
    return await api.get(`/reviews/${slug}/comments`).then(r => r.data)
  } catch {
    return MOCK_COMMENTS[slug] || []
  }
}

export async function postComment(slug, body) {
  try {
    return await api.post(`/reviews/${slug}/comments`, { body }).then(r => r.data)
  } catch {
    const newComment = {
      id: Date.now(),
      user: { id: 0, display_name: 'You' },
      body,
      created_at: new Date().toISOString(),
      is_deleted: false,
    }
    if (!MOCK_COMMENTS[slug]) MOCK_COMMENTS[slug] = []
    MOCK_COMMENTS[slug].unshift(newComment)
    const review = MOCK_REVIEWS.find(r => r.slug === slug)
    if (review) review.comment_count++
    return newComment
  }
}

export async function deleteComment(slug, id) {
  try {
    return await api.delete(`/reviews/${slug}/comments/${id}`)
  } catch {
    if (MOCK_COMMENTS[slug]) {
      MOCK_COMMENTS[slug] = MOCK_COMMENTS[slug].filter(c => c.id !== id)
    }
  }
}

export async function toggleUpvote(slug) {
  try {
    return await api.post(`/reviews/${slug}/upvote`).then(r => r.data)
  } catch {
    if (upvoted.has(slug)) upvoted.delete(slug)
    else upvoted.add(slug)
    return { upvoted: upvoted.has(slug) }
  }
}

export async function toggleBookmark(slug) {
  try {
    return await api.post(`/reviews/${slug}/bookmark`).then(r => r.data)
  } catch {
    if (bookmarked.has(slug)) bookmarked.delete(slug)
    else bookmarked.add(slug)
    return { bookmarked: bookmarked.has(slug) }
  }
}

export const getBookmarks = () =>
  api.get('/reviews/bookmarks').then(r => r.data).catch(() => [])

export async function getCategories() {
  try {
    return await api.get('/categories').then(r => r.data)
  } catch {
    return MOCK_CATEGORIES
  }
}

// Admin — no mock fallback needed (admin panel requires real backend)
export const adminGetReviews    = () => api.get('/admin/reviews').then(r => r.data)
export const adminCreateReview  = (data) => api.post('/admin/reviews', data).then(r => r.data)
export const adminUpdateReview  = (slug, data) => api.patch(`/admin/reviews/${slug}`, data).then(r => r.data)
export const adminDeleteReview  = (slug) => api.delete(`/admin/reviews/${slug}`)
export const adminPinReview     = (slug) => api.post(`/admin/reviews/${slug}/pin`).then(r => r.data)
