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


    let queue =
      JSON.parse(
        localStorage.getItem(
          "musicQueue"
        )
      ) || [];


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


    const queueBtn =
      document.getElementById(
        "queueBtn"
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


    const queueList =
      document.getElementById(
        "queueList"
      );


    const favoriteList =
      document.getElementById(
        "favoriteList"
      );


    const clearQueueBtn =
      document.getElementById(
        "clearQueueBtn"
      );


    const clearFavoritesBtn =
      document.getElementById(
        "clearFavoritesBtn"
      );


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
            "Music library could not be loaded."
          );

        }


        musicLibrary =
          await response.json();


        displayMusic(
          musicLibrary
        );


        displayRecent();


        renderQueue();


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
       STATUS CHECKS
    ===================================================== */

    function isFavorite(
      song
    ) {

      return favorites.some(
        item =>
          item.id ===
          song.id
      );

    }


    function isInQueue(
      song
    ) {

      return queue.some(
        item =>
          item.id ===
          song.id
      );

    }


    /* =====================================================
       CREATE SONG CARD
    ===================================================== */

    function createSongCard(
      song
    ) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "song-card";


      card.innerHTML = `

        <h3>
          ${song.title}
        </h3>

        <p>
          ${song.category}
        </p>

        <div class="song-buttons">

          <button
            class="play-song"
            title="Play song"
          >
            ▶
          </button>


          <button
            class="add-queue ${
              isInQueue(song)
                ? "active-queue"
                : ""
            }"
            title="Add to queue"
          >

            ${
              isInQueue(song)
                ? "✓"
                : "+"
            }

          </button>


          <button
            class="add-favorite ${
              isFavorite(song)
                ? "active-favorite"
                : ""
            }"
            title="Add to favorites"
          >

            ${
              isFavorite(song)
                ? "♥"
                : "♡"
            }

          </button>

        </div>

      `;


      /* PLAY */

      card
        .querySelector(
          ".play-song"
        )
        .onclick =
        () => {

          playSong(
            song,
            getActiveSongList(),
            activeCategory === "All"
              ? "library"
              : activeCategory
          );

        };


      /* QUEUE */

      card
        .querySelector(
          ".add-queue"
        )
        .onclick =
        () => {

          addQueue(
            song
          );

        };


      /* FAVORITE */

      card
        .querySelector(
          ".add-favorite"
        )
        .onclick =
        () => {

          addFavorite(
            song
          );

        };


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
          song.category ===
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
        !songs.length
      ) {

        musicLibraryBox.innerHTML =
          `
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
        [
          ...musicLibrary
        ]
        .sort(
          (
            a,
            b
          ) =>

            new Date(
              b.dateAdded
            )
            -
            new Date(
              a.dateAdded
            )

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

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    window.loadCategory =
      function (
        category
      ) {

        activeCategory =
          category;


        const result =
          category ===
          "All"

            ? musicLibrary

            : musicLibrary.filter(
                song =>
                  song.category ===
                  category
              );


        const title =
          document.getElementById(
            "categoryTitle"
          );


        if (title) {

          title.textContent =
            category ===
            "All"

              ? "All Music"

              : category;

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


      playbackList =
        list;


      activePlaylist =
        playlistName;


      currentTrack =
        song;


      currentIndex =
        playbackList.findIndex(
          item =>
            item.id ===
            song.id
        );


      audio.src =
        song.file;


      audio.play()
        .catch(
          error => {

            console.warn(
              "Audio playback error:",
              error
            );

          }
        );


      if (trackTitle) {

        trackTitle.textContent =
          song.title;

      }


      if (trackArtist) {

        trackArtist.textContent =
          song.artist;

      }


      if (playbackSource) {

        playbackSource.textContent =
          getPlaybackSourceName(
            playlistName,
            song
          );

      }


      if (playBtn) {

        playBtn.textContent =
          "⏸";

      }


      updatePlaybackButtons();


      updateMediaSession(
        song
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
        "queue"
      ) {

        return "＋ Queue";

      }


      if (
        playlistName ===
        "library"
      ) {

        return "🎵 Music Library";

      }


      return `

        ${getEmoji(
          song.category
        )}

        ${song.category}

      `;

    }


    /* =====================================================
       ACTIVE PLAYLIST BUTTONS
    ===================================================== */

    function updatePlaybackButtons() {

      if (favoriteBtn) {

        favoriteBtn.classList.remove(
          "active-playlist"
        );

      }


      if (queueBtn) {

        queueBtn.classList.remove(
          "active-playlist"
        );

      }


      if (
        activePlaylist ===
        "favorites"
      ) {

        if (favoriteBtn) {

          favoriteBtn.classList.add(
            "active-playlist"
          );

        }

      }


      if (
        activePlaylist ===
        "queue"
      ) {

        if (queueBtn) {

          queueBtn.classList.add(
            "active-playlist"
          );

        }

      }

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
       QUEUE PLAYER BUTTON
    ===================================================== */

    if (queueBtn) {

      queueBtn.onclick =
        () => {

          if (
            !queue.length
          ) {

            alert(
              "Your Queue is empty."
            );

            return;

          }


          playSong(
            queue[0],
            queue,
            "queue"
          );

        };

    }


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    if (playBtn) {

      playBtn.onclick =
        () => {

          if (
            !currentTrack
          ) {

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

            audio.play();


            playBtn.textContent =
              "⏸";

          } else {

            audio.pause();


            playBtn.textContent =
              "▶";

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


      if (
        isShuffle
      ) {

        currentIndex =
          Math.floor(
            Math.random()
            *
            playbackList.length
          );

      } else {

        currentIndex++;


        if (
          currentIndex >=
          playbackList.length
        ) {

          currentIndex =
            0;

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
          playbackList.length
          -
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

    audio.onended =
      nextSong;


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

      }
    );


    /* =====================================================
       QUEUE
    ===================================================== */

    function addQueue(
      song
    ) {

      const index =
        queue.findIndex(
          item =>
            item.id ===
            song.id
        );


      if (
        index ===
        -1
      ) {

        queue.push(
          song
        );

      } else {

        queue.splice(
          index,
          1
        );

      }


      saveQueue();


      renderQueue();


      refreshDisplays();

    }


    function saveQueue() {

      localStorage.setItem(
        "musicQueue",
        JSON.stringify(
          queue
        )
      );

    }


    function renderQueue() {

      if (!queueList) {

        return;

      }


      queueList.innerHTML =
        "";


      if (
        !queue.length
      ) {

        queueList.innerHTML =
          `
          <li>
            Queue is empty
          </li>
          `;

        return;

      }


      queue.forEach(
        (
          song,
          index
        ) => {

          const li =
            document.createElement(
              "li"
            );


          li.innerHTML = `

            <span>
              ${song.title}
            </span>

            <button>
              ✕
            </button>

          `;


          li
            .querySelector(
              "button"
            )
            .onclick =
            () => {

              queue.splice(
                index,
                1
              );


              saveQueue();


              renderQueue();


              refreshDisplays();

            };


          queueList.appendChild(
            li
          );

        }
      );

    }


    if (clearQueueBtn) {

      clearQueueBtn.onclick =
        () => {

          queue =
            [];


          saveQueue();


          renderQueue();


          refreshDisplays();

        };

    }


    /* =====================================================
       FAVORITES
    ===================================================== */

    function addFavorite(
      song
    ) {

      const index =
        favorites.findIndex(
          item =>
            item.id ===
            song.id
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


      renderFavorites();


      refreshDisplays();

    }


    function saveFavorites() {

      localStorage.setItem(
        "musicFavorites",
        JSON.stringify(
          favorites
        )
      );

    }


    function renderFavorites() {

      if (!favoriteList) {

        return;

      }


      favoriteList.innerHTML =
        "";


      if (
        !favorites.length
      ) {

        favoriteList.innerHTML =
          `
          <li>
            No favorite songs yet
          </li>
          `;

        return;

      }


      favorites.forEach(
        (
          song,
          index
        ) => {

          const li =
            document.createElement(
              "li"
            );


          li.innerHTML = `

            <span>
              ${song.title}
            </span>

            <button>
              ✕
            </button>

          `;


          li
            .querySelector(
              "button"
            )
            .onclick =
            () => {

              favorites.splice(
                index,
                1
              );


              saveFavorites();


              renderFavorites();


              refreshDisplays();

            };


          favoriteList.appendChild(
            li
          );

        }
      );

    }


    if (clearFavoritesBtn) {

      clearFavoritesBtn.onclick =
        () => {

          favorites =
            [];


          saveFavorites();


          renderFavorites();


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


      renderQueue();


      renderFavorites();


      displayCollections();

    }


    /* =====================================================
       PROGRESS BAR
    ===================================================== */

    audio.ontimeupdate =
      () => {

        if (
          !audio.duration
        ) {

          return;

        }


        if (progressBar) {

          progressBar.value =
            (
              audio.currentTime
              /
              audio.duration
            )
            *
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

      };


    if (progressBar) {

      progressBar.oninput =
        () => {

          if (
            !audio.duration
          ) {

            return;

          }


          audio.currentTime =
            (
              progressBar.value
              /
              100
            )
            *
            audio.duration;

        };

    }


    function formatTime(
      time
    ) {

      if (
        isNaN(
          time
        )
      ) {

        return "0:00";

      }


      const minutes =
        Math.floor(
          time
          /
          60
        );


      let seconds =
        Math.floor(
          time
          %
          60
        );


      if (
        seconds <
        10
      ) {

        seconds =
          "0"
          +
          seconds;

      }


      return `${minutes}:${seconds}`;

    }


    /* =====================================================
       VOLUME
    ===================================================== */

    if (volumeSlider) {

      audio.volume =
        volumeSlider.value;


      volumeSlider.oninput =
        () => {

          audio.volume =
            volumeSlider.value;

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
            musicLibrary.map(
              song =>
                song.category
            )
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
                song.category
                ===
                category
            );


          section.innerHTML = `

            <div
              class="collection-header"
            >

              <span>

                ${getEmoji(
                  category
                )}

                ${category}

              </span>


              <span>
                ▶
              </span>

            </div>


            <div
              class="collection-body"
            >
            </div>

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


              row.innerHTML = `

                <div
                  class="song-title"
                >

                  ${song.title}

                </div>


                <div
                  class="song-actions"
                >

                  <button
                    class="play"
                  >
                    ▶
                  </button>


                  <button
                    class="favorite ${
                      isFavorite(song)
                        ? "active-favorite"
                        : ""
                    }"
                  >

                    ${
                      isFavorite(song)
                        ? "♥"
                        : "♡"
                    }

                  </button>


                  <button
                    class="add-queue ${
                      isInQueue(song)
                        ? "active-queue"
                        : ""
                    }"
                  >

                    ${
                      isInQueue(song)
                        ? "✓"
                        : "+"
                    }

                  </button>

                </div>

              `;


              /* PLAY COLLECTION SONG */

              row
                .querySelector(
                  ".play"
                )
                .onclick =
                () => {

                  playSong(
                    song,
                    songs,
                    category
                  );

                };


              /* FAVORITE */

              row
                .querySelector(
                  ".favorite"
                )
                .onclick =
                () => {

                  addFavorite(
                    song
                  );

                };


              /* QUEUE */

              row
                .querySelector(
                  ".add-queue"
                )
                .onclick =
                () => {

                  addQueue(
                    song
                  );

                };


              body.appendChild(
                row
              );

            }
          );


          section
            .querySelector(
              ".collection-header"
            )
            .onclick =
            () => {

              section.classList.toggle(
                "open"
              );

            };


          container.appendChild(
            section
          );

        }
      );

    }


    /* =====================================================
       EMOJIS
    ===================================================== */

    function getEmoji(
      category
    ) {

      const emojis = {

        "Ambience":
          "🌿",

        "Night Atmosphere":
          "🌙",

        "Piano":
          "🎹",

        "Heal":
          "💚"

      };


      return (

        emojis[
          category
        ]

        ||

        "🎵"

      );

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
          in
          navigator
        )
      ) {

        return;

      }


      navigator.mediaSession.metadata =
        new MediaMetadata({

          title:
            song.title,

          artist:
            song.artist
            ||
            "DaintyJha",

          album:
            song.album
            ||
            "DaintyHub"

        });


      try {

        navigator.mediaSession.setActionHandler(
          "play",
          () => {

            audio.play();

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

      } catch (
        error
      ) {

        console.warn(
          "Media Session error:",
          error
        );

      }

    }

  }

);
