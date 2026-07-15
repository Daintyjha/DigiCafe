document.addEventListener("DOMContentLoaded", () => {

  const storyKey = new URLSearchParams(window.location.search).get("story");

  const story = window.STORIES?.[storyKey];

  if (!story) {
    document.getElementById("chapterTitle").textContent = "Story not found";
    console.error("Missing story:", storyKey);
    return;
  }

  const chapters = Array.from({ length: story.chapters }, (_, i) => {
    const num = i + 1;

    return {
      title: `${story.title}: Chapter ${num}`,
      pdf: `Asset/NovelFiles/${storyKey}/${storyKey}_pdf/ch${num}.pdf`,
audio: `Asset/NovelFiles/${storyKey}/${storyKey}_mp3/ch${num}.mp3`
    };
  });

  const titleEl = document.getElementById("chapterTitle");
  const contentEl = document.getElementById("chapterContent");
  const audioEl = document.getElementById("chapterAudio");

  let current = 0;
  const storageKey = "progress_" + storyKey;

  current = parseInt(localStorage.getItem(storageKey)) || 0;

  function loadChapter(i) {
    if (i < 0 || i >= chapters.length) return;

    const ch = chapters[i];
    current = i;

    titleEl.textContent = ch.title;

    contentEl.innerHTML = `
      <iframe src="${ch.pdf}" style="width:100%; height:600px; border:none;"></iframe>
    `;

    audioEl.src = ch.audio;
    audioEl.load();

    localStorage.setItem(storageKey, current);
  }

  document.getElementById("prevChapter")?.addEventListener("click", () => {
    loadChapter(current - 1);
  });

  document.getElementById("nextChapter")?.addEventListener("click", () => {
    loadChapter(current + 1);
  });

  loadChapter(current);

});
