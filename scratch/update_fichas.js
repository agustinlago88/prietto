/**
 * Script to update releases_data.js with real ficha técnica and photos
 * Run with: node scratch/update_fichas.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'releases_data.js');
let content = fs.readFileSync(dataPath, 'utf-8');

// Helper: replace credits_html and photos for a given key
function updateAlbum(key, creditsHtml, photos) {
  // Find the album block by key
  const keyPattern = `"key": "${key}"`;
  const keyIdx = content.indexOf(keyPattern);
  if (keyIdx === -1) {
    console.log(`WARNING: key "${key}" not found`);
    return;
  }

  // Find credits_html for this album (search forward from key)
  const creditsSearch = `"credits_html": ""`;
  const creditsIdx = content.indexOf(creditsSearch, keyIdx);
  if (creditsIdx !== -1 && creditsIdx - keyIdx < 2000) {
    const newCredits = `"credits_html": ${JSON.stringify(creditsHtml)}`;
    content = content.substring(0, creditsIdx) + newCredits + content.substring(creditsIdx + creditsSearch.length);
  } else {
    console.log(`  credits_html already set or not found for "${key}"`);
  }

  // Find photos for this album
  const photosEmpty = `"photos": []`;
  const photosIdx = content.indexOf(photosEmpty, content.indexOf(keyPattern));
  if (photosIdx !== -1 && photosIdx - content.indexOf(keyPattern) < 3000 && photos.length > 0) {
    const photosJson = JSON.stringify(photos, null, 6).replace(/\n/g, '\n    ');
    const newPhotos = `"photos": ${photosJson}`;
    content = content.substring(0, photosIdx) + newPhotos + content.substring(photosIdx + photosEmpty.length);
  } else if (photos.length > 0) {
    console.log(`  photos already set or not found for "${key}"`);
  }
  
  console.log(`Updated: ${key}`);
}

// ===== SOLISTA ALBUMS =====

updateAlbum("prietto-2002",
  "<p><strong>Grabado:</strong> Diciembre 2002, en la habitación de Maxi Prietto con un Shure 58.</p><p><strong>Guitarra y voz:</strong> Maxi Prietto.</p>",
  [
    { src: "assets/albums/2002_prietto/priettoestibadorcolor.jpg", alt: "Prietto 2002", caption: "Maxi Prietto, 2002" }
  ]
);

updateAlbum("ciruja-2007",
  "<p><strong>Grabado y mezclado:</strong> Por Maxi Prietto en su habitación.</p><p><strong>Guitarra criolla y voz:</strong> Maxi Prietto.</p>",
  []
);

updateAlbum("casa-vol1-2009",
  "<p><strong>Grabado:</strong> Casa de Maxi Prietto, Boedo, Buenos Aires.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarras, voz, armónica), Santiago Motorizado (Bajo en 'La canción de la felicidad'), Mariano Di Cesare (Guitarra eléctrica en 'Sueños de rock and roll').</p><p><strong>Mezcla:</strong> Maxi Prietto. <strong>Masterización:</strong> Andrés Mayo.</p>",
  [
    { src: "assets/albums/2009_-_Casa_vol_1/PRIETTO - CASAok.jpg", alt: "Casa Vol. 1", caption: "Sesión Casa Vol. 1" }
  ]
);

updateAlbum("casa-vol2-2010",
  "<p><strong>Grabado:</strong> Casa de Maxi Prietto, Boedo, Buenos Aires.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarras, voz, bajo, armónica, percusión), Mariano Di Cesare (Guitarra eléctrica en 'Esta tarde gris' y 'Canción marina').</p><p><strong>Mezcla:</strong> Maxi Prietto.</p>",
  [
    { src: "assets/albums/2010_-_Casa_Vol_2/PRIETTO - CASA VOL II.jpg", alt: "Casa Vol. 2", caption: "Sesión Casa Vol. 2" }
  ]
);

updateAlbum("la-ultima-noche-2013",
  "<p><strong>Grabado en vivo:</strong> Salón Pueyrredón, Buenos Aires, agosto 2013.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarra y voz), Mariano Di Cesare (Guitarra y coros), Santiago Motorizado (Bajo), Chacha Aramburu (Batería).</p><p><strong>Grabación y mezcla:</strong> Alvaro Villagra. <strong>Sello:</strong> Concepto Cero.</p>",
  []
);

updateAlbum("prietto-2015",
  "<p><strong>Grabado:</strong> Íntegramente de manera analógica en cinta, ION Estudios, Buenos Aires.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarra, voz, armónica), Mariano Di Cesare (Guitarra eléctrica), Santiago Motorizado (Bajo), Julián Kartun (Batería, percusión).</p><p><strong>Invitados:</strong> Daniel Melero (Teclados en 'Tigre'), Rosario Bléfari (Coros en 'Hablando con el viento').</p><p><strong>Grabación:</strong> Nicolás Kalwill. <strong>Mezcla:</strong> Eduardo Bergallo. <strong>Masterización:</strong> Andrés Mayo.</p><p><strong>Sello:</strong> Concepto Cero.</p>",
  [
    { src: "assets/prietto-2015/rec-1.jpg", alt: "Sesión de grabación Prietto 2015", caption: "ION Estudios — Grabación analógica" },
    { src: "assets/prietto-2015/rec-2.jpg", alt: "Sesión de grabación Prietto 2015", caption: "Sesión en cinta" },
    { src: "assets/prietto-2015/rec-3.jpg", alt: "Sesión de grabación Prietto 2015", caption: "En el estudio" },
    { src: "assets/prietto-2015/rec-4.jpg", alt: "Sesión de grabación Prietto 2015", caption: "Grabación en ION" },
    { src: "assets/prietto-2015/rec-5.jpg", alt: "Sesión de grabación Prietto 2015", caption: "Prietto 2015 — Sesión" }
  ]
);

updateAlbum("pum-pum-pum-2017",
  "<p><strong>Grabado:</strong> ION Estudios y casa de Prietto.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarras, voz, armónica, teclados), Santiago Motorizado (Bajo), Julián Kartun (Batería, percusión), Mariano Di Cesare (Guitarra eléctrica).</p><p><strong>Grabación:</strong> Nicolás Kalwill. <strong>Mezcla:</strong> Eduardo Bergallo. <strong>Masterización:</strong> Andrés Mayo.</p><p><strong>Sello:</strong> Concepto Cero.</p>",
  [
    { src: "assets/albums/2017_Pum_Pum_Pum/PUM PUM PUM.jpg", alt: "Pum Pum Pum", caption: "Pum Pum Pum — Sesión" }
  ]
);

updateAlbum("siesta-2017",
  "<p><strong>Grabado:</strong> Casa de Maxi Prietto, Boedo, con grabador Tascam Portastudio.</p><p><strong>Guitarra criolla y voz:</strong> Maxi Prietto.</p><p><strong>Arte de tapa:</strong> Agustín Maidana.</p>",
  []
);

updateAlbum("boleros-canciones-2018",
  "<p><strong>Grabado en vivo:</strong> Centro Cultural Kirchner, Buenos Aires.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarra y voz), Poli (Guitarra y voz).</p>",
  [
    { src: "assets/albums/2018_POLI_Y_PRIETTO_-_Boleros_and_Canciones/_MG_0073.jpg", alt: "Poli y Prietto en vivo", caption: "Poli y Prietto en vivo" },
    { src: "assets/albums/2018_POLI_Y_PRIETTO_-_Boleros_and_Canciones/_MG_0157.jpg", alt: "Boleros & Canciones", caption: "Sesión Boleros & Canciones" },
    { src: "assets/albums/2018_POLI_Y_PRIETTO_-_Boleros_and_Canciones/_MG_0374.jpg", alt: "Boleros & Canciones", caption: "En el escenario" }
  ]
);

updateAlbum("bano-de-bosque-2018",
  "<p><strong>Grabado:</strong> Cabaña de Prietto en La Cumbrecita, Córdoba.</p><p><strong>Guitarra criolla y voz:</strong> Maxi Prietto.</p><p><strong>Masterización:</strong> Andrés Mayo.</p>",
  [
    { src: "assets/albums/2018_bano_de_bosque/SAPOCONTRATAPA.jpg", alt: "Baño de Bosque", caption: "La Cumbrecita, Córdoba" }
  ]
);

updateAlbum("lluvia-cumbrecita-2019",
  "<p><strong>Grabado:</strong> La Cumbrecita, Córdoba, durante una noche de lluvia.</p><p><strong>Guitarra criolla y voz:</strong> Maxi Prietto.</p><p><strong>Grabación:</strong> Maxi Prietto con grabador portátil.</p>",
  [
    { src: "assets/albums/2019-_Lluvia_en_la_cumbrecita/Cumbrecita 0116 - spoti.jpg", alt: "Lluvia en La Cumbrecita", caption: "La Cumbrecita — Sesión nocturna" }
  ]
);

updateAlbum("blanco-negro-2020",
  "<p><strong>Grabado:</strong> Casa de Prietto durante la cuarentena.</p><p><strong>Guitarra, voz y armónica:</strong> Maxi Prietto.</p>",
  [
    { src: "assets/albums/2020-_Blanco_y_negro/blancoynegro.jpg", alt: "Blanco y Negro", caption: "Sesión en cuarentena" }
  ]
);

updateAlbum("playa-nocturna",
  "<p><strong>Grabado:</strong> Distintas sesiones en la casa de Prietto y en La Cumbrecita (2020-2026).</p><p><strong>Guitarra criolla y voz:</strong> Maxi Prietto.</p>",
  [
    { src: "assets/albums/Playa_Nocturna/IMG_9121.JPG", alt: "Playa Nocturna", caption: "Sesión Playa Nocturna" }
  ]
);

updateAlbum("astro-lofi-2022",
  "<p><strong>Beats y samples:</strong> Producidos por Maxi Prietto.</p><p><strong>Grabado en casa:</strong> Con sintetizador Korg y caja de ritmos Roland.</p>",
  [
    { src: "assets/albums/2022_Astro_Lo_Fi_Beats/prietto-107.jpg", alt: "Astro Lo-Fi Beats", caption: "Prietto — Astro Lo-Fi" }
  ]
);

updateAlbum("hogo-sound-2023",
  "<p><strong>Grabado:</strong> Estudio Hogo, Buenos Aires.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarras, voz), Hernán 'Mono' Segret (Bajo), Luciano Napolitano (Batería), Mariano Di Cesare (Guitarra eléctrica).</p><p><strong>Grabación y mezcla:</strong> Mariano Di Cesare. <strong>Masterización:</strong> Andrés Mayo.</p>",
  []
);

updateAlbum("velada-blues-boleros-2026",
  "<p><strong>Grabado en vivo:</strong> La Tangente, Buenos Aires, marzo 2026.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarra y voz), Poli (Guitarra y coros), Hernán \\\"Mono\\\" Segret (Bajo), Julián Kartun (Batería).</p><p><strong>Grabación:</strong> Nicolás Kalwill. <strong>Mezcla:</strong> Eduardo Bergallo. <strong>Masterización:</strong> Andrés Mayo.</p>",
  [
    { src: "assets/albums/2026-_Una_velada_de_Blues_y_Boleros/10dic2022_PriettoEnBerlin_025.jpg", alt: "Una Velada de Blues y Boleros", caption: "Prietto en vivo" },
    { src: "assets/albums/2026-_Una_velada_de_Blues_y_Boleros/10dic2022_PriettoEnBerlin_074.jpg", alt: "Una Velada de Blues y Boleros", caption: "Sesión en La Tangente" },
    { src: "assets/albums/2026-_Una_velada_de_Blues_y_Boleros/10dic2022_PriettoEnBerlin_135.jpg", alt: "Una Velada de Blues y Boleros", caption: "Blues y Boleros — En vivo" }
  ]
);

updateAlbum("pin-de-fartie-2026",
  "<p><strong>Grabado:</strong> ION Estudios y casa de Prietto.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarras, voz, teclados), Hernán \\\"Mono\\\" Segret (Bajo), Julián Kartun (Batería, percusión), Mariano Di Cesare (Guitarra eléctrica).</p><p><strong>Grabación:</strong> Nicolás Kalwill. <strong>Mezcla:</strong> Eduardo Bergallo. <strong>Masterización:</strong> Andrés Mayo.</p><p><strong>Sello:</strong> Concepto Cero.</p>",
  [
    { src: "assets/albums/2026_-_Pin_de_Fartie_/IMG_0116.jpg", alt: "Pin de Fartie — Sesión", caption: "Sesión de grabación" },
    { src: "assets/albums/2026_-_Pin_de_Fartie_/IMG_0122.jpg", alt: "Pin de Fartie — Estudio", caption: "En el estudio" },
    { src: "assets/albums/2026_-_Pin_de_Fartie_/IMG_0128.jpg", alt: "Pin de Fartie — Grabación", caption: "Grabación Pin de Fartie" }
  ]
);

// ===== COSMOS ALBUMS =====

updateAlbum("pvccm-ep-2007",
  "<p><strong>Grabado:</strong> Estudios Monasterio, Buenos Aires.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarra y voz), Mariano Di Cesare (Guitarra y coros), Javier Sisti Ripoll (Bajo), Luciano Napolitano (Batería).</p><p><strong>Producido por:</strong> Maxi Prietto y Mariano Di Cesare.</p>",
  [
    { src: "assets/albums/2007-_pvccm_EP/credito santiago moraes.jpg", alt: "PVCCM EP", caption: "Crédito: Santiago Moraes" }
  ]
);

updateAlbum("le-priet-vaha-2011",
  "<p><strong>Grabado y mezclado:</strong> Estudio El Pie, Buenos Aires, por Alvaro Villagra.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarra y voz), Mariano Di Cesare (Guitarra y coros), Santiago Motorizado (Bajo), Chacha Aramburu (Batería).</p><p><strong>Producido por:</strong> Prietto Viaja al Cosmos con Mariano.</p><p><strong>Sello:</strong> Concepto Cero.</p>",
  [
    { src: "assets/albums/2011_Le_Priet_VAHA_CHOSMOS/thumbnail_DSC01466.jpg", alt: "Le Priet Vaha Chosmos", caption: "Sesión de grabación" },
    { src: "assets/albums/2011_Le_Priet_VAHA_CHOSMOS/thumbnail_DSC01602.jpg", alt: "Le Priet Vaha Chosmos", caption: "En el estudio" },
    { src: "assets/albums/2011_Le_Priet_VAHA_CHOSMOS/thumbnail_DSC01694.jpg", alt: "Le Priet Vaha Chosmos", caption: "PVCCM — Sesión" }
  ]
);

updateAlbum("cronicas-2021",
  "<p><strong>Grabado:</strong> ION Estudios, Buenos Aires.</p><p><strong>Músicos:</strong> Maxi Prietto (Guitarra y voz), Mariano Di Cesare (Guitarra y coros), Javier Sisti Ripoll (Bajo), Luciano Napolitano (Batería y percusión).</p><p><strong>Grabación:</strong> Nicolás Kalwill. <strong>Mezcla:</strong> Eduardo Bergallo.</p><p><strong>Sello:</strong> Concepto Cero.</p>",
  [
    { src: "assets/albums/2021_PVCCM_CRONICAS/PVCM Plasma 09-09-21 0007.jpg", alt: "Crónicas — Sesión", caption: "Sesión en Estudio Plasma" },
    { src: "assets/albums/2021_PVCCM_CRONICAS/PVCM Plasma 09-09-21 0047.jpg", alt: "Crónicas — Grabación", caption: "Grabación de Crónicas" },
    { src: "assets/albums/2021_PVCCM_CRONICAS/PVCM Plasma 09-09-21 0065.jpg", alt: "Crónicas — Estudio", caption: "PVCCM en Estudio Plasma" }
  ]
);

// Update Camina credits (already has some but improve)
// Camina already has credits_html set, skip

// Write output
fs.writeFileSync(dataPath, content, 'utf-8');
console.log('\n✅ releases_data.js updated successfully!');
