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

  var TRACK_TITLES = {
    "GSB0aGXgG1A": "Maxi Prietto — Rumbo a Hong Kong",
    "8VzM4zN-t7k": "Los Espíritus — Camina",
    "iT52hFp5z6U": "Los Espíritus — Negro Chico",
    "o2XWz8xNoRo": "Maxi Prietto — Estás Lejos",
    "QZ0_jV1z1mU": "Maxi Prietto — Otra Tumba Más",
    "BqN2p_H93V8": "Los Espíritus — Huracanes",
    "Xh0Y9QkR-a0": "Los Espíritus — La Crecida"
  };

  var jukebox   = document.getElementById("jukebox");
  var btnPlay   = document.getElementById("jbPlay");
  var btnStop   = document.getElementById("jbStop");
  var btnSkip   = document.getElementById("jbSkip");
  var btnMute   = document.getElementById("jbMute");
  var trackName = document.getElementById("jbTrack");
  var ytWrap    = document.getElementById("jbYtWrap");
  var sliderVol = document.getElementById("jbVol");

  if (!jukebox) return;

  var player = null;
  var isPlaying = false;
  var isPlayerReady = false;
  var isMuted = false;
  var currentVolume = 80;

  var SVG_VOLUME_ON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="jb-vol-icon" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  var SVG_VOLUME_MUTED = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="jb-vol-icon" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

  // Shuffle playlist in JS beforehand to ensure randomness on mobile
  function shuffleArray(array) {
    var copy = array.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  var shuffledPlaylist = shuffleArray(PLAYLIST_IDS);

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
      videoId: shuffledPlaylist[0],
      playerVars: {
        'playlist': shuffledPlaylist.join(','),
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'fs': 0,
        'rel': 0,
        'showinfo': 0,
        'modestbranding': 1,
        'iv_load_policy': 3,
        'loop': 1
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
    
    // Set loop natively (backed up by playerVars loop: 1)
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

      // Update track name from local lookup or YouTube video data
      var data = player.getVideoData();
      var videoId = data ? data.video_id : null;
      if (!videoId && typeof player.getVideoUrl === 'function') {
        var url = player.getVideoUrl();
        var match = url.match(/[?&]v=([^&#]*)/);
        if (match) videoId = match[1];
      }

      var displayTitle = "";
      if (videoId && TRACK_TITLES[videoId]) {
        displayTitle = TRACK_TITLES[videoId];
      } else if (data && data.title) {
        displayTitle = data.title
          .replace(/official/i, '')
          .replace(/video/i, '')
          .replace(/audio/i, '')
          .replace(/[\(\)\[\]]/g, '')
          .trim();
      } else {
        displayTitle = "Música de Prietto";
      }

      trackName.textContent = "REPRODUCIENDO: " + displayTitle.toUpperCase();
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

  // Stop playback completely
  function stop() {
    if (!player || !isPlayerReady) return;
    player.stopVideo();
    trackName.textContent = "PRIETTO · JUKEBOX";
  }

  function skip() {
    if (!player || !isPlayerReady) return;
    player.nextVideo();
  }

  function toggleMute() {
    if (!player || !isPlayerReady) return;

    if (isMuted) {
      player.unmute();
      isMuted = false;
      if (btnMute) btnMute.innerHTML = SVG_VOLUME_ON;
      if (sliderVol) {
        sliderVol.value = currentVolume;
        player.setVolume(currentVolume);
      }
    } else {
      player.mute();
      isMuted = true;
      if (btnMute) btnMute.innerHTML = SVG_VOLUME_MUTED;
      if (sliderVol) sliderVol.value = 0;
    }
  }

  // Event listeners
  btnPlay.addEventListener("click", play);
  btnStop.addEventListener("click", stop);
  btnSkip.addEventListener("click", skip);
  if (btnMute) btnMute.addEventListener("click", toggleMute);

  if (sliderVol) {
    sliderVol.addEventListener("input", function (e) {
      currentVolume = parseInt(e.target.value, 10);
      if (player && isPlayerReady && typeof player.setVolume === 'function') {
        player.setVolume(currentVolume);
        if (currentVolume > 0 && isMuted) {
          player.unmute();
          isMuted = false;
          if (btnMute) btnMute.innerHTML = SVG_VOLUME_ON;
        } else if (currentVolume === 0 && !isMuted) {
          player.mute();
          isMuted = true;
          if (btnMute) btnMute.innerHTML = SVG_VOLUME_MUTED;
        }
      }
    });
  }

})();
