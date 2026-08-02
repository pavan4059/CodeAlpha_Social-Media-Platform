// API base client configuration
const API_BASE = '/api';

// Toast Notifications Helper
function showToast(message, isError = false) {
  const toast = document.getElementById('toast-msg');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast visible' + (isError ? ' error' : '');
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

// Universal API Fetcher with JWT authentication headers
async function apiFetch(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('pulse_jwt');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
        // Token invalid or expired
        localStorage.removeItem('pulse_jwt');
        if (typeof showAuthScreen === 'function') showAuthScreen();
      }
      throw new Error(data.message || `API Request error (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('API Call Failed:', endpoint, error);
    throw error;
  }
}

// Auth endpoints
const apiLogin = (loginId, password) => apiFetch('/auth/login', 'POST', { loginId, password });
const apiRegister = (userData) => apiFetch('/auth/register', 'POST', userData);
const apiGetMe = () => apiFetch('/auth/me');

// Posts & stream endpoints
const apiGetFeed = (type = 'all') => apiFetch(`/posts?type=${type}`);
const apiCreatePost = (content, imageUrl) => apiFetch('/posts', 'POST', { content, imageUrl });
const apiGetPostById = (id) => apiFetch(`/posts/${id}`);
const apiDeletePost = (id) => apiFetch(`/posts/${id}`, 'DELETE');
const apiToggleLike = (id) => apiFetch(`/posts/${id}/like`, 'POST');

// Comments endpoints
const apiGetComments = (postId) => apiFetch(`/posts/${postId}/comments`);
const apiAddComment = (postId, text) => apiFetch(`/posts/${postId}/comments`, 'POST', { text });

// Users & follow interactions
const apiGetUserProfile = (username) => apiFetch(`/users/${username}`);
const apiUpdateProfile = (profileData) => apiFetch('/users/profile', 'PUT', profileData);
const apiToggleFollow = (userId) => apiFetch(`/users/${userId}/follow`, 'POST');
const apiGetSuggestions = () => apiFetch('/users/explore/suggestions');
