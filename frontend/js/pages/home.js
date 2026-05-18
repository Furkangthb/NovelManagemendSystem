const homePage = {
  currentSearch: '',
  currentGenre: '',

  render: async ({ search = '', genre = '' } = {}) => {
    homePage.currentSearch = search;
    homePage.currentGenre = genre;

    appEl.innerHTML = `
      <div>
        <h1 class="page-title">Popüler Noveller</h1>
        <p class="page-subtitle">En sevilen ve en çok okunan hikayeler</p>

        <div class="genre-filters">
          ${['Tümü', 'Aksiyon', 'Fantastik', 'Romance', 'Korku', 'Bilim Kurgu', 'Gizem', 'Dram', 'Komedi'].map(g => `
            <button 
              class="genre-btn ${genre === g || (g === 'Tümü' && !genre) ? 'active' : ''}"
              onclick="homePage.filterGenre('${g}')"
            >
              ${g}
            </button>
          `).join('')}
        </div>

        <div id="novels-grid" class="novels-grid">
          <p class="loading">Yükleniyor...</p>
        </div>
      </div>
    `;

    await homePage.loadNovels();
  },

  loadNovels: async () => {
    const params = new URLSearchParams();
    if (homePage.currentSearch) params.append('search', homePage.currentSearch);
    if (homePage.currentGenre && homePage.currentGenre !== 'Tümü') {
      params.append('genre', homePage.currentGenre);
    }

    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      const data = await api.getNovels(query);
      const grid = document.getElementById('novels-grid');

      if (data.novels.length === 0) {
        grid.innerHTML = '<p class="empty">Novel bulunamadı 📭</p>';
        return;
      }

      // İstediğiniz döngü yapısı buraya eklendi
      grid.innerHTML = '';

      for (const novel of data.novels) {
        const cover = await getCover(novel.title, novel.genre);
        const card = document.createElement('div');
        card.className = 'novel-card';
        
        // Bu kullanım çok daha güvenlidir, global tanımlama gerektirmez
        card.onclick = () => router.navigate('novel', { id: novel.id });
        
        card.innerHTML = `
          <div class="novel-card-cover">
            <img src="${cover}" alt="${novel.title}" 
              onerror="this.style.display='none'; this.parentElement.innerHTML='📚'">
            <span class="novel-card-genre-badge">${novel.genre || 'Belirsiz'}</span>
          </div>
          <div class="novel-card-body">
            <div class="novel-card-title">${novel.title}</div>
            <div class="novel-card-author">✍️ ${novel.author}</div>
            <div class="novel-card-footer">
              <span class="novel-card-status ${
                novel.status === 'Tamamlandı' ? 'status-completed' :
                novel.status === 'Askıya Alındı' ? 'status-paused' : 'status-ongoing'
              }">
                ${novel.status}
              </span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      }

    } catch (error) {
      document.getElementById('novels-grid').innerHTML = `
        <p class="error-msg">${error.message}</p>
      `;
    }
  },

  filterGenre: (genre) => {
    homePage.currentGenre = genre;
    router.navigate('home', { genre: genre === 'Tümü' ? '' : genre });
  },
};

// HTML içindeki onclick="homePage.filterGenre(...)" kısmının çalışması için 
// bu satırı sayfanın en altında tutmayı unutmayın:
window.homePage = homePage;