// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ───────────────────────────────────────────────────────────────
// User APIs
// ───────────────────────────────────────────────────────────────
export const userAPI = {
  signup: (data) =>
    apiCall('/user/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  login: (data) =>
    apiCall('/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  forgotPassword: (email) =>
    apiCall('/user/forgotpassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (email, otp) =>
    apiCall('/user/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (token, password) =>
    apiCall('/user/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    }),
};

// ───────────────────────────────────────────────────────────────
// Department APIs
// ───────────────────────────────────────────────────────────────
export const departmentAPI = {
  getAll: () => apiCall('/department'),

  getById: (id) => apiCall(`/department/${id}`),

  getByNameOrCode: (search) => apiCall(`/department/search?q=${encodeURIComponent(search)}`),

  create: (data) =>
    apiCall('/department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiCall(`/department/${id}`, {
      method: 'DELETE',
    }),
};

// ───────────────────────────────────────────────────────────────
// Subject APIs
// ───────────────────────────────────────────────────────────────
export const subjectAPI = {
  getAll: () => apiCall('/subject'),

  getById: (id) => apiCall(`/subject/${id}`),

  getByDepartment: (deptId) => apiCall(`/subject/dept/${deptId}`),

  getBySemester: (deptId, semester) => apiCall(`/subject/dept/${deptId}/semester/${semester}`),

  create: (data) =>
    apiCall('/subject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiCall(`/subject/${id}`, {
      method: 'DELETE',
    }),
};

// ───────────────────────────────────────────────────────────────
// Paper APIs
// ───────────────────────────────────────────────────────────────
export const paperAPI = {
  getAll: () => apiCall('/papers'),

  getById: (id) => apiCall(`/papers/${id}`),

  getBySubject: (subjectId) => apiCall(`/papers/subject/${subjectId}`),

  getByDepartment: (deptId) => apiCall(`/papers/dept/${deptId}`),

  search: (query) => apiCall(`/papers/search?q=${encodeURIComponent(query)}`),

  uploadPaper: (formData) =>
    apiCall('/papers/upload', {
      method: 'POST',
      body: formData, // Don't set Content-Type, let browser set it for FormData
    }),

  downloadPaper: (paperId) =>
    apiCall(`/papers/${paperId}/download`, {
      method: 'GET',
    }),

  delete: (id) =>
    apiCall(`/papers/${id}`, {
      method: 'DELETE',
    }),

  getFilters: () => ({
    departments: [
      { value: 'first-year', label: 'First Year (Common)' },
      { value: 'cse', label: 'Computer Science' },
      { value: 'ece', label: 'Electronics & Comm.' },
      { value: 'me', label: 'Mechanical Engg.' },
      { value: 'ce', label: 'Civil Engineering' },
      { value: 'eee', label: 'Electrical Engg.' },
      { value: 'it', label: 'Information Tech.' },
      { value: 'bca', label: 'BCA' },
      { value: 'mba', label: 'MBA' },
    ],
    years: Array.from({ length: 10 }, (_, i) => ({
      value: new Date().getFullYear() - i,
      label: `${new Date().getFullYear() - i}`,
    })),
    semesters: [
      { value: '1', label: '1st' },
      { value: '2', label: '2nd' },
      { value: '3', label: '3rd' },
      { value: '4', label: '4th' },
      { value: '5', label: '5th' },
      { value: '6', label: '6th' },
      { value: '7', label: '7th' },
      { value: '8', label: '8th' },
    ],
    examTypes: [
      { value: 'End Semester/Back', label: 'End Semester' },
      { value: 'Mid Semester', label: 'Mid Semester' },
    ],
  }),
};

// ───────────────────────────────────────────────────────────────
// AI / Metadata APIs
// ───────────────────────────────────────────────────────────────
export const aiAPI = {
  getSKITInfo: () => apiCall('/ai/skit-info'),
};
