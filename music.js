
console.log("🎵 DigiCafe Music Lounge JS Loaded");

/*
 * DigiCafe Music Lounge
 * Handles song cards, categories, recent songs,
 * favorites, collections, and player integration.
 */

(function () {
    "use strict";

    let initializationPromise = null;

    window.initMusicLounge = function () {
        if (initializationPromise) {
            return initializationPromise;
        }

        initializationPromise = initializeMusicLounge().catch(error => {
            initializationPromise = null;
            console.error("❌ Music Lounge initialization failed:", error);
            throw error;
        });

        return initializationPromise;
    };

    async function initializeMusicLounge() {
        console.log("🎵 Initializing Music Lounge");

        const libraryBox = document.getElementById("musicLibrary");
        const recentBox = document.getElementById("recentSongs");
        const favoriteList = document.getElementById("favoriteList");
        const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
        const collectionsBox = document.getElementById("musicCollections");

        if (!libraryBox) {
            throw new Error(
                'Could not find "#musicLibrary" in music.html.'
            );
        }

        let musicLibrary = [];
        let activeCategory = "All";
        let favorites = [];

        function loadFavorites() {
            try {
                const saved = localStorage.getItem("musicFavorites");
                const parsed = saved ? JSON.parse(saved) : [];

                favorites = Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.warn("⚠️ Could not read favorites:", error);
                favorites = [];
            }
        }

        function saveFavorites() {
            try {
                localStorage.setItem(
                    "musicFavorites",
                    JSON.stringify(favorites)
                );
            } catch (error) {
                console.error("❌ Could not save favorites:", error);
            }
        }

        function isFavorite(song) {
            return favorites.some(
                item => String(item.id) === String(song.id)
            );
        }

        function getActiveSongs() {
            if (activeCategory === "All") {
                return musicLibrary;
            }

            return musicLibrary.filter(
                song => song.category === activeCategory
            );
        }

        function getCurrentTrack() {
            const player = window.DigiCafePlayer;

            return player &&
                typeof player.getCurrentTrack === "function"
                ? player.getCurrentTrack()
                : null;
        }

        function updateCurrentSongIndicator() {
            const current = getCurrentTrack();

            document.querySelectorAll("[data-song-id]").forEach(element => {
                const isCurrent = current &&
                    String(element.dataset.songId) === String(current.id);

                element.classList.toggle("is-current", Boolean(isCurrent));
            });
        }

        function playSong(song, list, playlistName) {
            if (!song || !song.file) {
                console.error("❌ Song is missing its audio file:", song);
                return;
            }

            const player = window.DigiCafePlayer;

            if (!player || typeof player.play !== "function") {
                console.error(
                    "❌ Global player is not ready. Check music-player.js."
                );
                return;
            }

            player.play(
                song,
                Array.isArray(list) && list.length ? list : musicLibrary,
                playlistName || "library"
            );

            updateCurrentSongIndicator();
        }

        function syncPlayerFavorite(song, shouldBeFavorite) {
            const player = window.DigiCafePlayer;

            if (
                !player ||
                typeof player.isFavorite !== "function" ||
                typeof player.addFavorite !== "function"
            ) {
                return;
            }

            if (player.isFavorite(song) !== shouldBeFavorite) {
                // In this player, addFavorite toggles the favorite state.
                player.addFavorite(song);
            }
        }

        function refreshDisplays() {
            displayMusic(getActiveSongs());
            displayRecent();
            renderFavorites();
            displayCollections();
            updateCurrentSongIndicator();
        }

        function toggleFavorite(song) {
            if (!song) return;

            const existingIndex = favorites.findIndex(
                item => String(item.id) === String(song.id)
            );

            if (existingIndex === -1) {
                favorites.push(song);
            } else {
                favorites.splice(existingIndex, 1);
            }

            saveFavorites();
            syncPlayerFavorite(song, isFavorite(song));
            refreshDisplays();
        }

        function createElement(tag, className, text) {
            const element = document.createElement(tag);

            if (className) element.className = className;
            if (text !== undefined) element.textContent = text;

            return element;
        }

        function createSongCard(song) {
            const card = createElement("article", "song-card");
            card.dataset.songId = String(song.id);

            card.appendChild(
                createElement("h3", "", song.title || "Untitled")
            );

            card.appendChild(
                createElement("p", "", song.category || "Music")
            );

            const buttons = createElement("div", "song-buttons");

            const playButton = createElement("button", "play-song", "▶");
            playButton.type = "button";
            playButton.title = "Play song";
            playButton.setAttribute("aria-label", "Play " + (song.title || "song"));

            playButton.addEventListener("click", () => {
                const list = getActiveSongs();
                playSong(
                    song,
                    list,
                    activeCategory === "All" ? "library" : activeCategory
                );
            });

            const favoriteButton = createElement(
                "button",
                "add-favorite",
                isFavorite(song) ? "♥" : "♡"
            );

            favoriteButton.type = "button";
            favoriteButton.title = isFavorite(song)
                ? "Remove from favorites"
                : "Add to favorites";

            favoriteButton.classList.toggle(
                "active-favorite",
                isFavorite(song)
            );

            favoriteButton.addEventListener("click", () => {
                toggleFavorite(song);
            });

            buttons.append(playButton, favoriteButton);
            card.appendChild(buttons);

            return card;
        }

        function displayMusic(songs) {
            libraryBox.replaceChildren();

            if (!songs.length) {
                libraryBox.appendChild(
                    createElement("p", "", "No songs found in this category.")
                );
                return;
            }

            songs.forEach(song => {
                libraryBox.appendChild(createSongCard(song));
            });

            updateCurrentSongIndicator();
        }

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
                    song.title || "Untitled"
                );

                title.type = "button";
                title.addEventListener("click", () => {
                    playSong(song, favorites, "favorites");
                });

                const remove = createElement(
                    "button",
                    "remove-favorite",
                    "✕"
                );

                remove.type = "button";
                remove.title = "Remove favorite";
                remove.setAttribute("aria-label", "Remove " + (song.title || "favorite"));

                remove.addEventListener("click", () => {
                    toggleFavorite(song);
                });

                item.append(title, remove);
                favoriteList.appendChild(item);
            });
        }

        function displayCollections() {
            if (!collectionsBox) return;

            collectionsBox.replaceChildren();

            const categories = [
                ...new Set(
                    musicLibrary
                        .map(song => song.category)
                        .filter(Boolean)
                )
            ];

            categories.forEach(category => {
                const songs = musicLibrary.filter(
                    song => song.category === category
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
                    header.setAttribute("aria-expanded", String(!body.hidden));
                });

                songs.forEach(song => {
                    const row = createElement("div", "song-row");
                    row.dataset.songId = String(song.id);

                    row.appendChild(
                        createElement("span", "song-title", song.title || "Untitled")
                    );

                    const playButton = createElement("button", "play", "▶");
                    playButton.type = "button";
                    playButton.title = "Play song";
                    playButton.addEventListener("click", () => {
                        playSong(song, songs, category);
                    });

                    const favoriteButton = createElement(
                        "button",
                        "favorite",
                        isFavorite(song) ? "♥" : "♡"
                    );

                    favoriteButton.type = "button";
                    favoriteButton.classList.toggle(
                        "active-favorite",
                        isFavorite(song)
                    );

                    favoriteButton.addEventListener("click", () => {
                        toggleFavorite(song);
                    });

                    row.append(playButton, favoriteButton);
                    body.appendChild(row);
                });

                section.append(header, body);
                collectionsBox.appendChild(section);
            });
        }

        window.loadCategory = function (category) {
            activeCategory = String(category || "All").trim();

            const title = document.getElementById("categoryTitle");

            if (title) {
                title.textContent = activeCategory === "All"
                    ? "All Music"
                    : activeCategory;
            }

            displayMusic(getActiveSongs());
        };

        if (clearFavoritesBtn) {
            clearFavoritesBtn.addEventListener("click", () => {
                if (!favorites.length) return;

                const oldFavorites = [...favorites];
                favorites = [];
                saveFavorites();

                oldFavorites.forEach(song => {
                    syncPlayerFavorite(song, false);
                });

                refreshDisplays();
            });
        }

        loadFavorites();

        try {
            // Resolve relative to music.html, including when its URL has a query string.
            const libraryUrl = new URL("music-library.json", window.location.href);
            const response = await fetch(libraryUrl);

            if (!response.ok) {
                throw new Error(
                    "Could not load music-library.json: HTTP " + response.status
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("music-library.json must contain a JSON array.");
            }

            musicLibrary = data.map((song, index) => ({
                ...song,
                category: typeof song.category === "string"
                    ? song.category.trim()
                    : "Music",
                // Keep IDs from the library; generate one only if missing.
                id: song.id ?? ("song-" + index)
            }));

            const seenIds = new Set();

            musicLibrary.forEach(song => {
                const id = String(song.id);

                if (seenIds.has(id)) {
                    console.warn("⚠️ Duplicate song ID:", id, song.title);
                }

                seenIds.add(id);
            });

            console.log(
                "🎶 Music Lounge loaded " + musicLibrary.length + " songs."
            );

            refreshDisplays();
            console.log("☕ Music Lounge ready.");
        } catch (error) {
            console.error("❌ Music library error:", error);

            libraryBox.replaceChildren(
                createElement(
                    "p",
                    "page-error",
                    "DigiCafe couldn't load the music library. Check the JSON file path and browser console."
                )
            );

            throw error;
        }
    }

    // Start the player first, then the Music Lounge.
    async function startDigiCafeMusic() {
        try {
            if (
                !window.DigiCafePlayer &&
                typeof window.initMusicPlayer === "function"
            ) {
                await window.initMusicPlayer();
            }

            await window.initMusicLounge();
        } catch (error) {
            console.error("❌ DigiCafe Music startup failed:", error);
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
