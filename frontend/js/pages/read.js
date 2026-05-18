const readPage = {
  render: async ({ chapterId } = {}) => {
    appEl.innerHTML = `<p class="loading">Yükleniyor...</p>`;

    try {
      const data = await api.getChapter(chapterId);
      const chapter = data.chapter;

      appEl.innerHTML = `
        <div class="read-page">
          <div class="read-header">
            <button class="back-btn" onclick="router.navigate('novel', {id: ${chapter.novel_id}})">
              ← Novele Dön
            </button>
            <h2 class="read-title">
              Bölüm ${chapter.chapter_number}: ${chapter.title}
            </h2>
          </div>
          <div class="read-content">
            ${chapter.content.split('\n').map(p => p ? `<p>${p}</p>` : '').join('')}
          </div>
        </div>
      `;
    } catch (error) {
      appEl.innerHTML = `<p class="error-msg">${error.message}</p>`;
    }
  },
};