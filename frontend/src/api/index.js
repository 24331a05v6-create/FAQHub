import API from "./axios";

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  sendOTP: (data) => API.post("/auth/send-otp", data),
  verifyOTP: (data) => API.post("/auth/verify-otp", data),
};

export const faqAPI = {
  getAll: (params) => API.get("/faqs", { params }),
  search: (q, params) => API.get("/faqs/search", { params: { q, ...params } }),
  bookmark: (faqId) => API.post("/faqs/bookmark", { faqId }),
  getCategories: () => API.get("/faqs/categories"),
  incrementView: (id) => API.patch(`/faqs/${id}/view`),
  getPopular: () => API.get("/faqs/popular"),
  getTrending: () => API.get("/faqs/trending"),
  getRelated: (id) => API.get(`/faqs/${id}/related`),
};

export const questionAPI = {
  create: (data) => API.post("/questions", data),
  getAll: (params) => API.get("/questions", { params }),
  getById: (id) => API.get(`/questions/${id}`),
  getRelated: (id) => API.get(`/questions/${id}/related`),
};

export const answerAPI = {
  create: (questionId, data) => API.post(`/answers/${questionId}`, data),
  getByQuestion: (questionId) => API.get(`/answers/${questionId}`),
  upvote: (id) => API.patch(`/answers/upvote/${id}`),
};

export const adminAPI = {
  groupQueries: (questionIds) => API.post("/admin/group-queries", { questionIds }),
  approveAnswer: (answerId) => API.patch(`/admin/approve-answer/${answerId}`),
  getAnalytics: () => API.get("/admin/analytics"),
  getQuestions: (params) => API.get("/admin/questions", { params }),
  deleteQuestion: (id) => API.delete(`/admin/questions/${id}`),
  deleteAnswer: (id) => API.delete(`/admin/answers/${id}`),
  getFAQs: () => API.get("/admin/faqs"),
  createFAQ: (data) => API.post("/admin/faqs", data),
  deleteFAQ: (id) => API.delete(`/admin/faqs/${id}`),
  promoteToAdmin: (email) => API.post("/admin/promote-to-admin", { email }),
  // Priority & Trending
  getPriorityFAQs: () => API.get("/admin/priority-faqs"),
  togglePinFAQ: (id) => API.patch(`/admin/faqs/${id}/toggle-pin`),
  getTrending: () => API.get("/admin/trending"),
  // Moderation
  getModerationPending: () => API.get("/admin/moderation/pending"),
  getModerationPendingCount: () => API.get("/admin/moderation/pending-count"),
  getModerationStats: () => API.get("/admin/moderation/stats"),
  moderateApprove: (id) => API.patch(`/admin/moderation/approve/${id}`),
  moderateReject: (id, reason) => API.patch(`/admin/moderation/reject/${id}`, { reason }),
  moderateRequestChanges: (id, notes) => API.patch(`/admin/moderation/request-changes/${id}`, { notes }),
  // Duplicates
  detectDuplicates: () => API.post("/admin/duplicates/detect"),
  mergeDuplicates: (data) => API.post("/admin/duplicates/merge", data),
  checkSimilarity: (textA, textB) => API.post("/admin/duplicates/check-similarity", { textA, textB }),
};

export const userAPI = {
  getProfile: () => API.get("/users/me"),
  getQuestions: (params) => API.get("/users/me/questions", { params }),
  getAnswers: (params) => API.get("/users/me/answers", { params }),
  getNotifications: (params) => API.get("/users/me/notifications", { params }),
  markNotificationsRead: (ids) => API.patch("/users/me/notifications/read", { ids }),
};

export const credentialAPI = {
  list: () => API.get("/credentials"),
  issue: (data) => API.post("/credentials/issue", data),
  revoke: (id) => API.patch(`/credentials/${id}/revoke`),
};
