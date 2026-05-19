const homePage = {
  render: async () => {
    appEl.innerHTML = `<p class="loading">Yükleniyor...</p>`;

    try {
      const data = await api.getNovels();
      const novels = data.novels;

      appEl.innerHTML = `
        <div class="home-container">
          <div class="hero-section" style="text-align:center; margin-bottom: 2rem;">
            <h1>📚 NovelHub'a Hoş Geldiniz</h1>
            <p style="color: var(--muted, #666);">Binlerce dijital romanı keşfedin, okuyun ve puanlayın.</p>
          </div>

          <div class="filter-bar" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 2rem; background: rgba(0,0,0,0.03); padding: 1rem; border-radius: 8px;">
            <input type="text" id="filter-search" class="form-input" placeholder="Roman veya yazar ara..." style="flex: 1; min-width: 200px;">
            
            <select id="filter-genre" class="form-input" style="flex: 1; min-width: 130px;">
              <option value="">Tüm Türler</option>
              <option value="Aksiyon">Aksiyon</option>
              <option value="Fantastik">Fantastik</option>
              <option value="Romance">Romance</option>
              <option value="Korku">Korku</option>
              <option value="Bilim Kurgu">Bilim Kurgu</option>
              <option value="Gizem">Gizem</option>
              <option value="Dram">Dram</option>
              <option value="Komedi">Komedi</option>
            </select>

            <select id="filter-status" class="form-input" style="flex: 1; min-width: 130px;">
              <option value="">Tüm Durumlar</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="Askıya Alındı">Askıya Alındı</option>
            </select>

            <select id="filter-rating" class="form-input" style="flex: 1; min-width: 160px; font-weight: bold; color: #f39c12;">
              <option value="" style="color: initial;">Tüm Puanlar</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Yıldız</option>
              <option value="4">⭐⭐⭐⭐ 4+ Yıldız</option>
              <option value="3">⭐⭐⭐ 3+ Yıldız</option>
            </select>

            <button class="btn btn-primary" onclick="homePage.applyFilters()">Ara / Filtrele</button>
          </div>

          <div id="novels-grid" class="novels-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
            </div>
        </div>
      `;

      homePage.renderNovelsGrid(novels);

    } catch (error) {
      appEl.innerHTML = `<p class="error-msg">Sunucuya bağlanılamadı: ${error.message}</p>`;
    }
  },

  renderNovelsGrid: (novels) => {
    const gridEl = document.getElementById('novels-grid');
    
    if (novels.length === 0) {
      gridEl.innerHTML = `<p class="empty" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Aradığınız kriterlere uygun roman bulunamadı 📭</p>`;
      return;
    }

    gridEl.innerHTML = novels.map(novel => {
      let genresHtml = '';
      let firstGenre = '';
      if (novel.genres && novel.genres.length > 0) {
        let gArray = novel.genres;
        if (typeof novel.genres === 'string') {
          gArray = novel.genres.replace(/[{}]/g, '').split(',').map(g => g.trim());
        }
        firstGenre = gArray[0];
        genresHtml = `<span class="novel-genre-badge" style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.1);">${firstGenre}</span>`;
      }

      const ratingVal = parseFloat(novel.average_rating);
      const ratingHtml = ratingVal > 0 
        ? `<span style="color: #f39c12; font-weight: bold; font-size: 0.9rem;">⭐ ${ratingVal}</span>` 
        : `<span style="color: #aaa; font-size: 0.8rem; font-style: italic;">Yeni Eklendi</span>`;

      return `
        <div class="novel-card" onclick="router.navigate('novel', {id: ${novel.id}})" style="cursor: pointer; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s;">
          <div class="novel-card-image" id="cover-home-${novel.id}" style="height: 300px; background: #eee; display: flex; align-items: center; justify-content: center; position: relative;">
             <span style="font-size: 3rem;">📚</span>
             </div>
          
          <div class="novel-card-content" style="padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              ${genresHtml}
              ${ratingHtml}
            </div>
            <h3 style="margin: 0 0 0.4rem 0; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${novel.title}">${novel.title}</h3>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">✍️ ${novel.author}</p>
          </div>
        </div>
      `;
    }).join('');

    if (typeof getCover === 'function') {
      novels.forEach(async (novel) => {
        let firstGenre = '';
        if (novel.genres && novel.genres.length > 0) {
           firstGenre = typeof novel.genres === 'string' 
             ? novel.genres.replace(/[{}]/g, '').split(',')[0].trim() 
             : novel.genres[0];
        }
        
        const coverUrl = await getCover(novel.title, firstGenre);
        
        const coverEl = document.getElementById(`cover-home-${novel.id}`);
        if (coverEl) {
          coverEl.innerHTML = `<img src="${coverUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1614729939124-03290b5609ce?w=400&h=600&fit=crop'" />`;
        }
      });
    }
  },

  applyFilters: async () => {
    const search = document.getElementById('filter-search').value;
    const genre = document.getElementById('filter-genre').value;
    const status = document.getElementById('filter-status').value;
    const rating = document.getElementById('filter-rating').value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre) params.append('genre', genre);
    if (status) params.append('status', status);
    if (rating) params.append('rating', rating);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const data = await api.getNovels(queryString);
      homePage.renderNovelsGrid(data.novels);
    } catch (error) {
      alert('Filtreleme sırasında bir hata oluştu: ' + error.message);
    }
  }
};