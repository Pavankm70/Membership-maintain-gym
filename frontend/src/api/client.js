import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gymsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response?.data?.fieldErrors && typeof error.response.data.fieldErrors === 'object') {
      const fieldList = Object.entries(error.response.data.fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      message = fieldList || error.response.data.message || message;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials)
};

export const membersApi = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`)
};

export const trainersApi = {
  getAll: (params) => api.get('/trainers', { params }),
  getActive: () => api.get('/trainers/active'),
  getById: (id) => api.get(`/trainers/${id}`),
  create: (data) => api.post('/trainers', data),
  update: (id, data) => api.put(`/trainers/${id}`, data),
  delete: (id) => api.delete(`/trainers/${id}`),
  toggleStatus: (id) => api.patch(`/trainers/${id}/toggle-status`)
};

export const plansApi = {
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`)
};

export const subscriptionsApi = {
  getAll: (params) => api.get('/subscriptions', { params }),
  getById: (id) => api.get(`/subscriptions/${id}`),
  getByMember: (memberId) => api.get(`/subscriptions/member/${memberId}`),
  create: (data) => api.post('/subscriptions', data),
  updateStatus: (id, status) => api.patch(`/subscriptions/${id}/status`, { status }),
  assignTrainer: (id, trainerId) => api.patch(`/subscriptions/${id}/trainer`, { trainerId }),
  delete: (id) => api.delete(`/subscriptions/${id}`)
};

export const paymentsApi = {
  getAll: (params) => api.get('/payments', { params }),
  getBySubscription: (subId) => api.get(`/payments/subscription/${subId}`),
  create: (data) => api.post('/payments', data)
};

export const attendanceApi = {
  getAll: (params) => api.get('/attendance', { params }),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getActiveCount: () => api.get('/attendance/active-count')
};

export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getMonthlyRevenue: () => api.get('/reports/revenue-monthly'),
  getPlanDistribution: () => api.get('/reports/plan-distribution'),
  getMemberStatus: () => api.get('/reports/member-status'),
  getExpiringSubscriptions: (days = 30) => api.get('/reports/expiring-subscriptions', { params: { days } }),
  getDailyAttendance: (days = 30) => api.get('/reports/attendance-daily', { params: { days } }),
  getPeakHours: () => api.get('/reports/peak-hours')
};

export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  changePassword: (id, data) => api.post(`/users/${id}/change-password`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

export const explorerApi = {
  getTablesSummary: () => api.get('/explorer/tables'),
  getTableData: (table, page = 0, size = 15) => api.get(`/explorer/tables/${table}/data`, { params: { page, size } }),
  getTableStructure: (table) => api.get(`/explorer/tables/${table}/structure`),
  getRelationships: () => api.get('/explorer/relationships'),
  getSqlLabQueries: () => api.get('/explorer/sql-lab/queries'),
  executeSqlLabQuery: (queryId) => api.post(`/explorer/sql-lab/execute/${queryId}`)
};

export default api;
