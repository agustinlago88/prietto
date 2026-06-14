/* =========================================================
   JUKEBOX — Reproductor con YouTube IFrame API
   Temas de Maxi Prietto / Los Espíritus en YouTube
   ========================================================= */
(function () {
  "use strict";

  var PLAYLIST_IDS = [
    "GSB0aGXgG1A", // Rumbo a Hong Kong
    "8VzM4zN-t7k", // Camina
    "iT52hFp5z6U", // Negro Chico
    "o2XWz8xNoRo", // Estás Lejos
    "QZ0_jV1z1mU", // Otra Tumba Más
    "BqN2p_H93V8", // Huracanes
    "Xh0Y9QkR-a0"  // La Crecida
  ];

  var jukebox   = document.getElementById("jukebox");
  var btnPlay   = document.getElementById("jbPlay");
  var btnStop   = document.getElementById("jbStop");
  var btnSkip   = document.getElementById("jbSkip");
  var trackName = document.getElementById("jbTrack");
  var ytWrap    = document.getElementById("jbYtWrap");
  var sliderVol = document.getElementById("jbVol");

  if (!jukebox) return;

  var player = null;
  var isPlaying = false;
  var isPlayerReady = false;
  var currentVolume = 80;

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
      videoId: PLAYLIST_IDS[0],
      playerVars: {
        'playlist': PLAYLIST_IDS.join(','),
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
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
  }

  function onPlayerReady(event) {
    isPlayerReady = true;
    player.setVolume(currentVolume);
    if (sliderVol) sliderVol.value = currentVolume;
    
    // Shuffle and loop the playlist natively
    player.setShuffle(true);
    player.setLoop(true);
    
    trackName.textContent = "PRIETTO · JUKEBOX";
  }

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      jukebox.classList.add("is-playing");
      btnPlay.classList.add("is-active");
      // Change Play button to Pause icon
      btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>';
      btnPlay.title = "Pausar";
      btnPlay.setAttribute("aria-label", "Pausar");

      // Update track name from YouTube video data
      var data = player.getVideoData();
      if (data && data.title) {
        var cleanTitle = data.title
          .replace(/official/i, '')
          .replace(/video/i, '')
          .replace(/audio/i, '')
          .replace(/[\(\)\[\]]/g, '')
          .trim();
        trackName.textContent = "REPRODUCIENDO: " + cleanTitle.toUpperCase();
      }
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      isPlaying = false;
      jukebox.classList.remove("is-playing");
      btnPlay.classList.remove("is-active");
      // Change to Play icon
      btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
      btnPlay.title = "Reproducir";
      btnPlay.setAttribute("aria-label", "Reproducir");
    }
  }

  function onPlayerError(event) {
    console.warn("YouTube Player Error code:", event.data);
    skip();
  }

  function play() {
    if (!player || !isPlayerReady) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  function stop() {
    if (!player || !isPlayerReady) return;
    player.stopVideo();
    trackName.textContent = "PRIETTO · JUKEBOX";
  }

  function skip() {
    if (!player || !isPlayerReady) return;
    player.nextVideo();
  }

  // Event listeners
  btnPlay.addEventListener("click", play);
  btnStop.addEventListener("click", stop);
  btnSkip.addEventListener("click", skip);

  if (sliderVol) {
    sliderVol.addEventListener("input", function (e) {
      currentVolume = parseInt(e.target.value, 10);
      if (player && isPlayerReady && typeof player.setVolume === 'function') {
        player.setVolume(currentVolume);
      }
    });
  }

})();
