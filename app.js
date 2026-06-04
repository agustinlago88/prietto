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
      tbWhere.textContent = meta.num + " — " + meta.label;
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

  render();
})();
