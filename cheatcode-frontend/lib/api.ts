import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Attach JWT automatically
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// Auth
export const register = (d: any) => api.post('/auth/register', d);
export const login = (d: any) => api.post('/auth/login', d);

// Contests
export const getContests = () => api.get('/contests');
export const getContest = (id: string) => api.get(`/contests/${id}`);
export const createContest = (d: any) => api.post('/contests', d);
export const deleteContest = (id: string) => api.delete(`/contests/${id}`);

// Code execution
export const runCode = (d: any) => api.post('/run', d);

// Submissions
export const saveSubmission = (d: any) => api.post('/submissions', d);
export const getSubmissions = () => api.get('/submissions');
export const getSubmission = (id: string) => api.get(`/submissions/${id}`);

export default api;
