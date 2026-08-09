console.log("🎵 DigiCafe Music JS Loaded");


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =====================================================
           STATE
        ===================================================== */

        let musicLibrary = [];

        let currentTrack = null;
        let currentIndex = 0;

        let isShuffle = false;

        let playbackList = [];

        let activePlaylist = "library";
        let activeCategory = "All";

        let favorites =
            JSON.parse(
                localStorage.getItem(
                    "musicFavorites"
                )
            ) || [];


        /* =====================================================
           ELEMENTS
        ===================================================== */

        const audio =
            document.getElementById(
                "audioPlayer"
            );

        const player =
            document.querySelector(
                ".player"
            );

        const playBtn =
            document.getElementById(
                "playBtn"
            );

        const nextBtn =
            document.getElementById(
                "nextBtn"
            );

        const prevBtn =
            document.getElementById(
                "prevBtn"
            );

        const shuffleBtn =
            document.getElementById(
                "shuffleBtn"
            );

        const favoriteBtn =
            document.getElementById(
                "favoriteBtn"
            );

        const trackTitle =
            document.getElementById(
                "trackTitle"
            );

        const trackArtist =
            document.getElementById(
                "trackArtist"
            );

        const playbackSource =
            document.getElementById(
                "playbackSource"
            );

        const progressBar =
            document.getElementById(
                "progressBar"
            );

        const currentTime =
            document.getElementById(
                "currentTime"
            );

        const duration =
            document.getElementById(
                "duration"
            );

        const volumeSlider =
            document.getElementById(
                "volumeSlider"
            );

        const musicLibraryBox =
            document.getElementById(
                "musicLibrary"
            );

        const recentSongs =
            document.getElementById(
                "recentSongs"
            );

        const favoriteList =
            document.getElementById(
                "favoriteList"
            );

        const clearFavoritesBtn =
            document.getElementById(
                "clearFavoritesBtn"
            );


        /* =====================================================
           AUDIO CHECK
        ===================================================== */

        if (!audio) {

            console.error(
                "❌ #audioPlayer was not found."
            );

            return;

        }


        /* =====================================================
           LOAD MUSIC
        ===================================================== */

        async function loadMusic() {

            try {

                const response =
                    await fetch(
                        "music-library.json"
                    );


                if (!response.ok) {

                    throw new Error(
                        `Music library could not be loaded. Status: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (!Array.isArray(data)) {

                    throw new Error(
                        "music-library.json must contain an array of songs."
                    );

                }


                /*
                   Clean small data inconsistencies.

                   This removes accidental spaces from
                   category names without changing the
                   original JSON file.
                */

                musicLibrary =
                    data.map(song => ({

                        ...song,

                        category:
                            typeof song.category === "string"
                                ? song.category.trim()
                                : "Music"

                    }));


                displayMusic(
                    musicLibrary
                );

                displayRecent();

                renderFavorites();

                displayCollections();


                console.log(
                    `🎶 Loaded ${musicLibrary.length} songs`
                );


            } catch (error) {

                console.error(
                    "❌ Music library error:",
                    error
                );

            }

        }


        loadMusic();


        /* =====================================================
           FAVORITE CHECK
        ===================================================== */

        function isFavorite(song) {

            if (!song) {

                return false;

            }


            return favorites.some(
                item =>
                    String(item.id) ===
                    String(song.id)
            );

        }


        /* =====================================================
           CREATE SONG CARD
        ===================================================== */

        function createSongCard(song) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "song-card";


            /*
               Used by the currently-playing indicator.
            */

            card.dataset.songId =
                String(song.id);


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
                            isFavorite(song)
                                ? "active-favorite"
                                : ""
                        }"
                        type="button"
                        title="${
                            isFavorite(song)
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }"
                    >
                        ${
                            isFavorite(song)
                                ? "♥"
                                : "♡"
                        }
                    </button>

                </div>

            `;


            /* =================================================
               PLAY SONG
            ================================================= */

            const playButton =
                card.querySelector(
                    ".play-song"
                );


            if (playButton) {

                playButton.onclick =
                    () => {

                        playSong(
                            song,
                            getActiveSongList(),
                            activeCategory === "All"
                                ? "library"
                                : activeCategory
                        );

                    };

            }


            /* =================================================
               FAVORITE
            ================================================= */

            const favoriteButton =
                card.querySelector(
                    ".add-favorite"
                );


            if (favoriteButton) {

                favoriteButton.onclick =
                    () => {

                        addFavorite(
                            song
                        );

                    };

            }


            return card;

        }


        /* =====================================================
           GET ACTIVE SONG LIST
        ===================================================== */

        function getActiveSongList() {

            if (
                activeCategory ===
                "All"
            ) {

                return musicLibrary;

            }


            return musicLibrary.filter(
                song =>
                    (
                        song.category ||
                        ""
                    ).trim() ===
                    activeCategory
            );

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
                !songs.length
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


            /*
               Reapply currently-playing state
               after rebuilding the cards.
            */

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
            function (
                category
            ) {

                /*
                   Remove accidental spaces.
                */

                activeCategory =
                    String(
                        category || "All"
                    ).trim();


                const result =
                    activeCategory ===
                    "All"

                        ? musicLibrary

                        : musicLibrary.filter(
                            song =>
                                (
                                    song.category ||
                                    ""
                                ).trim() ===
                                activeCategory
                        );


                const title =
                    document.getElementById(
                        "categoryTitle"
                    );


                if (title) {

                    title.textContent =
                        activeCategory ===
                        "All"

                            ? "All Music"

                            : activeCategory;

                }


                displayMusic(
                    result
                );

            };


        /* =====================================================
           PLAY SONG
        ===================================================== */

        function playSong(
            song,
            list = musicLibrary,
            playlistName = "library"
        ) {

            if (!song) {

                return;

            }


            if (!song.file) {

                console.error(
                    "❌ Song has no audio file:",
                    song
                );

                return;

            }


            playbackList =
                Array.isArray(list) &&
                list.length

                    ? list

                    : musicLibrary;


            activePlaylist =
                playlistName || "library";


            currentTrack =
                song;


            currentIndex =
                playbackList.findIndex(
                    item =>
                        String(item.id) ===
                        String(song.id)
                );


            if (
                currentIndex <
                0
            ) {

                currentIndex = 0;

            }


            audio.src =
                song.file;


            audio.load();


            if (trackTitle) {

                trackTitle.textContent =
                    song.title ||
                    "Untitled";

            }


            if (trackArtist) {

                trackArtist.textContent =
                    song.artist ||
                    "DaintyJha";

            }


            if (playbackSource) {

                playbackSource.textContent =
                    getPlaybackSourceName(
                        activePlaylist,
                        song
                    );

            }


            updatePlaybackButtons();


            updateMediaSession(
                song
            );


            /*
               Update immediately.

               The play event will update it
               again when the browser actually
               starts playback.
            */

            updateCurrentSongIndicator();


            audio.play()
                .catch(
                    error => {

                        console.warn(
                            "⚠️ Audio playback error:",
                            error
                        );

                        updateCurrentSongIndicator();

                    }
                );

        }


        /* =====================================================
           CURRENTLY PLAYING INDICATOR
        ===================================================== */

        function updateCurrentSongIndicator() {

            const elements =
                document.querySelectorAll(
                    "[data-song-id]"
                );


            elements.forEach(
                element => {

                    const isCurrent =
                        currentTrack &&
                        element.dataset.songId ===
                        String(
                            currentTrack.id
                        );


                    element.classList.toggle(
                        "is-current",
                        Boolean(
                            isCurrent
                        )
                    );


                    element.classList.toggle(
                        "paused",
                        Boolean(
                            isCurrent &&
                            audio.paused
                        )
                    );

                }
            );

        }


        /* =====================================================
           PLAYBACK SOURCE
        ===================================================== */

        function getPlaybackSourceName(
            playlistName,
            song
        ) {

            if (
                playlistName ===
                "favorites"
            ) {

                return "♥ Favorites";

            }


            if (
                playlistName ===
                "library"
            ) {

                return "Music Library";

            }


            return (
                song.category ||
                "Music"
            );

        }


        /* =====================================================
           PLAYBACK BUTTON STATE
        ===================================================== */

        function updatePlaybackButtons() {

            if (!favoriteBtn) {

                return;

            }


            favoriteBtn.classList.toggle(
                "active-playlist",
                activePlaylist ===
                "favorites"
            );

        }


        /* =====================================================
           FAVORITES PLAYER BUTTON
        ===================================================== */

        if (favoriteBtn) {

            favoriteBtn.onclick =
                () => {

                    if (
                        !favorites.length
                    ) {

                        alert(
                            "Your Favorites list is empty."
                        );

                        return;

                    }


                    playSong(
                        favorites[0],
                        favorites,
                        "favorites"
                    );

                };

        }


        /* =====================================================
           PLAY / PAUSE
        ===================================================== */

        if (playBtn) {

            playBtn.onclick =
                () => {

                    if (!currentTrack) {

                        if (
                            musicLibrary.length
                        ) {

                            playSong(
                                musicLibrary[0],
                                musicLibrary,
                                "library"
                            );

                        }

                        return;

                    }


                    if (
                        audio.paused
                    ) {

                        audio.play()
                            .catch(
                                error => {

                                    console.warn(
                                        "⚠️ Unable to resume audio:",
                                        error
                                    );

                                }
                            );

                    } else {

                        audio.pause();

                    }

                };

        }


        /* =====================================================
           NEXT SONG
        ===================================================== */

        if (nextBtn) {

            nextBtn.onclick =
                nextSong;

        }


        function nextSong() {

            if (
                !playbackList.length
            ) {

                return;

            }


            /* SHUFFLE */

            if (isShuffle) {

                let newIndex;


                do {

                    newIndex =
                        Math.floor(
                            Math.random() *
                            playbackList.length
                        );

                } while (
                    newIndex ===
                        currentIndex &&
                    playbackList.length >
                        1
                );


                currentIndex =
                    newIndex;

            }


            /* NORMAL ORDER */

            else {

                currentIndex++;


                if (
                    currentIndex >=
                    playbackList.length
                ) {

                    currentIndex = 0;

                }

            }


            playSong(
                playbackList[
                    currentIndex
                ],
                playbackList,
                activePlaylist
            );

        }


        /* =====================================================
           PREVIOUS SONG
        ===================================================== */

        if (prevBtn) {

            prevBtn.onclick =
                previousSong;

        }


        function previousSong() {

            if (
                !playbackList.length
            ) {

                return;

            }


            currentIndex--;


            if (
                currentIndex <
                0
            ) {

                currentIndex =
                    playbackList.length -
                    1;

            }


            playSong(
                playbackList[
                    currentIndex
                ],
                playbackList,
                activePlaylist
            );

        }


        /* =====================================================
           SHUFFLE
        ===================================================== */

        if (shuffleBtn) {

            shuffleBtn.onclick =
                () => {

                    isShuffle =
                        !isShuffle;


                    shuffleBtn.textContent =
                        isShuffle
                            ? "🔀 ON"
                            : "🔀";


                    shuffleBtn.classList.toggle(
                        "active-playlist",
                        isShuffle
                    );

                };

        }


        /* =====================================================
           AUTO NEXT
        ===================================================== */

        audio.addEventListener(
            "ended",
            nextSong
        );


        /* =====================================================
           PLAYING STATE
        ===================================================== */

        audio.addEventListener(
            "play",
            () => {

                if (player) {

                    player.classList.add(
                        "is-playing"
                    );

                }


                if (playBtn) {

                    playBtn.textContent =
                        "⏸";

                }


                updateCurrentSongIndicator();

            }
        );


        audio.addEventListener(
            "pause",
            () => {

                if (player) {

                    player.classList.remove(
                        "is-playing"
                    );

                }


                if (playBtn) {

                    playBtn.textContent =
                        "▶";

                }


                updateCurrentSongIndicator();

            }
        );


        /* =====================================================
           FAVORITES
        ===================================================== */

        function addFavorite(
            song
        ) {

            if (!song) {

                return;

            }


            const index =
                favorites.findIndex(
                    item =>
                        String(item.id) ===
                        String(song.id)
                );


            if (
                index ===
                -1
            ) {

                favorites.push(
                    song
                );

            } else {

                favorites.splice(
                    index,
                    1
                );

            }


            saveFavorites();


            refreshDisplays();

        }


        /* =====================================================
           SAVE FAVORITES
        ===================================================== */

        function saveFavorites() {

            localStorage.setItem(
                "musicFavorites",
                JSON.stringify(
                    favorites
                )
            );

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


            if (
                !favorites.length
            ) {

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

                        <span>
                            ${
                                song.title ||
                                "Untitled"
                            }
                        </span>

                        <button
                            type="button"
                            title="Remove favorite"
                        >
                            ✕
                        </button>

                    `;


                    const removeButton =
                        li.querySelector(
                            "button"
                        );


                    if (removeButton) {

                        removeButton.onclick =
                            () => {

                                favorites =
                                    favorites.filter(
                                        item =>
                                            String(
                                                item.id
                                            ) !==
                                            String(
                                                song.id
                                            )
                                    );


                                saveFavorites();

                                refreshDisplays();

                            };

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

                    if (
                        !favorites.length
                    ) {

                        return;

                    }


                    favorites = [];


                    saveFavorites();


                    refreshDisplays();

                };

        }


        /* =====================================================
           REFRESH DISPLAYS
        ===================================================== */

        function refreshDisplays() {

            const activeSongs =
                getActiveSongList();


            displayMusic(
                activeSongs
            );


            displayRecent();


            renderFavorites();


            displayCollections();


            updateCurrentSongIndicator();

        }


        /* =====================================================
           PROGRESS BAR
        ===================================================== */

        audio.addEventListener(
            "timeupdate",
            () => {

                if (
                    !Number.isFinite(
                        audio.duration
                    )
                ) {

                    return;

                }


                if (progressBar) {

                    progressBar.value =
                        (
                            audio.currentTime /
                            audio.duration
                        ) *
                        100;

                }


                if (currentTime) {

                    currentTime.textContent =
                        formatTime(
                            audio.currentTime
                        );

                }


                if (duration) {

                    duration.textContent =
                        formatTime(
                            audio.duration
                        );

                }

            }
        );


        /* =====================================================
           PROGRESS SEEK
        ===================================================== */

        if (progressBar) {

            progressBar.oninput =
                () => {

                    if (
                        !Number.isFinite(
                            audio.duration
                        )
                    ) {

                        return;

                    }


                    audio.currentTime =
                        (
                            progressBar.value /
                            100
                        ) *
                        audio.duration;

                };

        }


        /* =====================================================
           FORMAT TIME
        ===================================================== */

        function formatTime(
            time
        ) {

            if (
                Number.isNaN(time) ||
                !Number.isFinite(time)
            ) {

                return "0:00";

            }


            const minutes =
                Math.floor(
                    time / 60
                );


            const seconds =
                Math.floor(
                    time % 60
                )
                .toString()
                .padStart(
                    2,
                    "0"
                );


            return `${minutes}:${seconds}`;

        }


        /* =====================================================
           VOLUME
        ===================================================== */

        if (volumeSlider) {

            const savedVolume =
                localStorage.getItem(
                    "musicVolume"
                );


            if (
                savedVolume !== null
            ) {

                volumeSlider.value =
                    savedVolume;

            }


            audio.volume =
                Number(
                    volumeSlider.value
                );


            volumeSlider.oninput =
                () => {

                    audio.volume =
                        Number(
                            volumeSlider.value
                        );


                    localStorage.setItem(
                        "musicVolume",
                        volumeSlider.value
                    );

                };

        }


        /* =====================================================
           COLLECTIONS
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


                    songs.forEach(
                        song => {

                            const row =
                                document.createElement(
                                    "div"
                                );


                            row.className =
                                "song-row";


                            /*
                               Used by the currently-playing
                               indicator.
                            */

                            row.dataset.songId =
                                String(
                                    song.id
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
                                            isFavorite(
                                                song
                                            )
                                                ? "active-favorite"
                                                : ""
                                        }"
                                        type="button"
                                        title="${
                                            isFavorite(
                                                song
                                            )
                                                ? "Remove from favorites"
                                                : "Add to favorites"
                                        }"
                                    >
                                        ${
                                            isFavorite(
                                                song
                                            )
                                                ? "♥"
                                                : "♡"
                                        }
                                    </button>

                                </div>

                            `;


                            /* PLAY */

                            const playButton =
                                row.querySelector(
                                    ".play"
                                );


                            if (playButton) {

                                playButton.onclick =
                                    () => {

                                        playSong(
                                            song,
                                            songs,
                                            category
                                        );

                                    };

                            }


                            /* FAVORITE */

                            const favoriteButton =
                                row.querySelector(
                                    ".favorite"
                                );


                            if (
                                favoriteButton
                            ) {

                                favoriteButton.onclick =
                                    () => {

                                        addFavorite(
                                            song
                                        );

                                    };

                            }


                            body.appendChild(
                                row
                            );

                        }
                    );


                    /* =================================================
                       COLLECTION OPEN / CLOSE
                    ================================================= */

                    const header =
                        section.querySelector(
                            ".collection-header"
                        );


                    if (header) {

                        header.onclick =
                            () => {

                                section.classList.toggle(
                                    "open"
                                );

                            };

                    }


                    container.appendChild(
                        section
                    );

                }
            );


            /*
               Reapply currently-playing state
               after rebuilding collections.
            */

            updateCurrentSongIndicator();

        }


        /* =====================================================
           MEDIA SESSION
        ===================================================== */

        function updateMediaSession(
            song
        ) {

            if (
                !(
                    "mediaSession"
                    in navigator
                )
            ) {

                return;

            }


            try {

                navigator.mediaSession.metadata =
                    new MediaMetadata({

                        title:
                            song.title ||
                            "Untitled",

                        artist:
                            song.artist ||
                            "DaintyJha",

                        album:
                            song.album ||
                            "DigiCafe"

                    });


                navigator.mediaSession.setActionHandler(
                    "play",
                    () => {

                        audio.play()
                            .catch(
                                error => {

                                    console.warn(
                                        "Media Session play error:",
                                        error
                                    );

                                }
                            );

                    }
                );


                navigator.mediaSession.setActionHandler(
                    "pause",
                    () => {

                        audio.pause();

                    }
                );


                navigator.mediaSession.setActionHandler(
                    "nexttrack",
                    () => {

                        nextSong();

                    }
                );


                navigator.mediaSession.setActionHandler(
                    "previoustrack",
                    () => {

                        previousSong();

                    }
                );

            } catch (error) {

                console.warn(
                    "⚠️ Media Session error:",
                    error
                );

            }

        }

    }
);
