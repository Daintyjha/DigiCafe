
console.log("🎵 DigiCafe Music Lounge JS Loaded");

/*
 * DigiCafe Music Lounge
 * Handles:
 * - Song cards and playback
 * - Categories and collections
 * - Recently added songs
 * - Favorites synchronized with the global player
 * - Legacy favorites migration
 * - Reliable initialization
 */

(function () {
    "use strict";

    let initializationPromise = null;
    let musicLibrary = [];
    let favorites = [];
    let activeCategory = "All";
    let eventsAttached = false;
    let favoritesListenerAttached = false;

    let libraryBox = null;
    let recentBox = null;
    let favoriteList = null;
    let clearFavoritesBtn = null;
    let collectionsBox = null;

    /* =====================================================
       SONG HELPERS
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
        return song?.title || song?.name || "Untitled";
    }

    function getSongCategory(song) {
        return String(song?.category || "Music").trim();
    }

    /* =====================================================
       LEGACY FAVORITES MIGRATION
    ===================================================== */

    function migrateLegacyFavorites() {
        try {
            const current = localStorage.getItem("digiCafeFavorites");

            // Never overwrite favorites already stored by the player.
            if (current !== null) return;

            const legacy = localStorage.getItem("musicFavorites");

            if (!legacy) return;

            const oldFavorites = JSON.parse(legacy);

            if (!Array.isArray(oldFavorites)) return;

            const ids = [
                ...new Set(
                    oldFavorites
                        .map(song =>
                            typeof song === "string"
                                ? song
                                : getSongId(song)
                        )
                        .filter(Boolean)
                )
            ];

            localStorage.setItem(
                "digiCafeFavorites",
                JSON.stringify(ids)
            );

            console.log(
                "❤️ Migrated legacy favorites:",
                ids.length
            );

            // Keep the old key for now as a backup.
        } catch (error) {
            console.warn(
                "⚠️ Legacy favorites migration failed:",
                error
            );
        }
    }

    /* =====================================================
       GLOBAL PLAYER ACCESS
    ===================================================== */

    function getPlayer() {
        return window.DigiCafePlayer || null;
    }

    function loadFavorites() {
        const player = getPlayer();

        favorites = player &&
            typeof player.getFavorites === "function"
            ? player.getFavorites()
            : [];
    }

    function isFavorite(song) {
        const player = getPlayer();

        if (player && typeof player.isFavorite === "function") {
            return player.isFavorite(song);
        }

        const id = getSongId(song);

        return Boolean(id) && favorites.some(
            item => getSongId(item) === id
        );
    }

    function syncPlayerFavorite(song, shouldBeFavorite) {
        const player = getPlayer();

        if (!player || !song) return;

        if (shouldBeFavorite) {
            if (!player.isFavorite(song)) {
                player.addFavorite(song);
            }
        } else if (player.isFavorite(song)) {
            player.removeFavorite(song);
        }

        loadFavorites();
    }

    /* =====================================================
       CURRENT TRACK
    ===================================================== */

    function getCurrentTrack() {
        const player = getPlayer();

        return player &&
            typeof player.getCurrentTrack === "function"
            ? player.getCurrentTrack()
            : null;
    }

    function updateCurrentSongIndicator() {
        const current = getCurrentTrack();
        const currentId = getSongId(current);
        const currentFile = getSongFile(current);

        document.querySelectorAll("[data-song-id]").forEach(element => {
            const matches = Boolean(
                currentId &&
                element.dataset.songId === currentId
            );

            element.classList.toggle("is-current", matches);
        });

        document.querySelectorAll("[data-song-file]").forEach(element => {
            const matches = Boolean(
                currentFile &&
                element.dataset.songFile === currentFile
            );

            element.classList.toggle("is-current", matches);
        });
    }

    /* =====================================================
       PLAYBACK
    ===================================================== */

    function playSong(song, list, playlistName) {
        if (!song || !getSongFile(song)) {
            console.error("❌ Song is missing its audio file:", song);
            return false;
        }

        const player = getPlayer();

        if (!player || typeof player.play !== "function") {
            console.error(
                "❌ Global player is not ready. Check music-player.js."
            );

            return false;
        }

        const playlist = Array.isArray(list) && list.length
            ? list
            : musicLibrary;

        const result = player.play(
            song,
            playlist,
            playlistName || "library"
        );

        updateCurrentSongIndicator();

        return result;
    }

    /* =====================================================
       CATEGORY FILTERING
    ===================================================== */

    function getActiveSongs() {
        if (
            !activeCategory ||
            activeCategory.toLowerCase() === "all" ||
            activeCategory.toLowerCase() === "all music"
        ) {
            return musicLibrary;
        }

        return musicLibrary.filter(
            song =>
                getSongCategory(song).toLowerCase() ===
                activeCategory.toLowerCase()
        );
    }

    /* =====================================================
       ELEMENT HELPERS
    ===================================================== */

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function createFavoriteButton(song, className) {
        const button = createElement(
            "button",
            className,
            isFavorite(song) ? "♥" : "♡"
        );

        button.type = "button";

        function updateButton() {
            const active = isFavorite(song);

            button.textContent = active ? "♥" : "♡";
            button.title = active
                ? "Remove from favorites"
                : "Add to favorites";

            button.setAttribute(
                "aria-label",
                active
                    ? "Remove " + getSongTitle(song) + " from favorites"
                    : "Add " + getSongTitle(song) + " to favorites"
            );

            button.classList.toggle("active-favorite", active);
        }

        updateButton();

        button.addEventListener("click", () => {
            toggleFavorite(song);
        });

        return button;
    }

    /* =====================================================
       SONG CARDS
    ===================================================== */

    function createSongCard(song) {
        const card = createElement("article", "song-card");

        card.dataset.songId = getSongId(song);

        card.appendChild(
            createElement("h3", "", getSongTitle(song))
        );

        card.appendChild(
            createElement("p", "", getSongCategory(song))
        );

        const buttons = createElement("div", "song-buttons");

        const playButton = createElement(
            "button",
            "play-song",
            "▶"
        );

        playButton.type = "button";
        playButton.title = "Play song";

        playButton.setAttribute(
            "aria-label",
            "Play " + getSongTitle(song)
        );

        playButton.addEventListener("click", () => {
            const categorySongs = getActiveSongs();

            playSong(
                song,
                categorySongs,
                activeCategory === "All"
                    ? "library"
                    : activeCategory
            );
        });

        const favoriteButton = createFavoriteButton(
            song,
            "add-favorite"
        );

        buttons.append(playButton, favoriteButton);
        card.appendChild(buttons);

        return card;
    }

    /* =====================================================
       DISPLAY MUSIC LIBRARY
    ===================================================== */

    function displayMusic(songs) {
        if (!libraryBox) return;

        libraryBox.replaceChildren();

        if (!songs.length) {
            libraryBox.appendChild(
                createElement(
                    "p",
                    "",
                    "No songs found in this category."
                )
            );

            return;
        }

        songs.forEach(song => {
            libraryBox.appendChild(createSongCard(song));
        });

        updateCurrentSongIndicator();
    }

    /* =====================================================
       RECENTLY ADDED SONGS
    ===================================================== */

    function displayRecent() {
        if (!recentBox) return;

        recentBox.replaceChildren();

        const recent = [...musicLibrary]
            .sort((a, b) => {
                const dateA = Date.parse(a.dateAdded || "") || 0;
                const dateB = Date.parse(b.dateAdded || "") || 0;

                return dateB - dateA;
            })
            .slice(0, 6);

        if (!recent.length) {
            recentBox.appendChild(
                createElement("p", "", "No recent songs.")
            );

            return;
        }

        recent.forEach(song => {
            recentBox.appendChild(createSongCard(song));
        });
    }

    /* =====================================================
       FAVORITES LIST
    ===================================================== */

    function renderFavorites() {
        if (!favoriteList) return;

        favoriteList.replaceChildren();

        if (!favorites.length) {
            favoriteList.appendChild(
                createElement("li", "", "No favorite songs yet")
            );

            return;
        }

        favorites.forEach(song => {
            const item = createElement("li");

            const title = createElement(
                "button",
                "favorite-song-title",
                getSongTitle(song)
            );

            title.type = "button";

            title.addEventListener("click", () => {
                playSong(favorites.length ? song : null, favorites, "favorites");
            });

            const remove = createElement(
                "button",
                "remove-favorite",
                "✕"
            );

            remove.type = "button";
            remove.title = "Remove favorite";

            remove.setAttribute(
                "aria-label",
                "Remove " + getSongTitle(song) + " from favorites"
            );

            remove.addEventListener("click", () => {
                const player = getPlayer();

                if (player) {
                    player.removeFavorite(song);
                }

                loadFavorites();
                refreshDisplays();
            });

            item.append(title, remove);
            favoriteList.appendChild(item);
        });
    }

    /* =====================================================
       MUSIC COLLECTIONS
    ===================================================== */

    function displayCollections() {
        if (!collectionsBox) return;

        collectionsBox.replaceChildren();

        const categories = [
            ...new Set(
                musicLibrary
                    .map(song => getSongCategory(song))
                    .filter(Boolean)
            )
        ];

        categories.forEach(category => {
            const songs = musicLibrary.filter(
                song =>
                    getSongCategory(song).toLowerCase() ===
                    category.toLowerCase()
            );

            const section = createElement("section", "collection");

            const header = createElement(
                "button",
                "collection-header",
                category + " (" + songs.length + " songs)"
            );

            header.type = "button";
            header.setAttribute("aria-expanded", "false");

            const body = createElement("div", "collection-body");
            body.hidden = true;

            header.addEventListener("click", () => {
                body.hidden = !body.hidden;

                section.classList.toggle("open", !body.hidden);

                header.setAttribute(
                    "aria-expanded",
                    String(!body.hidden)
                );
            });

            songs.forEach(song => {
                const row = createElement("div", "song-row");

                row.dataset.songId = getSongId(song);

                row.appendChild(
                    createElement(
                        "span",
                        "song-title",
                        getSongTitle(song)
                    )
                );

                const playButton = createElement(
                    "button",
                    "play",
                    "▶"
                );

                playButton.type = "button";
                playButton.title = "Play song";

                playButton.addEventListener("click", () => {
                    playSong(song, songs, category);
                });

                const favoriteButton = createFavoriteButton(
                    song,
                    "favorite"
                );

                row.append(playButton, favoriteButton);
                body.appendChild(row);
            });

            section.append(header, body);
            collectionsBox.appendChild(section);
        });
    }

    /* =====================================================
       REFRESH DISPLAYS
    ===================================================== */

    function refreshDisplays() {
        loadFavorites();

        displayMusic(getActiveSongs());
        displayRecent();
        renderFavorites();
        displayCollections();
        updateCurrentSongIndicator();
    }

    /* =====================================================
       FAVORITE ACTION
    ===================================================== */

    function toggleFavorite(song) {
        const player = getPlayer();

        if (!player || !song) {
            console.error("❌ Player is not ready to update favorites.");
            return;
        }

        if (player.isFavorite(song)) {
            player.removeFavorite(song);
        } else {
            player.addFavorite(song);
        }

        loadFavorites();
        refreshDisplays();
    }

    /* =====================================================
       CATEGORY BUTTON API
    ===================================================== */

    window.loadCategory = function (category) {
        activeCategory = String(category || "All").trim();

        const title = document.getElementById("categoryTitle");

        if (title) {
            title.textContent =
                activeCategory.toLowerCase() === "all" ||
                activeCategory.toLowerCase() === "all music"
                    ? "All Music"
                    : activeCategory;
        }

        displayMusic(getActiveSongs());
    };

    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    function attachLoungeEvents() {
        if (eventsAttached) return;

        eventsAttached = true;

        if (clearFavoritesBtn) {
            clearFavoritesBtn.addEventListener("click", () => {
                const player = getPlayer();

                if (!player || !favorites.length) return;

                player.clearFavorites();

                loadFavorites();
                refreshDisplays();
            });
        }

        window.addEventListener("digicafe:favoriteschange", () => {
            loadFavorites();
            refreshDisplays();
        });

        // Refresh if favorites change in another browser tab.
        window.addEventListener("storage", event => {
            if (
                event.key !== "digiCafeFavorites" &&
                event.key !== "musicFavorites"
            ) {
                return;
            }

            loadFavorites();
            refreshDisplays();
        });

        favoritesListenerAttached = true;
    }

    /* =====================================================
       INITIALIZE MUSIC LOUNGE
    ===================================================== */

    async function initializeMusicLounge() {
        console.log("🎵 Initializing Music Lounge");

        libraryBox = document.getElementById("musicLibrary");
        recentBox = document.getElementById("recentSongs");
        favoriteList = document.getElementById("favoriteList");

        clearFavoritesBtn = document.getElementById(
            "clearFavoritesBtn"
        );

        collectionsBox = document.getElementById("musicCollections");

        if (!libraryBox) {
            throw new Error(
                'Could not find "#musicLibrary" in music.html.'
            );
        }

        // Load the player-owned favorites after the player is ready.
        loadFavorites();

        const libraryUrl = new URL(
            "music-library.json",
            window.location.href
        );

        const response = await fetch(libraryUrl, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                "Could not load music-library.json: HTTP " +
                response.status
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "music-library.json must contain a JSON array."
            );
        }

        musicLibrary = data
            .filter(song => song && typeof song === "object")
            .map((song, index) => ({
                ...song,

                id:
                    song.id ??
                    song.songId ??
                    song.file ??
                    song.url ??
                    song.title ??
                    ("song-" + index),

                category: getSongCategory(song)
            }));

        const seenIds = new Set();

        musicLibrary.forEach(song => {
            const id = getSongId(song);

            if (seenIds.has(id)) {
                console.warn(
                    "⚠️ Duplicate song ID:",
                    id,
                    getSongTitle(song)
                );
            }

            seenIds.add(id);
        });

        console.log(
            "🎶 Music Lounge loaded",
            musicLibrary.length,
            "songs."
        );

        attachLoungeEvents();

        refreshDisplays();

        console.log("☕ Music Lounge ready.");

        return true;
    }

    /* =====================================================
       PUBLIC INITIALIZATION API
    ===================================================== */

    window.initMusicLounge = function () {
        if (initializationPromise) {
            return initializationPromise;
        }

        initializationPromise = initializeMusicLounge().catch(error => {
            initializationPromise = null;

            console.error(
                "❌ Music Lounge initialization failed:",
                error
            );

            throw error;
        });

        return initializationPromise;
    };

    /* =====================================================
       STARTUP
    ===================================================== */

    async function startDigiCafeMusic() {
        try {
            // Migrate old favorites before the player reads its storage.
            migrateLegacyFavorites();

            // Wait for the global player to initialize.
            if (typeof window.initMusicPlayer === "function") {
                const player = await window.initMusicPlayer();

                if (!player && window.DigiCafePlayerReady) {
                    await window.DigiCafePlayerReady;
                }
            }

            if (!getPlayer()) {
                throw new Error(
                    "Global player is not ready. Check #audioPlayer and music-player.js."
                );
            }

            await window.initMusicLounge();
        } catch (error) {
            console.error(
                "❌ DigiCafe Music startup failed:",
                error
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startDigiCafeMusic,
            { once: true }
        );
    } else {
        startDigiCafeMusic();
    }

})();
