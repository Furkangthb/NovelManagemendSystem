const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

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
  // Auth
  register: (body) => request('/auth/register', 'POST', body),
  login: (body) => request('/auth/login', 'POST', body),

  // Novels
  getNovels: (params = '') => request(`/novels${params}`),
  getNovel: (id) => request(`/novels/${id}`),
  createNovel: (body) => request('/novels', 'POST', body),
  updateNovel: (id, body) => request(`/novels/${id}`, 'PUT', body),
  deleteNovel: (id) => request(`/novels/${id}`, 'DELETE'),

  // Chapters
  getChapters: (novelId) => request(`/novels/${novelId}/chapters`),
  getChapter: (id) => request(`/chapters/${id}`),
  createChapter: (novelId, body) => request(`/novels/${novelId}/chapters`, 'POST', body),
  updateChapter: (id, body) => request(`/chapters/${id}`, 'PUT', body),
  deleteChapter: (id) => request(`/chapters/${id}`, 'DELETE'),

  // Comments
  getComments: (novelId) => request(`/novels/${novelId}/comments`),
  createComment: (novelId, body) => request(`/novels/${novelId}/comments`, 'POST', body),
  deleteComment: (id) => request(`/novels/comments/${id}`, 'DELETE'),
};

const GENRE_COVERS = {
  'Fantastik': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=300&fit=crop',
  'Aksiyon': 'https://images.unsplash.com/photo-1509473142087-528d6c7cd81d?w=200&h=300&fit=crop',
  'Romance': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&h=300&fit=crop',
  'Korku': 'https://images.unsplash.com/photo-1512920150212-3fe7eeb2f5a8?w=200&h=300&fit=crop',
  'Bilim Kurgu': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&h=300&fit=crop',
  'Gizem': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=300&fit=crop',
  'Dram': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=200&h=300&fit=crop',
  'Komedi': 'https://images.unsplash.com/photo-1511497584788-876760111969?w=200&h=300&fit=crop',
};

const getCover = async (title, genre) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1`
    );
    const data = await response.json();
    if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
      return data.items[0].volumeInfo.imageLinks.thumbnail.replace('https://', 'https://');
    }
  } catch {}

  return GENRE_COVERS[genre] || 'https://picsum.photos/200/300';
};