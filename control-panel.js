document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("ambience-panel")) return;

  console.log("Ambience panel loaded ✔");

  const panel = document.createElement("div");
  panel.id = "ambience-panel";

  panel.innerHTML = `
    <button id="toggle">🎧</button>

    <div id="menu" class="ambience-menu" style="display:none;">

      <div class="sound-row">
        <button data-sound="rain">🌧️</button>
        <button data-sound="fireplace">🔥</button>
        <button data-sound="stream">🌊</button>
        <button data-sound="crickets">🐦</button>
        <button data-sound="off">🔇</button>
      </div>

      <div class="volume-row">
        <span>🔊</span>
        <input id="volumeSlider" type="range" min="0" max="1" step="0.01" value="0.5">
      </div>

    </div>

    <audio id="ambience-audio" loop></audio>
  `;

  document.body.appendChild(panel);

  // Elements
  const toggle = panel.querySelector("#toggle");
  const menu = panel.querySelector("#menu");
  const audio = panel.querySelector("#ambience-audio");
  const volumeSlider = panel.querySelector("#volumeSlider");

  // Sounds
  const sounds = {
    rain: "audio/Rain.mp3",
    fireplace: "audio/Fireplace.mp3",
    stream: "audio/Stream.mp3",
    crickets: "audio/Crickets.mp3"
  };

  audio.volume = volumeSlider.value;

  // Toggle menu
 toggle.onclick = () => {
    console.log("Ambience clicked");

    if(menu.style.display==="block"){
        menu.style.display="none";
    }else{
        menu.style.display="block";
    }
};

  // Sound buttons
  menu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const sound = btn.dataset.sound;

      if (sound === "off") {
        audio.pause();
        audio.src = "";
        return;
      }

      if (!sounds[sound]) return;

      audio.src = sounds[sound];
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  });

  // Volume
  volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });

  // =========================
  // 📱 DRAG FUNCTION (MOBILE + DESKTOP)
  // =========================
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  panel.addEventListener("mousedown", startDrag);
  panel.addEventListener("touchstart", startDrag, { passive: false });

  function startDrag(e) {
    // don't drag when clicking buttons
    if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;

    isDragging = true;

    const rect = panel.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", stopDrag);
  }

  function drag(e) {
    if (!isDragging) return;

    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = clientX - offsetX;
    let y = clientY - offsetY;

    // keep inside screen
    const maxX = window.innerWidth - panel.offsetWidth;
    const maxY = window.innerHeight - panel.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    panel.style.left = x + "px";
    panel.style.top = y + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  function stopDrag() {
    isDragging = false;

    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", stopDrag);
  }
});

