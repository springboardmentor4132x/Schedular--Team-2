import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    // FastAPI OAuth2PasswordRequestForm or custom login expects JSON depending on our setup.
    // Our backend route uses a Pydantic model UserLogin (email, password) as JSON.
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateMe: async (userData) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  }
};

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  }
};

export const workspaceService = {
  getWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },
  createWorkspace: async (workspaceData) => {
    const response = await api.post('/workspaces', workspaceData);
    return response.data;
  },
  addMember: async (workspaceId, memberData) => {
    const response = await api.post(`/workspaces/${workspaceId}/members`, memberData);
    return response.data;
  }
};

export const apiSocialAccountsService = {
  getAccounts: async () => {
    const response = await api.get('/social');
    return response.data;
  },
  connectAccount: async (platform) => {
    const response = await api.post('/social/connect', { platform });
    return response.data;
  },
  disconnectAccount: async (accountId) => {
    const response = await api.delete(`/social/${accountId}`);
    return response.data;
  },
  syncAccount: async (accountId) => {
    const response = await api.post(`/social/${accountId}/sync`);
    return response.data;
  }
};

export default api;
