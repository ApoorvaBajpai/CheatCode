import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

export const getContests = () => api.get('/contests');
export const getContest = (id: string) => api.get(`/contests/${id}`);
export const createContest = (data: any) => api.post('/contests', data);
export const deleteContest = (id: string) => api.delete(`/contests/${id}`);

export default api;
