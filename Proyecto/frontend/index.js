import FormularioRegistro from './modulos/modulo_registro/formularioRegistro.js';
import KaraokeBasico from './modulos/modulo_karaoke/index.js';
import ListaCanciones from './modulos/modulo_lista_canciones/index.js';

window.addEventListener('DOMContentLoaded', () => {
    // Render registro form (existing behavior)
    const registroEntity = document.getElementById('registro');
    const formulario = new FormularioRegistro(registroEntity, '0 1.5 -6');
    formulario.render();

    // Integrar módulo lista de canciones
    const listaContainer = document.getElementById('lista-canciones');
    if (listaContainer) {
        const lista = new ListaCanciones(listaContainer, listaContainer.getAttribute('position') || '6 2.5 -3');
        lista.render();

        // Al seleccionar una canción, colocar atributo con el archivo seleccionado en el componente karaoke (para integraciones posteriores)
        listaContainer.addEventListener('song-selected', (e) => {
            console.log('Canción seleccionada (integración):', e.detail);
            const karaokeEl = document.getElementById('karaoke-vr-component');
            if (karaokeEl) {
                // Guardamos el path seleccionado en un atributo data para que el componente karaoke pueda leerlo
                karaokeEl.setAttribute('data-selected-file', `./videos/${e.detail.file}`);
            }
        });
    }

});