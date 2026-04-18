const API_URL = 'https://appapi.megan.qzz.io';

const getToken = () => localStorage.getItem('token');

const headers = (withAuth = false) => {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const isCapacitor = () => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();
};

const openUrl = async (url) => {
  if (isCapacitor()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

export const api = {
  uploadApp: async (formData) => {
    const response = await fetch(`${API_URL}/api/upload/kv`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  getApps: async () => {
    const response = await fetch(`${API_URL}/api/apps`);
    return response.json();
  },

  getApp: async (slug) => {
    const response = await fetch(`${API_URL}/api/app/${slug}`);
    return response.json();
  },

  searchApps: async (query) => {
    const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  downloadApp: (slug) => {
    const url = `${API_URL}/api/download/${slug}`;
    openUrl(url);
  },

  addReview: async (meganId, review) => {
    const response = await fetch(`${API_URL}/api/review/${meganId}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(review)
    });
    return response.json();
  },

  getReviews: async (meganId) => {
    const response = await fetch(`${API_URL}/api/app/${meganId}/reviews`);
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: headers(true)
    });
    return response.json();
  },

  getApiKeys: async () => {
    const response = await fetch(`${API_URL}/api/me/api-keys`, {
      headers: headers(true)
    });
    return response.json();
  },

  createApiKey: async (name) => {
    const response = await fetch(`${API_URL}/api/me/api-keys`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ name })
    });
    return response.json();
  },

  deleteApiKey: async (keyId) => {
    const response = await fetch(`${API_URL}/api/me/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: headers(true)
    });
    return response.json();
  },

  getDeveloperApps: async () => {
    const response = await fetch(`${API_URL}/api/developer/apps`, {
      headers: headers(true)
    });
    return response.json();
  },

  deleteApp: async (meganId) => {
    const response = await fetch(`${API_URL}/api/developer/apps/${meganId}`, {
      method: 'DELETE',
      headers: headers(true)
    });
    return response.json();
  }
};
