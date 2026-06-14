/* =========================================================
   JUKEBOX — Reproductor con YouTube IFrame API
   Temas de Maxi Prietto / Los Espíritus en YouTube
   ========================================================= */
(function () {
  "use strict";

  var PLAYLIST = [
    { id: "GSB0aGXgG1A", title: "Maxi Prietto — Rumbo a Hong Kong" },
    { id: "8VzM4zN-t7k", title: "Los Espíritus — Camina" },
    { id: "iT52hFp5z6U", title: "Los Espíritus — Negro Chico" },
    { id: "o2XWz8xNoRo", title: "Maxi Prietto — Estás Lejos" },
    { id: "QZ0_jV1z1mU", title: "Maxi Prietto — Otra Tumba Más" },
    { id: "BqN2p_H93V8", title: "Los Espíritus — Huracanes" },
    { id: "Xh0Y9QkR-a0", title: "Los Espíritus — La Crecida" }
  ];

  var jukebox   = document.getElementById("jukebox");
  var btnPlay   = document.getElementById("jbPlay");
  var btnStop   = document.getElementById("jbStop");
  var btnSkip   = document.getElementById("jbSkip");
  var trackName = document.getElementById("jbTrack");
  var ytWrap    = document.getElementById("jbYtWrap");

  if (!jukebox) return;

  var player = null;
  var isPlaying = false;
  var currentIdx = -1;
  var shuffled = [];

  // Shuffle playlist (Fisher-Yates)
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function resetShuffle() {
    shuffled = shuffle(PLAYLIST);
    currentIdx = -1;
  }

  // Load YouTube script dynamically
  window.onYouTubeIframeAPIReady = function() {
    initPlayer();
  };

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  function initPlayer() {
    ytWrap.innerHTML = '<div id="ytPlayerPlaceholder"></div>';
    
    player = new YT.Player('ytPlayerPlaceholder', {
      height: '200',
      width: '200',
      videoId: PLAYLIST[0].id,
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'fs': 0,
        'rel': 0,
        'showinfo': 0,
        'modestbranding': 1,
        'iv_load_policy': 3
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }

  function onPlayerStateChange(event) {
    // Automatically skip to next track when one ends
    if (event.data === YT.PlayerState.ENDED) {
      skip();
    }
  }

  function playTrack(track) {
    if (!player || typeof player.loadVideoById !== 'function') return;

    player.loadVideoById(track.id);
    trackName.textContent = "REPRODUCIENDO: " + track.title.toUpperCase();
    
    isPlaying = true;
    jukebox.classList.add("is-playing");
    btnPlay.classList.add("is-active");
    // Change Play button to Pause icon
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>';
    btnPlay.title = "Pausar";
    btnPlay.setAttribute("aria-label", "Pausar");
  }

  function play() {
    if (!player) return;

    if (currentIdx < 0) {
      resetShuffle();
      currentIdx = 0;
      playTrack(shuffled[currentIdx]);
    } else {
      if (isPlaying) {
        player.pauseVideo();
        isPlaying = false;
        jukebox.classList.remove("is-playing");
        btnPlay.classList.remove("is-active");
        // Change back to Play icon
        btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
        btnPlay.title = "Reproducir";
        btnPlay.setAttribute("aria-label", "Reproducir");
      } else {
        player.playVideo();
        isPlaying = true;
        jukebox.classList.add("is-playing");
        btnPlay.classList.add("is-active");
        // Change to Pause icon
        btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>';
        btnPlay.title = "Pausar";
        btnPlay.setAttribute("aria-label", "Pausar");
      }
    }
  }

  function stop() {
    if (!player) return;
    player.stopVideo();
    isPlaying = false;
    jukebox.classList.remove("is-playing");
    btnPlay.classList.remove("is-active");
    btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
    btnPlay.title = "Reproducir";
    btnPlay.setAttribute("aria-label", "Reproducir");
    trackName.textContent = "PRIETTO · JUKEBOX";
  }

  function skip() {
    if (!player) return;

    currentIdx++;
    if (currentIdx >= shuffled.length) {
      resetShuffle();
      currentIdx = 0;
    }
    playTrack(shuffled[currentIdx]);
  }

  // Event listeners
  btnPlay.addEventListener("click", play);
  btnStop.addEventListener("click", stop);
  btnSkip.addEventListener("click", skip);

  resetShuffle();

})();
