import axios from 'axios';

const API_URL = `http://${window.location.hostname}:5000/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm Interceptor để nhét Token vào mọi Request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/users/register', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    changePassword: (data) => api.post('/auth/change-password', data)
};

export const userAPI = {
    getAll: () => api.get('/users/all'),
};

export const studentAPI = {
    getAll: () => api.get('/students'),
    create: (data) => api.post('/students', data),
    delete: (id) => api.delete(`/students/${id}`),
};

export const attendanceAPI = {
    getAll: () => api.get('/attendance'),
    mark: (data) => api.post('/attendance', data),
};

export const materialAPI = {
    getByClass: (classId) => api.get(`/materials/classes/${classId}`),
    create: (data) => api.post('/materials', data),
};

export const classAPI = {
    getAll: () => api.get('/classes'),
    getStudents: (classId) => api.get(`/classes/${classId}/students`),
    create: (data) => api.post('/classes', data),
};

export const scheduleAPI = {
    getAll: () => api.get('/schedules'),
    create: (data) => api.post('/schedules', data)
};

export default api;
