// Fuente MSDF por defecto para <a-text> / el componente `text` de A-Frame.
//
// La fuente que trae A-Frame por defecto ("roboto", cdn.aframe.io/fonts/Roboto-msdf.json) solo
// cubre el rango ASCII imprimible (códigos 32-126): no tiene glifos para ñ/Ñ, vocales acentuadas
// (á é í ó ú, mayúsculas incluidas) ni ¿/¡. Cualquier texto en español con esos caracteres se
// veía en blanco/recortado en toda la app (canciones, frases, formularios).
//
// `english-vr/VR/fonts/Arial-msdf.json` + `.png` es un atlas MSDF generado a partir de Arial
// (herramienta `msdf-bmfont-xml`) con un charset ampliado: ASCII + áéíóúÁÉÍÓÚñÑüÜ¿¡ªº.
//
// Este script debe cargarse justo después de aframe.min.js y antes de que la escena (<a-scene>)
// se parsee, para que el nuevo valor por defecto aplique a todos los <a-text> de la app sin tener
// que declarar `font` en cada uno.
(function () {
    if (typeof AFRAME === 'undefined' || !AFRAME.components.text) {
        console.warn('fonts.js: AFRAME.components.text no está disponible todavía; no se pudo fijar la fuente por defecto (¿se cargó este script antes que aframe.min.js?).');
        return;
    }
    AFRAME.components.text.schema.font.default = '/A-frame/english-vr/VR/fonts/Arial-msdf.json';
})();
