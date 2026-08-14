console.log("🎵 DigiCafe Global Music Player Loaded");


/* =====================================================
   GLOBAL MUSIC PLAYER
===================================================== */

window.initMusicPlayer = async function () {

    console.log("🎵 Initializing Global Music Player");


    /* =====================================================
       STATE
    ===================================================== */

    let musicLibrary = [];

    let currentTrack = null;

    let currentIndex = 0;

    let playbackList = [];

    let activePlaylist = "library";

    let isShuffle = false;


    let favorites =
        JSON.parse(
            localStorage.getItem("musicFavorites")
        ) || [];


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const audio =
        document.getElementById("audioPlayer");


    const player =
        document.querySelector(".player");


    const playBtn =
        document.getElementById("playBtn");


    const nextBtn =
        document.getElementById("nextBtn");


    const prevBtn =
        document.getElementById("prevBtn");


    const shuffleBtn =
        document.getElementById("shuffleBtn");


    const favoriteBtn =
        document.getElementById("favoriteBtn");


    const trackTitle =
        document.getElementById("trackTitle");

const trackArtist =
    document.getElementById("trackArtist");

    const playbackSource =
        document.getElementById("playbackSource");


    const progressBar =
        document.getElementById("progressBar");


    const currentTime =
        document.getElementById("currentTime");


    const duration =
        document.getElementById("duration");


    const volumeSlider =
        document.getElementById("volumeSlider");


    /* =====================================================
       SAFETY CHECK
    ===================================================== */

    if (!audio) {

        console.error(
            "❌ Global music player could not find #audioPlayer."
        );

        return;

    }


    console.log(
        "✅ Global music player elements found."
    );


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
                    `Music library error: ${response.status}`
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
                data.map(
                    song => ({

                        ...song,

                        category:
                            typeof song.category === "string"

                                ? song.category.trim()

                                : "Music"

                    })
                );


            console.log(
                `🎶 Global player loaded ${musicLibrary.length} songs`
            );


        } catch (error) {

            console.error(
                "❌ Music loading error:",
                error
            );

        }

    }


    await loadMusic();


    /* =====================================================
       FAVORITES
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


    function saveFavorites() {

        localStorage.setItem(
            "musicFavorites",
            JSON.stringify(favorites)
        );

    }


    /* =====================================================
       PLAY SONG
    ===================================================== */

    function playSong(
        song,
        list = musicLibrary,
        playlistName = "library"
    ) {

        if (!song || !song.file) {

            console.error(
                "❌ Invalid song:",
                song
            );

            return;

        }


        playbackList =
            Array.isArray(list) && list.length
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


        if (currentIndex < 0) {

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
        "Unknown Artist";

}
        if (playbackSource) {

            playbackSource.textContent =
                getPlaybackSourceName(
                    activePlaylist,
                    song
                );

        }


        updateFavoriteButton();

        updateCurrentSongIndicator();

        updateMediaSession(song);


        audio.play()
            .catch(
                error => {

                    console.warn(
                        "⚠️ Playback could not start:",
                        error
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
            playlistName === "favorites"
        ) {

            return "♥ Favorites";

        }


        if (
            playlistName === "library"
        ) {

            return "Music Library";

        }


        return (
            song.category ||
            "Music"
        );

    }


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    function togglePlay() {

        if (!currentTrack) {

            if (musicLibrary.length) {

                playSong(
                    musicLibrary[0],
                    musicLibrary,
                    "library"
                );

            }

            return;

        }


        if (audio.paused) {

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

    }


    if (playBtn) {

        playBtn.addEventListener(
            "click",
            togglePlay
        );

    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong() {

        if (!playbackList.length) {

            return;

        }


        if (isShuffle) {

            let newIndex;


            do {

                newIndex =
                    Math.floor(
                        Math.random() *
                        playbackList.length
                    );

            } while (
                newIndex === currentIndex &&
                playbackList.length > 1
            );


            currentIndex =
                newIndex;

        } else {

            currentIndex++;


            if (
                currentIndex >=
                playbackList.length
            ) {

                currentIndex = 0;

            }

        }


        playSong(
            playbackList[currentIndex],
            playbackList,
            activePlaylist
        );

    }


    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            nextSong
        );

    }


    /* =====================================================
       PREVIOUS SONG
    ===================================================== */

    function previousSong() {

        if (!playbackList.length) {

            return;

        }


        currentIndex--;


        if (currentIndex < 0) {

            currentIndex =
                playbackList.length - 1;

        }


        playSong(
            playbackList[currentIndex],
            playbackList,
            activePlaylist
        );

    }


    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            previousSong
        );

    }


    /* =====================================================
       SHUFFLE
    ===================================================== */

    if (shuffleBtn) {

        shuffleBtn.addEventListener(
            "click",
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

            }
        );

    }


    /* =====================================================
       AUTO NEXT
    ===================================================== */

    audio.addEventListener(
        "ended",
        nextSong
    );


    /* =====================================================
       PLAY STATE
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


    /* =====================================================
       PAUSE STATE
    ===================================================== */

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
       PROGRESS
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
                    ) * 100;

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
       SEEK
    ===================================================== */

    if (progressBar) {

        progressBar.addEventListener(
            "input",
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
                        Number(
                            progressBar.value
                        ) / 100
                    ) *
                    audio.duration;

            }
        );

    }


    /* =====================================================
       TIME FORMAT
    ===================================================== */

    function formatTime(time) {

        if (
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


        volumeSlider.addEventListener(
            "input",
            () => {

                audio.volume =
                    Number(
                        volumeSlider.value
                    );


                localStorage.setItem(
                    "musicVolume",
                    volumeSlider.value
                );

            }
        );

    }


    /* =====================================================
       FAVORITES PLAYER BUTTON
    ===================================================== */

    if (favoriteBtn) {

        favoriteBtn.addEventListener(
            "click",
            () => {

                if (!favorites.length) {

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

            }
        );

    }


    function updateFavoriteButton() {

        if (!favoriteBtn) {

            return;

        }


        favoriteBtn.textContent =
            currentTrack &&
            isFavorite(currentTrack)

                ? "♥"

                : "♡";

    }


    /* =====================================================
       CURRENT SONG INDICATOR
    ===================================================== */

    function updateCurrentSongIndicator() {

        document
            .querySelectorAll(
                "[data-song-id]"
            )
            .forEach(
                element => {

                    const isCurrent =
                        currentTrack &&
                        element.dataset.songId ===
                        String(
                            currentTrack.id
                        );


                    element.classList.toggle(
                        "is-current",
                        Boolean(isCurrent)
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
       MEDIA SESSION
    ===================================================== */

    function updateMediaSession(song) {

        if (
            !("mediaSession" in navigator)
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
                togglePlay
            );


            navigator.mediaSession.setActionHandler(
                "pause",
                () => {

                    audio.pause();

                }
            );


            navigator.mediaSession.setActionHandler(
                "nexttrack",
                nextSong
            );


            navigator.mediaSession.setActionHandler(
                "previoustrack",
                previousSong
            );


        } catch (error) {

            console.warn(
                "⚠️ Media Session error:",
                error
            );

        }

    }


    /* =====================================================
       PUBLIC PLAYER API
    ===================================================== */

    window.DigiCafePlayer = {

        play: playSong,

        next: nextSong,

        previous: previousSong,

        togglePlay: togglePlay,

        getCurrentTrack:
            () => currentTrack,

        getLibrary:
            () => musicLibrary,

        isFavorite:

            isFavorite,


        addFavorite:
            song => {

                if (!song) {

                    return;

                }


                const index =
                    favorites.findIndex(
                        item =>
                            String(item.id) ===
                            String(song.id)
                    );


                if (index === -1) {

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

                updateFavoriteButton();

                updateCurrentSongIndicator();

            }

    };


    /*
       Expose current track so music.js
       can check it.
    */

    window.currentGlobalTrack =
        currentTrack;


    console.log(
        "✅ DigiCafe Global Music Player Ready"
    );

};
