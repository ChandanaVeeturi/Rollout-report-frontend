import api from './client'

export const getBlogQA    = () => api.get('/admin/blog').then(r => r.data)
export const createBlogQA = (question) => api.post('/admin/blog', { question }).then(r => r.data)
export const updateBlogQA = (id, data) => api.patch(`/admin/blog/${id}`, data).then(r => r.data)
export const deleteBlogQA = (id) => api.delete(`/admin/blog/${id}`)
