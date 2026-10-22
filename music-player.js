
console.log("🎵 DigiCafe Global Music Player Loaded");

(function () {
    "use strict";

    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let musicLibrary = [];
    let currentTrack = null;
    let currentIndex = 0;
    let playbackList = [];
    let activePlaylist = "library";
    let isShuffle = false;
    let favorites = [];
    let playerInitialized = false;
    let loadingPromise = null;

    const FAVORITES_KEY = "digiCafeFavorites";
    const VOLUME_KEY = "musicVolume";

    let audioPlayer = null;
    let playerElement = null;
    let playBtn = null;
    let nextBtn = null;
    let prevBtn = null;
    let shuffleBtn = null;
    let favoriteBtn = null;
    let trackTitle = null;
    let trackArtist = null;
    let playbackSource = null;
    let progressBar = null;
    let currentTimeDisplay = null;
    let durationDisplay = null;
    let volumeSlider = null;
    let categorySelect = null;
    let categoryPlayBtn = null;


    /* =====================================================
       HELPERS
    ===================================================== */

    function getSongId(song) {
        if (!song) return "";

        return String(
            song.id ||
            song.songId ||
            song.file ||
            song.url ||
            song.title ||
            ""
        );
    }

    function getSongFile(song) {
        if (!song) return "";

        return String(
            song.file ||
            song.url ||
            song.src ||
            ""
        ).trim();
    }

    function getSongTitle(song) {
        return song?.title || song?.name || "Unknown Track";
    }

    function getSongArtist(song) {
        return song?.artist || song?.author || "DigiCafe";
    }

    function getSongCategory(song) {
        return String(song?.category || "").trim();
    }

    function escapeSelector(value) {
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(String(value));
        }

        return String(value).replace(/["\\]/g, "\\$&");
    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    function readStorage(key, fallback) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : fallback;
        } catch (error) {
            console.warn("Could not read storage:", key, error);
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn("Could not save storage:", key, error);
        }
    }

    function loadSavedFavorites() {
        const saved = readStorage(FAVORITES_KEY, []);

        if (!Array.isArray(saved)) return [];

        return saved;
    }

    function saveFavorites() {
        writeStorage(
            FAVORITES_KEY,
            favorites.map(song => getSongId(song)).filter(Boolean)
        );
    }

    function restoreFavorites() {
        const savedIds = loadSavedFavorites();

        favorites = savedIds
            .map(saved => {
                if (typeof saved === "object" && saved !== null) {
                    const savedId = getSongId(saved);

                    return (
                        musicLibrary.find(song => getSongId(song) === savedId) ||
                        saved
                    );
                }

                return musicLibrary.find(
                    song => getSongId(song) === String(saved)
                );
            })
            .filter(song => song && getSongFile(song));
    }


    /* =====================================================
       LOAD MUSIC LIBRARY
    ===================================================== */

    function getLibraryURLs() {
        const urls = [];
        const scriptURL = window.digiCafeMusicPlayerScriptURL;

        if (scriptURL) {
            try {
                urls.push(
                    new URL("music-library.json", scriptURL).href
                );
            } catch (error) {
                console.warn("Could not build library URL:", error);
            }
        }

        urls.push(
            new URL("music-library.json", window.location.href).href,
            new URL("/music-library.json", window.location.origin).href
        );

        return [...new Set(urls)];
    }

    async function loadMusic() {
        const urls = getLibraryURLs();
        let lastError = null;

        for (const url of urls) {
            try {
                console.log("🎵 Trying music library:", url);

                const response = await fetch(url, {
                    cache: "no-cache"
                });

                if (!response.ok) {
                    throw new Error(
                        "HTTP " + response.status + " while loading " + url
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error(
                        "music-library.json must contain a JSON array."
                    );
                }

                musicLibrary = data
                    .filter(song => song && getSongFile(song))
                    .map(song => ({
                        ...song,
                        category: getSongCategory(song)
                    }));

                console.log(
                    "🎵 Music library loaded:",
                    musicLibrary.length,
                    "tracks"
                );

                restoreFavorites();
                updateFavoriteButton();
                updateCurrentSongIndicator();

                return musicLibrary;

            } catch (error) {
                lastError = error;
                console.warn("Library load attempt failed:", error);
            }
        }

        console.error(
            "❌ Could not load music-library.json.",
            lastError
        );

        musicLibrary = [];
        restoreFavorites();

        return musicLibrary;
    }


    /* =====================================================
       PLAYER ELEMENTS
    ===================================================== */

    function findPlayerElements() {
        audioPlayer = document.getElementById("audioPlayer");
        playerElement = document.querySelector(".player");

        playBtn = document.getElementById("playBtn");
        nextBtn = document.getElementById("nextBtn");
        prevBtn = document.getElementById("prevBtn");
        shuffleBtn = document.getElementById("shuffleBtn");
        favoriteBtn = document.getElementById("favoriteBtn");

        trackTitle = document.getElementById("trackTitle");
        trackArtist = document.getElementById("trackArtist");
        playbackSource = document.getElementById("playbackSource");

        progressBar = document.getElementById("progressBar");
        currentTimeDisplay = document.getElementById("currentTime");
        durationDisplay = document.getElementById("duration");
        volumeSlider = document.getElementById("volumeSlider");

        categorySelect = document.getElementById("playerCategorySelect");
        categoryPlayBtn = document.getElementById(
            "playerCategoryPlayBtn"
        );
    }


    /* =====================================================
       TIME DISPLAY
    ===================================================== */

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return (
            minutes +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }


    /* =====================================================
       CURRENT SONG INDICATORS
    ===================================================== */

    function updateCurrentSongIndicator() {
        const currentId = getSongId(currentTrack);

        document.querySelectorAll("[data-song-id]").forEach(element => {
            const elementId = element.dataset.songId;
            const isCurrent = Boolean(
                currentId && elementId === currentId
            );

            element.classList.toggle("is-current", isCurrent);

            element.classList.toggle(
                "paused",
                isCurrent && Boolean(audioPlayer?.paused)
            );
        });

        document.querySelectorAll("[data-song-file]").forEach(element => {
            const isCurrent = Boolean(
                currentTrack &&
                element.dataset.songFile === getSongFile(currentTrack)
            );

            element.classList.toggle("is-current", isCurrent);

            element.classList.toggle(
                "paused",
                isCurrent && Boolean(audioPlayer?.paused)
            );
        });
    }


    /* =====================================================
       FAVORITES
    ===================================================== */

    function isFavorite(song) {
        const songId = getSongId(song);

        if (!songId) return false;

        return favorites.some(
            favorite => getSongId(favorite) === songId
        );
    }

    function updateFavoriteButton() {
        if (!favoriteBtn) return;

        const hasFavorites = favorites.length > 0;

        favoriteBtn.textContent = hasFavorites ? "♥" : "♡";

        favoriteBtn.setAttribute(
            "aria-label",
            hasFavorites ? "Play favorites" : "No favorites yet"
        );

        favoriteBtn.title = hasFavorites
            ? "Play your favorite songs"
            : "You have no saved favorites";

        favoriteBtn.disabled = !hasFavorites;
    }

    function notifyFavoritesChanged() {
        window.dispatchEvent(
            new CustomEvent("digicafe:favoriteschange", {
                detail: {
                    favorites: favorites.map(song => ({ ...song })),
                    ids: favorites.map(song => getSongId(song))
                }
            })
        );
    }

    function toggleFavorite(song) {
        if (!song || !getSongId(song)) return false;

        if (isFavorite(song)) {
            removeFavorite(song);
            return false;
        }

        return addFavorite(song);
    }

    function addFavorite(song) {
        if (!song || !getSongId(song)) return false;

        if (isFavorite(song)) return true;

        const songId = getSongId(song);

        const librarySong = musicLibrary.find(
            item => getSongId(item) === songId
        );

        favorites.push(librarySong || song);

        saveFavorites();
        updateFavoriteButton();
        updateCurrentSongIndicator();
        notifyFavoritesChanged();

        return true;
    }

    function removeFavorite(song) {
        if (!song || !getSongId(song)) return;

        const songId = getSongId(song);

        favorites = favorites.filter(
            favorite => getSongId(favorite) !== songId
        );

        saveFavorites();
        updateFavoriteButton();
        updateCurrentSongIndicator();
        notifyFavoritesChanged();
    }

    function clearFavorites() {
        favorites = [];

        saveFavorites();
        updateFavoriteButton();
        updateCurrentSongIndicator();
        notifyFavoritesChanged();
    }


    /* =====================================================
       MEDIA SESSION
    ===================================================== */

    function updateMediaSession(song) {
        if (!("mediaSession" in navigator) || !song) return;

        try {
            if ("MediaMetadata" in window) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: getSongTitle(song),
                    artist: getSongArtist(song),
                    album: "DigiCafe Music Lounge"
                });
            }

            navigator.mediaSession.setActionHandler("play", () => {
                audioPlayer?.play().catch(error => {
                    console.warn("Media play failed:", error);
                });
            });

            navigator.mediaSession.setActionHandler("pause", () => {
                audioPlayer?.pause();
            });

            navigator.mediaSession.setActionHandler("nexttrack", nextSong);
            navigator.mediaSession.setActionHandler(
                "previoustrack",
                previousSong
            );

        } catch (error) {
            console.warn("Media Session could not be updated:", error);
        }
    }


    /* =====================================================
       PLAY A SONG
    ===================================================== */

    function playSong(song, list = musicLibrary, playlistName = "library") {
        if (!audioPlayer) {
            console.warn("🎵 Audio player element was not found.");
            return false;
        }

        if (!song || !getSongFile(song)) {
            console.warn("🎵 This song has no playable file:", song);
            return false;
        }

        const selectedList = Array.isArray(list) ? list : musicLibrary;

        playbackList = selectedList.length
            ? [...selectedList]
            : [song];

        const songId = getSongId(song);

        currentIndex = playbackList.findIndex(
            item => getSongId(item) === songId
        );

        if (currentIndex < 0) {
            playbackList.unshift(song);
            currentIndex = 0;
        }

        currentTrack = song;
        activePlaylist = playlistName || "library";

        window.currentGlobalTrack = currentTrack;

        const file = getSongFile(song);

        try {
            audioPlayer.src = new URL(
                file,
                window.location.href
            ).href;
        } catch (error) {
            audioPlayer.src = file;
        }

        audioPlayer.load();

        if (trackTitle) {
            trackTitle.textContent = getSongTitle(song);
        }

        if (trackArtist) {
            trackArtist.textContent = getSongArtist(song);
        }

        if (playbackSource) {
            if (activePlaylist === "favorites") {
                playbackSource.textContent = "Favorites";
            } else if (activePlaylist === "library") {
                playbackSource.textContent = "Music Library";
            } else {
                playbackSource.textContent = activePlaylist;
            }
        }

        if (progressBar) {
            progressBar.value = 0;
        }

        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = "0:00";
        }

        if (durationDisplay) {
            durationDisplay.textContent = "0:00";
        }

        updateFavoriteButton();
        updateCurrentSongIndicator();
        updateMediaSession(song);

        if (playBtn) {
            playBtn.textContent = "⏸";
            playBtn.setAttribute("aria-label", "Pause");
        }

        audioPlayer.play()
            .then(() => {
                console.log("▶️ Playing:", getSongTitle(song));
            })
            .catch(error => {
                console.warn(
                    "Playback did not start automatically. Press Play to try again:",
                    error
                );

                if (playBtn) {
                    playBtn.textContent = "▶";
                    playBtn.setAttribute("aria-label", "Play");
                }
            });

        return true;
    }


    /* =====================================================
       PLAY A CATEGORY
    ===================================================== */

    function playCategory(category = "All", shouldShuffle = isShuffle) {
        if (!musicLibrary.length) {
            console.warn(
                "🎵 The music library is empty. Check music-library.json."
            );
            return false;
        }

        const selectedCategory = String(category || "All").trim();

        let categorySongs;

        if (
            !selectedCategory ||
            selectedCategory.toLowerCase() === "all" ||
            selectedCategory.toLowerCase() === "all music"
        ) {
            categorySongs = [...musicLibrary];
        } else {
            categorySongs = musicLibrary.filter(song =>
                getSongCategory(song).toLowerCase() ===
                selectedCategory.toLowerCase()
            );
        }

        categorySongs = categorySongs.filter(song => getSongFile(song));

        if (!categorySongs.length) {
            console.warn(
                "🎵 No playable songs found for category:",
                selectedCategory
            );
            return false;
        }

        if (shouldShuffle) {
            for (let i = categorySongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));

                [categorySongs[i], categorySongs[j]] =
                    [categorySongs[j], categorySongs[i]];
            }
        }

        const playlistName =
            selectedCategory.toLowerCase() === "all" ||
            selectedCategory.toLowerCase() === "all music"
                ? "library"
                : selectedCategory;

        console.log(
            "🎵 Playing category:",
            playlistName,
            "-",
            categorySongs.length,
            "tracks"
        );

        return playSong(
            categorySongs[0],
            categorySongs,
            playlistName
        );
    }


    /* =====================================================
       PLAYBACK CONTROLS
    ===================================================== */

    function togglePlay() {
        if (!audioPlayer) return;

        if (!currentTrack) {
            if (musicLibrary.length) {
                playSong(musicLibrary[0], musicLibrary, "library");
            } else {
                console.warn("🎵 No music is available to play.");
            }

            return;
        }

        if (audioPlayer.paused) {
            audioPlayer.play().catch(error => {
                console.warn("Could not resume playback:", error);
            });
        } else {
            audioPlayer.pause();
        }
    }

    function nextSong() {
        if (!playbackList.length) {
            if (musicLibrary.length) {
                return playSong(
                    musicLibrary[0],
                    musicLibrary,
                    "library"
                );
            }

            return false;
        }

        let nextIndex;

        if (isShuffle && playbackList.length > 1) {
            do {
                nextIndex = Math.floor(
                    Math.random() * playbackList.length
                );
            } while (nextIndex === currentIndex);
        } else {
            nextIndex = (currentIndex + 1) % playbackList.length;
        }

        return playSong(
            playbackList[nextIndex],
            playbackList,
            activePlaylist
        );
    }

    function previousSong() {
        if (!playbackList.length) return false;

        if (audioPlayer && audioPlayer.currentTime > 3) {
            audioPlayer.currentTime = 0;
            return true;
        }

        const previousIndex =
            (currentIndex - 1 + playbackList.length) %
            playbackList.length;

        return playSong(
            playbackList[previousIndex],
            playbackList,
            activePlaylist
        );
    }


    /* =====================================================
       SHUFFLE
    ===================================================== */

    function updateShuffleButton() {
        if (!shuffleBtn) return;

        shuffleBtn.textContent = isShuffle ? "🔀 ON" : "🔀";

        shuffleBtn.classList.toggle("active-playlist", isShuffle);

        shuffleBtn.setAttribute(
            "aria-pressed",
            String(isShuffle)
        );

        shuffleBtn.setAttribute(
            "aria-label",
            isShuffle ? "Turn shuffle off" : "Turn shuffle on"
        );
    }

    function toggleShuffle() {
        isShuffle = !isShuffle;
        updateShuffleButton();

        console.log(
            "🔀 Shuffle:",
            isShuffle ? "ON" : "OFF"
        );
    }


    /* =====================================================
       PROGRESS AND VOLUME
    ===================================================== */

    function updateProgress() {
        if (!audioPlayer) return;

        const current = audioPlayer.currentTime || 0;
        const duration = audioPlayer.duration || 0;

        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(current);
        }

        if (durationDisplay) {
            durationDisplay.textContent = formatTime(duration);
        }

        if (progressBar && duration > 0) {
            progressBar.value = (current / duration) * 100;
        }

        updateCurrentSongIndicator();
    }

    function seekAudio() {
        if (
            !audioPlayer ||
            !progressBar ||
            !Number.isFinite(audioPlayer.duration) ||
            audioPlayer.duration <= 0
        ) {
            return;
        }

        audioPlayer.currentTime =
            (Number(progressBar.value) / 100) *
            audioPlayer.duration;
    }

    function restoreVolume() {
        const savedVolume = readStorage(VOLUME_KEY, 1);
        const volume = Number(savedVolume);

        const safeVolume = Number.isFinite(volume)
            ? Math.min(1, Math.max(0, volume))
            : 1;

        if (audioPlayer) {
            audioPlayer.volume = safeVolume;
        }

        if (volumeSlider) {
            volumeSlider.value = safeVolume;
        }
    }

    function changeVolume() {
        if (!audioPlayer || !volumeSlider) return;

        const volume = Number(volumeSlider.value);

        audioPlayer.volume = Math.min(1, Math.max(0, volume));

        writeStorage(VOLUME_KEY, audioPlayer.volume);
    }


    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    function attachEventListeners() {
        if (playBtn) {
            playBtn.addEventListener("click", togglePlay);
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", nextSong);
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", previousSong);
        }

        if (shuffleBtn) {
            shuffleBtn.addEventListener("click", toggleShuffle);
        }

        /*
         * The heart button retains its existing role:
         * it plays the saved favorites playlist.
         */
        if (favoriteBtn) {
            favoriteBtn.addEventListener("click", () => {
                if (!favorites.length) {
                    console.warn("♡ You have no saved favorites yet.");
                    return;
                }

                playSong(
                    favorites[0],
                    favorites,
                    "favorites"
                );
            });
        }

        /*
         * Category selector added to the global player HTML.
         */
        if (categoryPlayBtn) {
            categoryPlayBtn.addEventListener("click", () => {
                const selectedCategory =
                    categorySelect?.value || "All";

                playCategory(selectedCategory, isShuffle);
            });
        }

        if (progressBar) {
            progressBar.addEventListener("input", seekAudio);
        }

        if (volumeSlider) {
            volumeSlider.addEventListener("input", changeVolume);
        }

        if (audioPlayer) {
            audioPlayer.addEventListener("timeupdate", updateProgress);

            audioPlayer.addEventListener("loadedmetadata", updateProgress);

            audioPlayer.addEventListener("durationchange", updateProgress);

            audioPlayer.addEventListener("ended", nextSong);

            audioPlayer.addEventListener("play", () => {
                if (playBtn) {
                    playBtn.textContent = "⏸";
                    playBtn.setAttribute("aria-label", "Pause");
                }

                playerElement?.classList.add("is-playing");
                updateCurrentSongIndicator();
            });

            audioPlayer.addEventListener("pause", () => {
                if (playBtn) {
                    playBtn.textContent = "▶";
                    playBtn.setAttribute("aria-label", "Play");
                }

                playerElement?.classList.remove("is-playing");
                updateCurrentSongIndicator();
            });

            audioPlayer.addEventListener("error", () => {
                console.error(
                    "❌ Audio file could not be played:",
                    audioPlayer.currentSrc
                );
            });
        }
    }


    /* =====================================================
       PUBLIC API FOR music.js AND OTHER PAGES
    ===================================================== */

    function publishPlayerAPI() {
        window.DigiCafePlayer = {
            play: playSong,
            next: nextSong,
            previous: previousSong,
            togglePlay: togglePlay,
            playCategory: playCategory,

            getCurrentTrack: () => currentTrack,
            getLibrary: () => [...musicLibrary],
            getFavorites: () => [...favorites],

            isFavorite: isFavorite,
           addFavorite: addFavorite,
toggleFavorite: toggleFavorite,
removeFavorite: removeFavorite,
            clearFavorites: clearFavorites,

            refreshIndicators: updateCurrentSongIndicator,

            getShuffle: () => isShuffle,
            getActivePlaylist: () => activePlaylist
        };

        window.currentGlobalTrack = currentTrack;
    }


    /* =====================================================
       INITIALIZE PLAYER
    ===================================================== */

    window.initMusicPlayer = async function () {
        if (playerInitialized) {
            return window.DigiCafePlayer;
        }

        if (loadingPromise) {
            return loadingPromise;
        }

        loadingPromise = (async () => {
            findPlayerElements();

            if (!audioPlayer) {
                console.warn(
                    "🎵 #audioPlayer was not found. " +
                    "Make sure the global player HTML exists before initializing."
                );

                return null;
            }

            console.log("🎵 Initializing Global Music Player");

            audioPlayer.preload = "metadata";

            restoreVolume();

            await loadMusic();
notifyFavoritesChanged();
            attachEventListeners();

            updateShuffleButton();
            updateFavoriteButton();
            updateCurrentSongIndicator();

            playerInitialized = true;

            publishPlayerAPI();

            console.log(
                "✅ DigiCafe Player Ready:",
                musicLibrary.length,
                "tracks;",
                favorites.length,
                "favorites"
            );

            return window.DigiCafePlayer;
        })();

        try {
            return await loadingPromise;
        } finally {
            loadingPromise = null;
        }
    };

    /* =====================================================
       INITIALIZATION PROMISE — RETRY IF PLAYER HTML ARRIVES LATE
    ===================================================== */

    window.DigiCafePlayerReady = new Promise(resolve => {
        let resolved = false;
        let observer = null;

        function finish(player) {
            if (!player || resolved) return;

            resolved = true;

            if (observer) {
                observer.disconnect();
                observer = null;
            }

            resolve(player);
        }

        async function startPlayer() {
            try {
                const player = await window.initMusicPlayer();

                if (player) {
                    finish(player);
                    return;
                }

                // The HTML may be inserted dynamically.
                if (!observer && document.documentElement) {
                    observer = new MutationObserver(() => {
                        if (document.getElementById("audioPlayer")) {
                            observer.disconnect();
                            observer = null;
                            startPlayer();
                        }
                    });

                    observer.observe(document.documentElement, {
                        childList: true,
                        subtree: true
                    });
                }
            } catch (error) {
                console.error(
                    "❌ DigiCafe player initialization failed:",
                    error
                );
            }
        }

        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                startPlayer,
                { once: true }
            );
        } else {
            startPlayer();
        }
    });
})();
