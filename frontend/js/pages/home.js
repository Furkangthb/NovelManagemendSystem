const homePage = {
  currentSearch: '',
  currentGenre: '',
  currentStatus: '',

  render: async ({ search = '', genre = '', status = '' } = {}) => {
    homePage.currentSearch = search;
    homePage.currentGenre = genre;
    homePage.currentStatus = status;

    appEl.innerHTML = `
      <div>
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 class="page-title" style="margin-bottom: 0.5rem;">Popüler Noveller</h1>
          <p class="page-subtitle" style="color: var(--muted); font-size: 1.1rem;">En sevilen ve en çok okunan hikayeler</p>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
          
          <div class="genre-filters" style="margin-bottom: 0; display: flex; gap: 0.5rem; flex-wrap: wrap; flex: 1;">
            ${['Tümü', 'Aksiyon', 'Fantastik', 'Romance', 'Korku', 'Bilim Kurgu', 'Gizem', 'Dram', 'Komedi'].map(g => `
              <button 
                class="genre-btn ${genre === g || (g === 'Tümü' && !genre) ? 'active' : ''}"
                onclick="homePage.filterGenre('${g}')"
              >
                ${g}
              </button>
            `).join('')}
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--muted); font-size: 0.9rem; font-weight: 500;">Durum:</span>
            <select class="form-input" style="
              width: auto; 
              padding: 0.5rem 1.2rem; 
              border-radius: 20px; 
              cursor: pointer; 
              background: rgba(20, 20, 20, 0.8);
              color: #e0e0e0; 
              border: 1px solid rgba(255, 255, 255, 0.15);
              font-size: 0.9rem;
              font-family: inherit;
              outline: none;
              transition: all 0.2s ease;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            " 
            onchange="homePage.filterStatus(this.value)"
            onmouseover="this.style.borderColor='rgba(255,255,255,0.4)'; this.style.background='rgba(30, 30, 30, 0.9)';" 
            onmouseout="this.style.borderColor='rgba(255,255,255,0.15)'; this.style.background='rgba(20, 20, 20, 0.8)';">
              <option value="Tümü" style="background: #1a1a1a; color: white;" ${!status || status === 'Tümü' ? 'selected' : ''}>Tümü</option>
              <option value="Devam Ediyor" style="background: #1a1a1a; color: white;" ${status === 'Devam Ediyor' ? 'selected' : ''}>Devam Ediyor</option>
              <option value="Tamamlandı" style="background: #1a1a1a; color: white;" ${status === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
              <option value="Askıya Alındı" style="background: #1a1a1a; color: white;" ${status === 'Askıya Alındı' ? 'selected' : ''}>Askıya Alındı</option>
            </select>
          </div>
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
    
    if (homePage.currentStatus && homePage.currentStatus !== 'Tümü') {
      params.append('status', homePage.currentStatus);
    }

    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      const data = await api.getNovels(query);
      const grid = document.getElementById('novels-grid');

      if (data.novels.length === 0) {
        grid.innerHTML = '<p class="empty">Novel bulunamadı 📭</p>';
        return;
      }

      grid.innerHTML = '';

      for (const novel of data.novels) {
        let genresArray = novel.genres || [];
        if (typeof novel.genres === 'string') {
          genresArray = novel.genres.replace(/[{}]/g, '').split(',').map(g => g.trim());
        }

        const cover = await getCover(novel.title, genresArray[0] || '');
        const card = document.createElement('div');
        card.className = 'novel-card';
        
        card.onclick = () => router.navigate('novel', { id: novel.id });
        
        card.innerHTML = `
          <div class="novel-card-cover">
            <img src="${cover}" alt="${novel.title}" 
              onerror="this.style.display='none'; this.parentElement.innerHTML='📚'">
            <div style="position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; flex-wrap: wrap; padding-right: 8px;">
              ${genresArray.length > 0 && genresArray[0] !== ""
                ? genresArray.map(g => `<span class="novel-card-genre-badge" style="position: static; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${g}</span>`).join('') 
                : '<span class="novel-card-genre-badge" style="position: static;">Belirsiz</span>'}
            </div>
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
    router.navigate('home', { 
      search: homePage.currentSearch,
      genre: genre === 'Tümü' ? '' : genre,
      status: homePage.currentStatus === 'Tümü' ? '' : homePage.currentStatus
    });
  },

  filterStatus: (status) => {
    homePage.currentStatus = status;
    router.navigate('home', {
      search: homePage.currentSearch,
      genre: homePage.currentGenre === 'Tümü' ? '' : homePage.currentGenre,
      status: status === 'Tümü' ? '' : status
    });
  }
};

window.homePage = homePage;