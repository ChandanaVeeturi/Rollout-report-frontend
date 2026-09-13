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

  if (sort === 'popular')       items.sort((a, b) => b.upvote_count - a.upvote_count)
  else if (sort === 'trending') {
    const score = r => (r.upvote_count + 1) / Math.pow((Date.now() - new Date(r.release_date)) / 3.6e6 + 2, 1.5)
    items.sort((a, b) => score(b) - score(a))
  }
  else items.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))

  const pages = Math.ceil(items.length / pageSize)
  items = items.slice((page - 1) * pageSize, page * pageSize)
  return { items, pages }
}

// ── upvote/bookmark state (in-memory for mock session) ───────────────────────
const upvoted    = new Set()
const bookmarked = new Set()

function applyUserState(reviews) {
  return reviews.map(r => ({
    ...r,
    user_has_upvoted:    upvoted.has(r.slug),
    user_has_bookmarked: bookmarked.has(r.slug),
    upvote_count: r.upvote_count + (upvoted.has(r.slug) ? 1 : 0),
  }))
}

// Only fall back to mock on network errors (no response).
// HTTP errors (401, 403, 422 …) must propagate so the UI can react correctly.
function isMockable(err) {
  return !err.response
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getReviews(params) {
  try {
    const data = await api.get('/reviews', { params }).then(r => r.data)
    if (!Array.isArray(data?.items)) throw new Error('invalid response')
    return data
  } catch (err) {
    if (!isMockable(err)) throw err
    const result = filterReviews(params)
    return { ...result, total: result.items.length, page: params?.page || 1, per_page: 20, items: applyUserState(result.items) }
  }
}

export async function getReview(slug) {
  try {
    const data = await api.get(`/reviews/${slug}`).then(r => r.data)
    if (!data?.slug) throw new Error('invalid response')
    return data
  } catch (err) {
    if (!isMockable(err)) throw err
    const review = MOCK_REVIEWS.find(r => r.slug === slug)
    if (!review) throw new Error('Not found')
    return {
      ...review,
      user_has_upvoted:    upvoted.has(slug),
      user_has_bookmarked: bookmarked.has(slug),
      upvote_count: review.upvote_count + (upvoted.has(slug) ? 1 : 0),
    }
  }
}

export async function getComments(slug) {
  try {
    const data = await api.get(`/reviews/${slug}/comments`).then(r => r.data)
    if (!Array.isArray(data)) throw new Error('invalid response')
    return data
  } catch (err) {
    if (!isMockable(err)) throw err
    return MOCK_COMMENTS[slug] || []
  }
}

export async function postComment(slug, body) {
  return await api.post(`/reviews/${slug}/comments`, { body }).then(r => r.data)
}

export async function editComment(slug, id, body) {
  return await api.patch(`/reviews/${slug}/comments/${id}`, { body }).then(r => r.data)
}

export async function deleteComment(slug, id) {
  return await api.delete(`/reviews/${slug}/comments/${id}`)
}

export async function toggleUpvote(slug) {
  return await api.post(`/reviews/${slug}/upvote`).then(r => r.data)
}

export async function toggleBookmark(slug) {
  return await api.post(`/reviews/${slug}/bookmark`).then(r => r.data)
}

export const getBookmarks = () =>
  api.get('/reviews/bookmarks').then(r => r.data)

export async function getCategories() {
  try {
    const data = await api.get('/categories').then(r => r.data)
    if (!Array.isArray(data)) throw new Error('invalid response')
    return data
  } catch (err) {
    if (!isMockable(err)) throw err
    return MOCK_CATEGORIES
  }
}

// Admin — no mock fallback (admin panel requires real backend)
export const adminGetReviews   = (page = 1) => api.get('/admin/reviews', { params: { page, per_page: 50 } }).then(r => r.data)
export const adminCreateReview = (data) => api.post('/admin/reviews', data).then(r => r.data)
export const adminUpdateReview = (slug, data) => api.patch(`/admin/reviews/${slug}`, data).then(r => r.data)
export const adminDeleteReview = (slug) => api.delete(`/admin/reviews/${slug}`)
export const adminPinReview    = (slug) => api.post(`/admin/reviews/${slug}/pin`).then(r => r.data)
