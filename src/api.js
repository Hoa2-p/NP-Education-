import axios from 'axios';

const API_URL = `http://${window.location.hostname}:5000/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    getAll: () => api.get('/materials'),
    create: (data) => api.post('/materials', data),
};

export const classAPI = {
    getAll: () => api.get('/classes'),
    create: (data) => api.post('/classes', data),
};

export default api;