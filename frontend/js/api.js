const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const delay = ms => new Promise(res => setTimeout(res, ms));

const request = async (endpoint, method = 'GET', body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
};

const api = {
  register: (body) => request('/auth/register', 'POST', body),
  login: (body) => request('/auth/login', 'POST', body),

  getNovels: (params = '') => request(`/novels${params}`),
  getNovel: (id) => request(`/novels/${id}`),
  createNovel: (body) => request('/novels', 'POST', body),
  updateNovel: (id, body) => request(`/novels/${id}`, 'PUT', body),
  deleteNovel: (id) => request(`/novels/${id}`, 'DELETE'),

  getChapters: (novelId) => request(`/novels/${novelId}/chapters`),
  getChapter: (id) => request(`/chapters/${id}`),
  createChapter: (novelId, body) => request(`/novels/${novelId}/chapters`, 'POST', body),
  updateChapter: (id, body) => request(`/chapters/${id}`, 'PUT', body),
  deleteChapter: (id) => request(`/chapters/${id}`, 'DELETE'),

  getComments: (novelId) => request(`/novels/${novelId}/comments`),
  createComment: (novelId, body) => request(`/novels/${novelId}/comments`, 'POST', body),
  deleteComment: (id) => request(`/novels/comments/${id}`, 'DELETE'),
};

const GENRE_COVERS = {
  'Fantastik': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
  'Aksiyon': 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?w=400&h=600&fit=crop',
  'Romance': 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&h=600&fit=crop',
  'Korku': 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=400&h=600&fit=crop',
  'Bilim Kurgu': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
  'Gizem': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
  'Dram': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400&h=600&fit=crop',
  'Komedi': 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=600&fit=crop',
};

const getCover = async (title, genre) => {
  const cacheKey = `cover_${title}`;
  const cachedCover = localStorage.getItem(cacheKey);
  
  if (cachedCover) {
    return cachedCover;
  }

  try {
    await delay(330); 
    const response = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=1`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0 && data.data[0].images?.jpg?.large_image_url) {
        const coverUrl = data.data[0].images.jpg.large_image_url;
        localStorage.setItem(cacheKey, coverUrl);
        return coverUrl;
      }
    }
  } catch (error) {
  }

  const fallbackUrl = GENRE_COVERS[genre] || 'https://images.unsplash.com/photo-1614729939124-03290b5609ce?w=400&h=600&fit=crop';
  localStorage.setItem(cacheKey, fallbackUrl);
  return fallbackUrl;
};