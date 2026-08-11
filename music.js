console.log("🎵 DigiCafe Music Lounge JS Loaded");


/* =========================================================
   DIGICAFE MUSIC LOUNGE
   =========================================================

   This file controls ONLY the Music Lounge interface.

   music-player.js controls:
   - audio
   - play / pause
   - next / previous
   - shuffle
   - progress
   - volume
   - media session
   - current track

   music.js controls:
   - music library display
   - categories
   - song cards
   - recent songs
   - favorites
   - collections
   - sending songs to global player
========================================================= */


window.initMusicLounge = async function () {

    console.log("🎵 Initializing Music Lounge");


    /* =====================================================
       STATE
    ===================================================== */

    let musicLibrary = [];

    let activeCategory = "All";

    let favorites = [];


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const musicLibraryBox =
        document.getElementById("musicLibrary");

    const recentSongs =
        document.getElementById("recentSongs");

    const favoriteList =
        document.getElementById("favoriteList");

    const clearFavoritesBtn =
        document.getElementById("clearFavoritesBtn");


    /* =====================================================
       LOAD FAVORITES
    ===================================================== */

    function loadFavorites() {

        try {

            const saved =
                localStorage.getItem(
                    "musicFavorites"
                );

            favorites =
                saved
                    ? JSON.parse(saved)
                    : [];


            if (!Array.isArray(favorites)) {

                favorites = [];

            }

        } catch (error) {

            console.warn(
                "⚠️ Could not load favorites:",
                error
            );

            favorites = [];

        }

    }


    /* =====================================================
       SAVE FAVORITES
    ===================================================== */

    function saveFavorites() {

        try {

            localStorage.setItem(
                "musicFavorites",
                JSON.stringify(favorites)
            );

        } catch (error) {

            console.error(
                "❌ Could not save favorites:",
                error
            );

        }

    }


    /* =====================================================
       FAVORITE CHECK
    ===================================================== */

    function isFavorite(song) {

        if (!song) {

            return false;

        }


        return favorites.some(
            favorite =>
                String(favorite.id) ===
                String(song.id)
        );

    }


    /* =====================================================
       LOAD MUSIC LIBRARY
    ===================================================== */

    async function loadMusic() {

        try {

            const response =
                await fetch(
                    "music-library.json"
                );


            if (!response.ok) {

                throw new Error(
                    `Music library could not be loaded: ${response.status}`
                );

            }


            const data =
                await response.json();


            if (!Array.isArray(data)) {

                throw new Error(
                    "music-library.json must contain an array."
                );

            }


            musicLibrary =
                data.map(song => ({

                    ...song,

                    category:
                        typeof song.category === "string"

                            ? song.category.trim()

                            : "Music"

                }));


            console.log(
                `🎶 Music Lounge loaded ${musicLibrary.length} songs`
            );


            displayMusic(
                musicLibrary
            );

            displayRecent();

            renderFavorites();

            displayCollections();


        } catch (error) {

            console.error(
                "❌ Music library error:",
                error
            );


            if (musicLibraryBox) {

                musicLibraryBox.innerHTML = `

                    <p class="page-error">
                        ☕ DigiCafe couldn't load the music library.
                    </p>

                `;

            }

        }

    }


    /* =====================================================
       ACTIVE SONG LIST
    ===================================================== */

    function getActiveSongList() {

        if (
            activeCategory === "All"
        ) {

            return musicLibrary;

        }


        return musicLibrary.filter(
            song =>

                (
                    song.category || ""
                ).trim() ===
                activeCategory

        );

    }


    /* =====================================================
       PLAY SONG
       =====================================================

       IMPORTANT:

       There is NO audio element here.

       The song is sent to the permanent
       DigiCafe global music player.
    ===================================================== */

    function playSong(
        song,
        list = musicLibrary,
        playlistName = "library"
    ) {

        if (!song) {

            console.warn(
                "⚠️ No song supplied."
            );

            return;

        }


        if (!song.file) {

            console.error(
                "❌ Song has no audio file:",
                song
            );

            return;

        }


        if (
            !window.DigiCafePlayer ||
            typeof window.DigiCafePlayer.play !==
                "function"
        ) {

            console.error(
                "❌ DigiCafe global music player is not ready."
            );

            return;

        }


        console.log(
            "▶ Playing:",
            song.title
        );


        window.DigiCafePlayer.play(
            song,
            Array.isArray(list) && list.length
                ? list
                : musicLibrary,
            playlistName || "library"
        );


        updateCurrentSongIndicator();

    }


    /* =====================================================
       CREATE SONG CARD
    ===================================================== */

    function createSongCard(song) {

        const card =
            document.createElement("div");


        card.className =
            "song-card";


        card.dataset.songId =
            String(song.id);


        const favorite =
            isFavorite(song);


        card.innerHTML = `

            <h3>
                ${song.title || "Untitled"}
            </h3>

            <p>
                ${song.category || "Music"}
            </p>

            <div class="song-buttons">

                <button
                    class="play-song"
                    type="button"
                    title="Play song"
                >
                    ▶
                </button>

                <button
                    class="add-favorite ${
                        favorite
                            ? "active-favorite"
                            : ""
                    }"
                    type="button"
                    title="${
                        favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }"
                >
                    ${
                        favorite
                            ? "♥"
                            : "♡"
                    }
                </button>

            </div>

        `;


        /* =================================================
           PLAY BUTTON
        ================================================= */

        const playButton =
            card.querySelector(
                ".play-song"
            );


        if (playButton) {

            playButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const list =
                        getActiveSongList();


                    playSong(
                        song,
                        list,
                        activeCategory === "All"
                            ? "library"
                            : activeCategory
                    );

                }
            );

        }


        /* =================================================
           FAVORITE BUTTON
        ================================================= */

        const favoriteButton =
            card.querySelector(
                ".add-favorite"
            );


        if (favoriteButton) {

            favoriteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    toggleFavorite(
                        song
                    );

                }
            );

        }


        return card;

    }


    /* =====================================================
       DISPLAY MUSIC
    ===================================================== */

    function displayMusic(
        songs
    ) {

        if (!musicLibraryBox) {

            return;

        }


        musicLibraryBox.innerHTML =
            "";


        if (
            !Array.isArray(songs) ||
            songs.length === 0
        ) {

            musicLibraryBox.innerHTML = `

                <p>
                    No songs found.
                </p>

            `;

            return;

        }


        songs.forEach(
            song => {

                musicLibraryBox.appendChild(
                    createSongCard(
                        song
                    )
                );

            }
        );


        updateCurrentSongIndicator();

    }


    /* =====================================================
       RECENT SONGS
    ===================================================== */

    function displayRecent() {

        if (!recentSongs) {

            return;

        }


        recentSongs.innerHTML =
            "";


        const recent =
            [...musicLibrary]
                .sort(
                    (a, b) => {

                        return (
                            new Date(
                                b.dateAdded || 0
                            ) -
                            new Date(
                                a.dateAdded || 0
                            )
                        );

                    }
                )
                .slice(
                    0,
                    6
                );


        if (!recent.length) {

            recentSongs.innerHTML = `

                <p>
                    No recent songs.
                </p>

            `;

            return;

        }


        recent.forEach(
            song => {

                recentSongs.appendChild(
                    createSongCard(
                        song
                    )
                );

            }
        );


        updateCurrentSongIndicator();

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    window.loadCategory =
        function(category) {

            activeCategory =
                String(
                    category || "All"
                ).trim();


            const songs =
                getActiveSongList();


            const categoryTitle =
                document.getElementById(
                    "categoryTitle"
                );


            if (categoryTitle) {

                categoryTitle.textContent =
                    activeCategory === "All"

                        ? "All Music"

                        : activeCategory;

            }


            displayMusic(
                songs
            );


            console.log(
                `🎧 Category: ${activeCategory}`
            );

        };


    /* =====================================================
       TOGGLE FAVORITE
    ===================================================== */

    function toggleFavorite(song) {

        if (!song) {

            return;

        }


        const index =
            favorites.findIndex(
                favorite =>
                    String(favorite.id) ===
                    String(song.id)
            );


        if (index === -1) {

            favorites.push(
                song
            );

            console.log(
                "♥ Added to favorites:",
                song.title
            );

        } else {

            favorites.splice(
                index,
                1
            );

            console.log(
                "♡ Removed from favorites:",
                song.title
            );

        }


        saveFavorites();


        /*
           Tell the global player to
           update its favorite state too.
        */

        if (
            window.DigiCafePlayer &&
            typeof window.DigiCafePlayer.addFavorite ===
                "function"
        ) {

            /*
               The global player uses addFavorite()
               as a toggle.
            */

            const playerFavorite =
                typeof window.DigiCafePlayer.isFavorite ===
                "function"

                    ? window.DigiCafePlayer.isFavorite(
                        song
                    )

                    : false;


            /*
               Only sync if our local state
               and player state differ.
            */

            const localFavorite =
                isFavorite(song);


            if (
                playerFavorite !==
                localFavorite
            ) {

                window.DigiCafePlayer.addFavorite(
                    song
                );

            }

        }


        refreshDisplays();

    }


    /* =====================================================
       RENDER FAVORITES
    ===================================================== */

    function renderFavorites() {

        if (!favoriteList) {

            return;

        }


        favoriteList.innerHTML =
            "";


        if (!favorites.length) {

            favoriteList.innerHTML = `

                <li>
                    No favorite songs yet
                </li>

            `;

            return;

        }


        favorites.forEach(
            song => {

                const li =
                    document.createElement(
                        "li"
                    );


                li.innerHTML = `

                    <span
                        class="favorite-song-title"
                    >
                        ${song.title || "Untitled"}
                    </span>

                    <button
                        type="button"
                        title="Remove favorite"
                        class="remove-favorite"
                    >
                        ✕
                    </button>

                `;


                /* =================================================
                   PLAY FAVORITE
                ================================================= */

                const title =
                    li.querySelector(
                        ".favorite-song-title"
                    );


                if (title) {

                    title.addEventListener(
                        "click",
                        () => {

                            playSong(
                                song,
                                favorites,
                                "favorites"
                            );

                        }
                    );

                }


                /* =================================================
                   REMOVE FAVORITE
                ================================================= */

                const removeButton =
                    li.querySelector(
                        ".remove-favorite"
                    );


                if (removeButton) {

                    removeButton.addEventListener(
                        "click",
                        () => {

                            toggleFavorite(
                                song
                            );

                        }
                    );

                }


                favoriteList.appendChild(
                    li
                );

            }
        );

    }


    /* =====================================================
       CLEAR FAVORITES
    ===================================================== */

    if (clearFavoritesBtn) {

        clearFavoritesBtn.onclick =
            () => {

                if (!favorites.length) {

                    return;

                }


                favorites = [];


                saveFavorites();


                /*
                   If the global player exposes
                   the current track, refresh
                   its favorite button.
                */

                if (
                    window.DigiCafePlayer &&
                    typeof window.DigiCafePlayer.getCurrentTrack ===
                        "function"
                ) {

                    const current =
                        window.DigiCafePlayer.getCurrentTrack();


                    if (
                        current &&
                        typeof window.DigiCafePlayer.isFavorite ===
                            "function"
                    ) {

                        /*
                           The global player may still
                           have the old favorite list
                           internally.

                           We simply refresh the
                           Music Lounge UI here.
                        */

                        console.log(
                            "♥ Favorites cleared."
                        );

                    }

                }


                refreshDisplays();

            };

    }


    /* =====================================================
       REFRESH DISPLAYS
    ===================================================== */

    function refreshDisplays() {

        loadFavorites();


        displayMusic(
            getActiveSongList()
        );


        displayRecent();


        renderFavorites();


        displayCollections();


        updateCurrentSongIndicator();

    }


    /* =====================================================
       CURRENT SONG INDICATOR
    ===================================================== */

    function updateCurrentSongIndicator() {

        let current = null;


        if (
            window.DigiCafePlayer &&
            typeof window.DigiCafePlayer.getCurrentTrack ===
                "function"
        ) {

            current =
                window.DigiCafePlayer.getCurrentTrack();

        }


        document
            .querySelectorAll(
                "[data-song-id]"
            )
            .forEach(
                element => {

                    const isCurrent =
                        current &&
                        element.dataset.songId ===
                        String(
                            current.id
                        );


                    element.classList.toggle(
                        "is-current",
                        Boolean(
                            isCurrent
                        )
                    );

                }
            );

    }


    /* =====================================================
       MUSIC COLLECTIONS
    ===================================================== */

    function displayCollections() {

        const container =
            document.getElementById(
                "musicCollections"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        const categories =
            [
                ...new Set(
                    musicLibrary
                        .map(
                            song =>
                                (
                                    song.category ||
                                    ""
                                ).trim()
                        )
                        .filter(Boolean)
                )
            ];


        categories.forEach(
            category => {

                const section =
                    document.createElement(
                        "div"
                    );


                section.className =
                    "collection";


                const songs =
                    musicLibrary.filter(
                        song =>
                            (
                                song.category ||
                                ""
                            ).trim() ===
                            category
                    );


                section.innerHTML = `

                    <div
                        class="collection-header"
                    >

                        <span>
                            ${category}
                        </span>

                        <span>
                            ▶
                        </span>

                    </div>


                    <div
                        class="collection-body"
                    ></div>

                `;


                const body =
                    section.querySelector(
                        ".collection-body"
                    );


                /* =================================================
                   COLLECTION SONGS
                ================================================= */

                songs.forEach(
                    song => {

                        const row =
                            document.createElement(
                                "div"
                            );


                        row.className =
                            "song-row";


                        row.dataset.songId =
                            String(
                                song.id
                            );


                        const favorite =
                            isFavorite(
                                song
                            );


                        row.innerHTML = `

                            <div
                                class="song-title"
                            >
                                ${
                                    song.title ||
                                    "Untitled"
                                }
                            </div>


                            <div
                                class="song-actions"
                            >

                                <button
                                    class="play"
                                    type="button"
                                    title="Play song"
                                >
                                    ▶
                                </button>


                                <button
                                    class="favorite ${
                                        favorite
                                            ? "active-favorite"
                                            : ""
                                    }"
                                    type="button"
                                    title="${
                                        favorite
                                            ? "Remove favorite"
                                            : "Add favorite"
                                    }"
                                >
                                    ${
                                        favorite
                                            ? "♥"
                                            : "♡"
                                    }
                                </button>

                            </div>

                        `;


                        /* =================================================
                           PLAY
                        ================================================= */

                        const playButton =
                            row.querySelector(
                                ".play"
                            );


                        if (playButton) {

                            playButton.addEventListener(
                                "click",
                                event => {

                                    event.stopPropagation();


                                    playSong(
                                        song,
                                        songs,
                                        category
                                    );

                                }
                            );

                        }


                        /* =================================================
                           FAVORITE
                        ================================================= */

                        const favoriteButton =
                            row.querySelector(
                                ".favorite"
                            );


                        if (
                            favoriteButton
                        ) {

                            favoriteButton.addEventListener(
                                "click",
                                event => {

                                    event.stopPropagation();


                                    toggleFavorite(
                                        song
                                    );

                                }
                            );

                        }


                        body.appendChild(
                            row
                        );

                    }
                );


                /* =================================================
                   OPEN / CLOSE COLLECTION
                ================================================= */

                const header =
                    section.querySelector(
                        ".collection-header"
                    );


                if (header) {

                    header.addEventListener(
                        "click",
                        () => {

                            section.classList.toggle(
                                "open"
                            );

                        }
                    );

                }


                container.appendChild(
                    section
                );

            }
        );


        updateCurrentSongIndicator();

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadFavorites();


    await loadMusic();


    console.log(
        "☕ Music Lounge ready."
    );

};
