

/* =====================================================
   DIGICAFE GLOBAL MUSIC PLAYER VISIBILITY
   Hides and restores the player without stopping audio.
===================================================== */

(function () {
    "use strict";

    function setupPlayerVisibility() {
        const player = document.getElementById("globalMusicPlayer");

        if (!player) return false;

        // Do not attach duplicate controls.
        if (document.getElementById("musicPlayerHideButton")) {
            return true;
        }

        // HIDE BUTTON
        const hideButton = document.createElement("button");

        hideButton.id = "musicPlayerHideButton";
        hideButton.type = "button";
        hideButton.className = "player-visibility-hide";
        hideButton.textContent = "⌄ Hide player";
        hideButton.setAttribute("aria-label", "Hide music player");
        hideButton.setAttribute("aria-controls", "globalMusicPlayer");

        player.prepend(hideButton);

        // RESTORE BUTTON — outside the player.
        const restoreButton = document.createElement("button");

        restoreButton.id = "musicPlayerRestoreButton";
        restoreButton.type = "button";
        restoreButton.textContent = "♫";
        restoreButton.title = "Show music player";
        restoreButton.setAttribute("aria-label", "Show music player");
        restoreButton.setAttribute("aria-controls", "globalMusicPlayer");
        restoreButton.classList.remove("is-visible");

        document.body.appendChild(restoreButton);

        function hidePlayer() {
            player.classList.add("player-visibility-hidden");

            hideButton.setAttribute("aria-expanded", "false");
            restoreButton.classList.add("is-visible");
            restoreButton.setAttribute("aria-expanded", "true");
        }

        function showPlayer() {
            player.classList.remove("player-visibility-hidden");

            hideButton.setAttribute("aria-expanded", "true");
            restoreButton.classList.remove("is-visible");
            restoreButton.setAttribute("aria-expanded", "false");
        }

        hideButton.addEventListener("click", hidePlayer);
        restoreButton.addEventListener("click", showPlayer);

        console.log("🎵 DigiCafe player hide/show ready.");

        return true;
    }

    function start() {
        if (setupPlayerVisibility()) return;

        // The shared shell loads music-player.html asynchronously.
        const observer = new MutationObserver(function () {
            if (setupPlayerVisibility()) {
                observer.disconnect();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, {
            once: true
        });
    } else {
        start();
    }
})();
