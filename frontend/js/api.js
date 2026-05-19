// js/api.js
const API_BASE_URL = 'http://localhost:3000/api';

const api = {
    // ADMIN YETKİSİ GEREKTİREN İŞLEMLER
    getAdminHeaders: () => ({
        'Content-Type': 'application/json',
        'x-admin-secret': localStorage.getItem('adminSecret') || ''
    }),

    getProjects: async () => {
        const res = await fetch(`${API_BASE_URL}/projects`, { headers: api.getAdminHeaders() });
        if (!res.ok) throw new Error('Projeler alınamadı. Admin şifresi yanlış olabilir.');
        return res.json();
    },

    createProject: async (name) => {
        const res = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: api.getAdminHeaders(),
            body: JSON.stringify({ name })
        });
        return res.json();
    },

    // PROJE (API KEY) YETKİSİ GEREKTİREN İŞLEMLER
    getProjectHeaders: () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('currentApiKey') || ''}`
    }),

    getIssues: async () => {
        const res = await fetch(`${API_BASE_URL}/errors/issues`, { headers: api.getProjectHeaders() });
        if (!res.ok) throw new Error('Hatalar alınamadı.');
        return res.json();
    },

    getIssueDetail: async (id) => {
        const res = await fetch(`${API_BASE_URL}/errors/issues/${id}`, { headers: api.getProjectHeaders() });
        return res.json();
    },

    updateIssueStatus: async (id, status) => {
        const res = await fetch(`${API_BASE_URL}/errors/issues/${id}/status`, {
            method: 'PATCH',
            headers: api.getProjectHeaders(),
            body: JSON.stringify({ status })
        });
        return res.json();
    }
};