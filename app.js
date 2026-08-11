/* =========================================================
   PRIETTO — routing por hash + filtro disco + vídeo
   ========================================================= */
(function () {
  "use strict";

  var ROUTES = [
    { id: "home",      label: "Índice",      num: "00" },
    { id: "fechas",    label: "Fechas",      num: "01" },
    { id: "discos",    label: "Discografía", num: "02" },
    { id: "release",   label: "Disco",       num: "02" },
    { id: "letras",    label: "Letras",      num: "03" },
    { id: "video",     label: "Vídeo",       num: "04" },
    { id: "biografia", label: "Bio",         num: "05" },
    { id: "contacto",  label: "Contacto",    num: "06" }
  ];

  var body = document.body;
  var views = document.querySelectorAll(".view");
  var tbWhere = document.getElementById("tbWhere");
  var pgPrev = document.getElementById("pgPrev");
  var pgNext = document.getElementById("pgNext");

  function routeFromHash() {
    var raw = (location.hash || "").replace(/^#\/?/, "").trim();
    if (raw.indexOf("disco/") === 0 || raw.indexOf("release/") === 0) return "release";
    if (raw === "disco" || raw === "release") return "release";
    if (raw.indexOf("letras") === 0) return "letras";
    var mainRoute = raw.split("/")[0].split("#")[0];
    for (var i = 0; i < ROUTES.length; i++) {
      if (ROUTES[i].id === mainRoute) return mainRoute;
    }
    return "home";
  }

  function indexOfRoute(id) {
    for (var i = 0; i < ROUTES.length; i++) if (ROUTES[i].id === id) return i;
    return 0;
  }

  function setPager(idx) {
    var prev = idx <= 1 ? ROUTES[0] : ROUTES[idx - 1];
    var next = idx >= ROUTES.length - 1 ? ROUTES[0] : ROUTES[idx + 1];

    pgPrev.href = "#/" + (prev.id === "home" ? "" : prev.id);
    pgPrev.querySelector("span").textContent =
      (prev.id === "home" ? "← Índice" : "← " + prev.label);

    pgNext.href = "#/" + (next.id === "home" ? "" : next.id);
    pgNext.querySelector("span").textContent =
      (next.id === "home" ? "Índice →" : next.label + " →");
  }


  function renderReleasePage() {
    var raw = (location.hash || "").replace(/^#\/?/, "").trim();
    var parts = raw.split("/");
    var key = parts.length > 1 ? parts[1].split("#")[0].split("?")[0] : "";

    var releases = window.PRIETTO_RELEASES || [];
    if (!releases.length) {
      setTimeout(renderReleasePage, 50);
      return;
    }

    var relIdx = -1;
    if (key) {
      for (var i = 0; i < releases.length; i++) {
        if (releases[i].key === key || releases[i].key.toLowerCase() === key.toLowerCase()) {
          relIdx = i;
          break;
        }
      }
    }
    if (relIdx === -1) relIdx = 0;

    var item = releases[relIdx];

    var relCatBadge = document.getElementById("relCategoryBadge");
    var relYearBadge = document.getElementById("relYearBadge");
    var relMetaLine = document.getElementById("relMetaLine");
    var relTitle = document.getElementById("relTitle");
    var relCover = document.getElementById("relCover");
    var relSpotifyIframe = document.getElementById("relSpotifyIframe");
    var relSpotifyExternalBtn = document.getElementById("relSpotifyExternalBtn");
    var relPrevBtn = document.getElementById("relPrevBtn");
    var relNextBtn = document.getElementById("relNextBtn");

    if (relCatBadge) relCatBadge.textContent = item.cat || "SOLISTA";
    if (relYearBadge) relYearBadge.textContent = item.year || "";
    if (relMetaLine) relMetaLine.textContent = (item.year || "") + " · " + (item.cat || "REGISTRO DE OBRA");
    if (relTitle) relTitle.textContent = item.title;

    if (relCover) {
      relCover.src = item.cover;
      relCover.alt = item.title;
    }

    if (relSpotifyIframe && item.spotify_embed) {
      relSpotifyIframe.src = item.spotify_embed;
    }

    if (relSpotifyExternalBtn && item.spotify_embed) {
      var cleanUrl = item.spotify_embed.replace("/embed/", "/").split("?")[0];
      relSpotifyExternalBtn.href = cleanUrl;
    }

    // Ficha Técnica (inline)
    var fichaCard = document.getElementById("rel-ficha");
    var creditsBody = document.getElementById("relCreditsBody");
    if (fichaCard && creditsBody) {
      var creditsContent = (item.credits_html && item.credits_html.trim())
        ? item.credits_html
        : "<p><strong>Año:</strong> " + (item.year || "") + "</p>" +
          "<p><strong>Categoría:</strong> " + (item.cat || "SOLISTA") + "</p>" +
          "<p><strong>Artista:</strong> Maxi Prietto</p>";
      creditsBody.innerHTML = creditsContent;
      fichaCard.style.display = "block";
    }

    // Photos (thumbnails)
    var photosCard = document.getElementById("rel-photos");
    var photosGrid = document.getElementById("relPhotosGrid");
    if (photosCard && photosGrid) {
      if (item.photos && item.photos.length) {
        photosCard.style.display = "block";
        photosGrid.innerHTML = item.photos.map(function (p) {
          return '<figure class="release-gallery-item">' +
            '<img src="' + p.src + '" alt="' + (p.alt || "") + '" loading="lazy"/>' +
            '<figcaption>' + (p.caption || p.alt || "") + '</figcaption>' +
          '</figure>';
        }).join("");
      } else {
        photosCard.style.display = "none";
        photosGrid.innerHTML = "";
      }
    }

    // Songs & Lyrics
    var letrasCard = document.getElementById("rel-letras");
    var songsContainer = document.getElementById("relSongsContainer");
    if (letrasCard && songsContainer) {
      if (item.songs && item.songs.length) {
        letrasCard.style.display = "block";
        songsContainer.innerHTML = item.songs.map(function (s) {
          return '<div class="release-song-block">' +
            '<h4>' + s.title + '</h4>' +
            '<p>' + s.lines.join("<br>") + '</p>' +
          '</div>';
        }).join("");
      } else {
        letrasCard.style.display = "none";
        songsContainer.innerHTML = "";
      }
    }

    // Pager
    var prevItem = releases[relIdx === 0 ? releases.length - 1 : relIdx - 1];
    var nextItem = releases[relIdx === releases.length - 1 ? 0 : relIdx + 1];

    if (relPrevBtn) {
      relPrevBtn.href = "#/disco/" + prevItem.key;
      relPrevBtn.textContent = "← " + prevItem.title;
    }
    if (relNextBtn) {
      relNextBtn.href = "#/disco/" + nextItem.key;
      relNextBtn.textContent = nextItem.title + " →";
    }

    document.title = "Prietto — " + item.title + " (" + item.year + ")";
  }

  function render() {
    var id = routeFromHash();
    var idx = indexOfRoute(id);
    var meta = ROUTES[idx];

    views.forEach(function (v) {
      v.classList.toggle("is-active", v.id === id);
    });

    body.setAttribute("data-route", id);
    if (id === "release") {
      renderReleasePage();
      tbWhere.textContent = "Disco";
      setPager(idx);
    } else if (id !== "home") {
      tbWhere.textContent = meta.label;
      setPager(idx);
    }

    var raw = (location.hash || "").replace(/^#\/?/, "").trim();
    var anchorPart = "";
    if (raw.indexOf("letras/") === 0) {
      anchorPart = raw.substring(7);
    } else if (raw.indexOf("#") !== -1) {
      anchorPart = raw.split("#")[1];
    } else if (raw.indexOf("letras-") === 0) {
      anchorPart = raw;
    }

    if (anchorPart) {
      setTimeout(function () {
        var el = document.getElementById(anchorPart);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
      }, 80);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

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

  /* ---------- Click en Tapa de Disco -> Cargar Spotify Embed ---------- */
  document.addEventListener("click", function (e) {
    var cover = e.target.closest(".cover[data-spotify-embed]");
    if (cover) {
      var embedUrl = cover.getAttribute("data-spotify-embed");
      var iframe = document.getElementById("spotifyIframe");
      var wrap = document.querySelector(".spotify-wrap");
      if (iframe && embedUrl) {
        iframe.src = embedUrl;
        if (wrap) {
          wrap.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      return;
    }

    var bookletBtn = e.target.closest("[data-booklet]");
    if (bookletBtn) {
      var modalId = bookletBtn.getAttribute("data-booklet");
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }
      return;
    }

    var closeBtn = e.target.closest(".bm-close");
    var overlayBtn = e.target.closest(".bm-overlay");
    if (closeBtn || overlayBtn) {
      var openModal = document.querySelector(".booklet-modal.is-open");
      if (openModal) {
        openModal.classList.remove("is-open");
        openModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var openModal = document.querySelector(".booklet-modal.is-open");
      if (openModal) {
        openModal.classList.remove("is-open");
        openModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    }
  });

  render();

  window.openReleaseFichaModal = function (key) {
    var raw = (location.hash || "").replace(/^#\/?/, "").trim();
    var parts = raw.split("/");
    var currentKey = key || (parts.length > 1 ? parts[1].split("#")[0].split("?")[0] : "");

    var releases = window.PRIETTO_RELEASES || [];
    var relIdx = 0;
    if (currentKey) {
      for (var i = 0; i < releases.length; i++) {
        if (releases[i].key === currentKey || releases[i].key.toLowerCase() === currentKey.toLowerCase()) {
          relIdx = i;
          break;
        }
      }
    }
    var item = releases[relIdx] || releases[0];

    var modal = document.getElementById("releaseFichaModal");
    var modCategoryBadge = document.getElementById("modCategoryBadge");
    var modTitle = document.getElementById("modTitle");
    var modSubtitle = document.getElementById("modSubtitle");
    var modCreditsBody = document.getElementById("modCreditsBody");
    var modGalleryGrid = document.getElementById("modGalleryGrid");
    var modGallerySection = document.getElementById("modGallerySection");

    if (modCategoryBadge) modCategoryBadge.textContent = (item.year || "") + " · " + (item.cat || "ÁLBUM");
    if (modTitle) modTitle.textContent = item.title;
    if (modSubtitle) {
      var artist = "Maxi Prietto";
      if (item.cat === "LOS ESPÍRITUS") artist = "Los Espíritus";
      else if (item.cat === "COSMOS") artist = "Prietto Viaja al Cosmos";
      modSubtitle.textContent = artist + " · Ficha Técnica & Fotos de Grabación";
    }

    if (modCreditsBody) {
      modCreditsBody.innerHTML = (item.credits_html && item.credits_html.trim())
        ? item.credits_html
        : "<p><strong>Año de lanzamiento:</strong> " + (item.year || "") + "</p><p><strong>Categoría:</strong> " + (item.cat || "SOLISTA") + "</p><p><strong>Artista:</strong> Maxi Prietto</p><p><em>Información técnica de grabación y créditos de obra.</em></p>";
    }

    if (modGalleryGrid && modGallerySection) {
      if (item.photos && item.photos.length) {
        modGallerySection.style.display = "block";
        modGalleryGrid.innerHTML = item.photos.map(function (p) {
          return '<figure class="bm-photo">' +
            '<img src="' + p.src + '" alt="' + (p.alt || "") + '" loading="lazy"/>' +
            '<figcaption>' + (p.caption || p.alt || "") + '</figcaption>' +
          '</figure>';
        }).join("");
      } else {
        modGallerySection.style.display = "none";
        modGalleryGrid.innerHTML = "";
      }
    }

    if (modal) {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }
  };

  window.closeReleaseFichaModal = function () {
    var modal = document.getElementById("releaseFichaModal");
    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
  };

})();
