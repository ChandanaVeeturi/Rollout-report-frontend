import api from './client'

export const getReviews = (params) => api.get('/reviews', { params }).then(r => r.data)
export const getReview = (slug) => api.get(`/reviews/${slug}`).then(r => r.data)
export const getComments = (slug) => api.get(`/reviews/${slug}/comments`).then(r => r.data)
export const postComment = (slug, body) => api.post(`/reviews/${slug}/comments`, { body }).then(r => r.data)
export const deleteComment = (slug, id) => api.delete(`/reviews/${slug}/comments/${id}`)
export const toggleUpvote = (slug) => api.post(`/reviews/${slug}/upvote`).then(r => r.data)
export const toggleBookmark = (slug) => api.post(`/reviews/${slug}/bookmark`).then(r => r.data)
export const getBookmarks = () => api.get('/reviews/bookmarks').then(r => r.data)
export const getCategories = () => api.get('/categories').then(r => r.data)

// Admin
export const adminGetReviews = () => api.get('/admin/reviews').then(r => r.data)
export const adminCreateReview = (data) => api.post('/admin/reviews', data).then(r => r.data)
export const adminUpdateReview = (slug, data) => api.patch(`/admin/reviews/${slug}`, data).then(r => r.data)
export const adminDeleteReview = (slug) => api.delete(`/admin/reviews/${slug}`)
export const adminPinReview = (slug) => api.post(`/admin/reviews/${slug}/pin`).then(r => r.data)
