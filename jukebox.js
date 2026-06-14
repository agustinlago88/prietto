/* =========================================================
   JUKEBOX — Reproductor minimalista con Bandcamp embeds
   Temas random del catálogo solista de Prietto
   ========================================================= */
(function () {
  "use strict";

  // ─── CATALOG: álbumes solistas de Prietto en Bandcamp ───
  // Cada entrada tiene: albumId (Bandcamp), title, url
  var ALBUMS = [
    { id: 1864098905, title: "La Otra Ciudad",                          url: "/album/la-otra-ciudad" },
    { id: 3618319346, title: "Siesta",                                  url: "/album/siesta" },
    { id: 4012858097, title: "Casa (2009)",                             url: "/album/casa-2009" },
    { id: 3793205600, title: "Casa Vol II",                             url: "/album/casa-vol-ii-la-sarten-lavada-y-el-lado-crudo-2010" },
    { id: 10258779,   title: "Prietto (2002)",                          url: "/album/prietto-2002" },
    { id: 818814589,  title: "No Te Rindas // Otra Tumba Más",          url: "/album/no-te-rindas-otra-tumba-m-s" },
    { id: 3880781914, title: "13 Minutos",                              url: "/album/13-minutos" },
    { id: 2696831082, title: "El Ciruja y Los Rayos Solares",           url: "/album/el-ciruja-y-los-rayos-solares-2007" },
    { id: 878972402,  title: "Casa 3 (El Rey Sapo)",                    url: "/album/the-antique-young-prietto-casa-3-o-el-rey-sapo" },
    { id: 1854693855, title: "Baño Solar",                              url: "/album/ba-o-solar" },
    { id: 892410826,  title: "Siesta II",                               url: "/album/siesta-ii-una-vaca-se-tramp-una-pala" },
    { id: 3997618499, title: "Pies Con Alcohol, Calles de Fuego",       url: "/album/pies-con-alcohol-calles-de-fuego" },
    { id: 3939772086, title: "5",                                       url: "/album/5" },
    { id: 2223682224, title: "Luminar",                                 url: "/album/luminar" }
  ];

  var BC_BASE = "https://bandcamp.com/EmbeddedPlayer/album=";
  var BC_OPTS = "/size=small/bgcol=0c0c0c/linkcol=ffffff/transparent=true/";

  // ─── DOM refs ───
  var container = document.getElementById("jbPlayerContainer");
  var btnSkip   = document.getElementById("jbSkip");

  if (!container) return;

  var currentIdx = -1;
  var shuffled   = [];

  // ─── Shuffle the album list (Fisher-Yates) ───
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function resetShuffle() {
    shuffled = shuffle(ALBUMS);
    currentIdx = -1;
  }

  // ─── Load album iframe ───
  function loadAlbum(album) {
    container.innerHTML = "";

    var iframe = document.createElement("iframe");
    iframe.style.cssText = "border:0;width:100%;height:42px;display:block;";
    iframe.src = BC_BASE + album.id + BC_OPTS;
    iframe.title = "Prietto — " + album.title;
    iframe.setAttribute("seamless", "");
    container.appendChild(iframe);
  }

  // ─── Skip / Next ───
  function skip() {
    currentIdx++;
    if (currentIdx >= shuffled.length) {
      resetShuffle();
      currentIdx = 0;
    }
    loadAlbum(shuffled[currentIdx]);
  }

  // ─── Event listeners ───
  if (btnSkip) {
    btnSkip.addEventListener("click", skip);
  }

  // ─── Init ───
  resetShuffle();
  skip();

})();
