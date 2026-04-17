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

// Check if running in Capacitor
const isCapacitor = () => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();
};

// Open URL (in-app for Capacitor, new tab for web)
const openUrl = async (url) => {
  if (isCapacitor()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

export const api = {
  // ============ APPS ============

  uploadApp: async (formData) => {
    const response = await fetch(`${API_URL}/api/upload/kv`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  uploadAppLegacy: async (formData) => {
    const response = await fetch(`${API_URL}/api/upload`, {
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

  // ============ CDN ============

  uploadToCDN: async (file, folder = 'apps') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await fetch(`${API_URL}/cdn/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // ============ REVIEWS ============

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

  // ============ LIKES ============

  likeApp: async (meganId) => {
    const response = await fetch(`${API_URL}/api/like/${meganId}`, {
      method: 'POST',
      headers: headers(true)
    });
    return response.json();
  },

  checkLiked: async (meganId) => {
    const response = await fetch(`${API_URL}/api/like/${meganId}`, {
      headers: headers(true)
    });
    return response.json();
  },

  // ============ FOLLOW ============

  followDeveloper: async (developerId) => {
    const response = await fetch(`${API_URL}/api/me/follow`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ followingId: developerId })
    });
    return response.json();
  },

  unfollowDeveloper: async (developerId) => {
    const response = await fetch(`${API_URL}/api/me/unfollow`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ followingId: developerId })
    });
    return response.json();
  },

  // ============ USER ============

  getMe: async () => {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: headers(true)
    });
    return response.json();
  },

  upgradeDeveloper: async (data) => {
    const response = await fetch(`${API_URL}/api/me/upgrade-developer`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify(data || {})
    });
    return response.json();
  },

  // ============ API KEYS ============

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

  // ============ DEVELOPER ============

  getDeveloperStats: async () => {
    const response = await fetch(`${API_URL}/api/developer/stats`, {
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

  updateApp: async (meganId, data) => {
    const response = await fetch(`${API_URL}/api/developer/apps/${meganId}`, {
      method: 'PUT',
      headers: headers(true),
      body: JSON.stringify(data)
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
