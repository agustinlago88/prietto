/* =========================================================
   PRIETTO — routing por hash + filtro disco + vídeo
   ========================================================= */
(function () {
  "use strict";

  var ROUTES = [
    { id: "home",      label: "Índice",      num: "00" },
    { id: "fechas",    label: "Fechas",      num: "01" },
    { id: "discos",    label: "Discografía", num: "02" },
    { id: "video",     label: "Vídeo",       num: "03" },
    { id: "archivo",   label: "Archivo",     num: "04" },
    { id: "biografia", label: "Bio",         num: "05" },
    { id: "contacto",  label: "Contacto",    num: "06" }
  ];

  var body = document.body;
  var views = document.querySelectorAll(".view");
  var tbWhere = document.getElementById("tbWhere");
  var pgPrev = document.getElementById("pgPrev");
  var pgNext = document.getElementById("pgNext");

  function routeFromHash() {
    var h = (location.hash || "").replace(/^#\/?/, "").trim();
    for (var i = 0; i < ROUTES.length; i++) {
      if (ROUTES[i].id === h) return h;
    }
    return "home";
  }

  function indexOfRoute(id) {
    for (var i = 0; i < ROUTES.length; i++) if (ROUTES[i].id === id) return i;
    return 0;
  }

  function setPager(idx) {
    // Sections are 1..6. prev/next wrap through the section list; ends go to Índice.
    var prev = idx <= 1 ? ROUTES[0] : ROUTES[idx - 1];
    var next = idx >= ROUTES.length - 1 ? ROUTES[0] : ROUTES[idx + 1];

    pgPrev.href = "#/" + (prev.id === "home" ? "" : prev.id);
    pgPrev.querySelector("span").textContent =
      (prev.id === "home" ? "← Índice" : "← " + prev.label);

    pgNext.href = "#/" + (next.id === "home" ? "" : next.id);
    pgNext.querySelector("span").textContent =
      (next.id === "home" ? "Índice →" : next.label + " →");
  }

  function render() {
    var id = routeFromHash();
    var idx = indexOfRoute(id);
    var meta = ROUTES[idx];

    views.forEach(function (v) {
      v.classList.toggle("is-active", v.id === id);
    });

    body.setAttribute("data-route", id);
    if (id !== "home") {
      tbWhere.textContent = meta.label;
      setPager(idx);
    }

    // top of the freshly-shown view
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.title = id === "home"
      ? "Prietto — Cosmos, Blues y Canción"
      : "Prietto — " + meta.label;
  }

  window.addEventListener("hashchange", render);

  /* ---------- Menú móvil lateral (drawer) ---------- */
  var ixToggle = document.getElementById("ixToggle");
  var ixClose = document.getElementById("ixClose");
  var ixMenu = document.getElementById("ixMenu");
  var ixOverlay = document.getElementById("ixOverlay");

  function openMobileMenu() {
    if (ixMenu) ixMenu.classList.add("is-open");
    if (ixOverlay) ixOverlay.classList.add("is-visible");
    if (ixToggle) ixToggle.setAttribute("aria-expanded", "true");
  }

  function closeMobileMenu() {
    if (ixMenu) ixMenu.classList.remove("is-open");
    if (ixOverlay) ixOverlay.classList.remove("is-visible");
    if (ixToggle) ixToggle.setAttribute("aria-expanded", "false");
  }

  if (ixToggle) ixToggle.addEventListener("click", openMobileMenu);
  if (ixClose) ixClose.addEventListener("click", closeMobileMenu);
  if (ixOverlay) ixOverlay.addEventListener("click", closeMobileMenu);

  if (ixMenu) {
    ixMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        closeMobileMenu();
      }
    });
  }

  /* ---------- Discografía: filtro por categoría ---------- */
  var filters = document.getElementById("discoFilters");
  var grid = document.getElementById("discoGrid");
  function applyFilter(f) {
    grid.querySelectorAll(".album").forEach(function (a) {
      var show = f === "all" || a.getAttribute("data-cat") === f;
      a.classList.toggle("is-hidden", !show);
    });
  }
  if (filters && grid) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filters.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
      });
      applyFilter(btn.getAttribute("data-filter"));
    });
    // initial filter = the button marked .is-on (Solista)
    var on = filters.querySelector("button.is-on");
    applyFilter(on ? on.getAttribute("data-filter") : "all");
  }

  /* ---------- Vídeo: cargar el embed al hacer click ---------- */
  var frame = document.getElementById("videoFrame");
  var play = document.getElementById("videoPlay");
  if (frame && play) {
    play.addEventListener("click", function () {
      var id = frame.getAttribute("data-yt");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.title = "RUMBO A HONG KONG - PRIETTO";
      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  }

  /* ---------- Esc vuelve al índice ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && routeFromHash() !== "home") {
      location.hash = "#/";
    }
  });

  /* ---------- Reveal on scroll (home teasers) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.18 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Modales de Letras y Ficha (Booklets) ---------- */
  document.querySelectorAll("[data-booklet]").forEach(function (btn) {
    var modalId = btn.getAttribute("data-booklet");
    var modal = document.getElementById(modalId);
    if (!modal) return;
    
    btn.addEventListener("click", function () {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });

    var closeBtn = modal.querySelector(".bm-close");
    var overlay = modal.querySelector(".bm-overlay");

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);

    // Also close on Escape key if open
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  });

  /* ---------- Bandcamp Random Player ---------- */
  var BANDCAMP_ALBUMS = [
    { id: "3424067692", title: "PRIETTO (2015)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/prietto" },
    { id: "3081507119", title: "Lluvia en la Cumbrecita (2019)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/lluvia-en-la-cumbrecita" },
    { id: "3863775133", title: "Blanco y Negro (2020)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/blanco-y-negro" },
    { id: "1599107760", title: "Astro Lo Fi Beats (2022)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/astro-lo-fi-beats" },
    { id: "3905770292", title: "Boleros & Canciones (2018)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/boleros-canciones" },
    { id: "2229177694", title: "Baño de Bosque (2022)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/ba-o-de-bosque" },
    { id: "482998927", title: "Hogo Sound (2022)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/hogo-sound" },
    { id: "4161044457", title: "La Última Noche (2022)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/la-ultima-noche" },
    { id: "1185965820", title: "Playa Nocturna Vol 2 (2020)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/playa-nocturna-vol-2" },
    { id: "4278999612", title: "Playa Nocturna Vol 3 (2021)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/playa-nocturna-vol-3" },
    { id: "1886782824", title: "Playa Nocturna Vol 4 (2022)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/playa-nocturna-vol-4" },
    { id: "3321749856", title: "Una Velada de Blues & Boleros (2022)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/una-velada-de-blues-boleros" },
    { id: "1083923598", title: "Pin de Fartie (Soundtrack) (2022)", artist: "Maxi Prietto", url: "https://prietto.bandcamp.com/album/pin-de-fartie-soundtrack" },
    { id: "2583377281", title: "Los Espíritus (2013)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/los-espiritus" },
    { id: "420176323", title: "Gratitud (2015)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/gratitud-2" },
    { id: "2034675505", title: "Agua Ardiente (2017)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/agua-ardiente" },
    { id: "1505081663", title: "Caldero (2019)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/caldero" },
    { id: "4022587328", title: "Sancocho Stereo (2021)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/sancocho-stereo" },
    { id: "2569568395", title: "La Montaña (2023)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/la-monta-a" },
    { id: "2366813728", title: "Hacele caso a tu espíritu! (2010)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/hacele-caso-a-tu-espiritu" },
    { id: "1547615392", title: "Lo echaron del bar EP (2011)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/lo-echaron-del-bar-ep" },
    { id: "4228553294", title: "El Gato EP (2012)", artist: "Los Espíritus", url: "https://losespiritus.bandcamp.com/album/el-gato-ep" },
    { id: "617729266", title: "Prietto Viaja al Cosmos con Mariano EP (2007)", artist: "Cosmos", url: "https://priettoviajaalcosmosconmariano.bandcamp.com/album/prietto-viaja-al-cosmos-con-mariano-ep" },
    { id: "968251046", title: "Los Puedo Viajar (2014)", artist: "Cosmos", url: "https://priettoviajaalcosmosconmariano.bandcamp.com/album/los-puedo-viajar" },
    { id: "2541293163", title: "Experiencias del Salón Cósmico (2006)", artist: "Cosmos", url: "https://priettoviajaalcosmosconmariano.bandcamp.com/album/experiencias-del-sal-n-c-smico" },
    { id: "1254494294", title: "Le Priët VAHA-CHOSMOS (2011)", artist: "Cosmos", url: "https://priettoviajaalcosmosconmariano.bandcamp.com/album/le-pri-t-vaha-chosmos-e-ba-con-maourian" },
    { id: "2356339072", title: "Lou Fai Home Sessions Vol II (2007)", artist: "Cosmos", url: "https://priettoviajaalcosmosconmariano.bandcamp.com/album/lou-fai-home-sessions-vol-ii" }
  ];

  var container = document.getElementById("bandcampPlayerContainer");
  var btnRandom = document.getElementById("btnRandomAlbum");
  var infoText  = document.getElementById("bandcampAlbumInfo");
  var buyLink   = document.getElementById("bandcampAlbumLink");

  function loadRandomBandcampAlbum() {
    if (!container || !BANDCAMP_ALBUMS.length) return;
    
    // Pick a random album
    var randomIndex = Math.floor(Math.random() * BANDCAMP_ALBUMS.length);
    var alb = BANDCAMP_ALBUMS[randomIndex];

    // Create iframe element
    var iframe = document.createElement("iframe");
    iframe.src = "https://bandcamp.com/EmbeddedPlayer/album=" + alb.id + "/size=large/bgcol=ffffff/linkcol=0c0c0c/artwork=small/transparent=true/";
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.setAttribute("seamless", "");
    iframe.title = alb.artist + " - " + alb.title;
    
    // Clear and append
    container.innerHTML = "";
    container.appendChild(iframe);

    // Update metadata and link
    if (infoText) {
      infoText.textContent = alb.artist.toUpperCase() + " · " + alb.title.toUpperCase();
    }
    if (buyLink) {
      buyLink.href = alb.url;
    }
  }

  // Load an initial random album
  if (container) {
    loadRandomBandcampAlbum();
  }

  // Bind click event to the random button
  if (btnRandom) {
    btnRandom.addEventListener("click", loadRandomBandcampAlbum);
  }

  render();
})();
