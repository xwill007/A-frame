// Componente visor-cancion-vr.js
// Requiere aframe-htmlembed-component para mostrar iframes de YouTube
AFRAME.registerComponent('visor-cancion-vr', {
    schema: {
        videoUrl: {type: 'string', default: ''},
        lyrics: {type: 'array', default: []},
        visible: {type: 'boolean', default: false}
    },
    init: function () {
        this.createVisor();
        this.el.setAttribute('visible', false);
    },
    createVisor: function() {
        // Plano para el video (usando aframe-htmlembed-component)
        this.videoPlane = document.createElement('a-entity');
        this.videoPlane.setAttribute('geometry', {
            primitive: 'plane', width: 4, height: 2.5
        });
        this.videoPlane.setAttribute('position', '0 2.5 0');
        this.videoPlane.setAttribute('htmlembed', {
            width: 800,
            height: 500,
            src: this.data.videoUrl || 'https://www.youtube.com/embed/YQHsXMglC9A',
            cssselector: 'body'
        });
        // Plano para la letra
        this.lyricsPlane = document.createElement('a-plane');
        this.lyricsPlane.setAttribute('width', '4');
        this.lyricsPlane.setAttribute('height', '1.2');
        this.lyricsPlane.setAttribute('color', '#222');
        this.lyricsPlane.setAttribute('opacity', '0.85');
        this.lyricsPlane.setAttribute('position', '0 0.7 0.01');
        // Texto de la letra
        this.lyricsText = document.createElement('a-text');
        this.lyricsText.setAttribute('value', this.data.lyrics.join('\n') || 'Letra de la canción...');
        this.lyricsText.setAttribute('align', 'center');
        this.lyricsText.setAttribute('color', '#fff');
        this.lyricsText.setAttribute('width', '3.8');
        this.lyricsText.setAttribute('position', '0 0 0.02');
        this.lyricsPlane.appendChild(this.lyricsText);
        // Botón cerrar
        this.closeButton = document.createElement('a-box');
        this.closeButton.setAttribute('position', '0 -1.5 0.05');
        this.closeButton.setAttribute('width', '0.7');
        this.closeButton.setAttribute('height', '0.4');
        this.closeButton.setAttribute('depth', '0.1');
        this.closeButton.setAttribute('color', '#b83dba');
        this.closeButton.classList.add('clickable');
        const closeText = document.createElement('a-text');
        closeText.setAttribute('value', 'CERRAR');
        closeText.setAttribute('align', 'center');
        closeText.setAttribute('color', '#fff');
        closeText.setAttribute('position', '0 0 0.08');
        closeText.setAttribute('scale', '0.5 0.5 1');
        this.closeButton.appendChild(closeText);
        // Ensamblar visor
        this.el.appendChild(this.videoPlane);
        this.el.appendChild(this.lyricsPlane);
        this.el.appendChild(this.closeButton);
        // Evento cerrar
        this.closeButton.addEventListener('click', () => {
            this.hide();
        });
    },
    update: function() {
        // Actualizar video y letra
        if (this.data.videoUrl) {
            this.videoPlane.setAttribute('htmlembed', 'src', this.data.videoUrl);
        }
        if (this.data.lyrics && this.data.lyrics.length > 0) {
            this.lyricsText.setAttribute('value', this.data.lyrics.join('\n'));
        }
        this.el.setAttribute('visible', this.data.visible);
    },
    show: function(videoUrl, lyrics) {
        this.data.videoUrl = videoUrl;
        this.data.lyrics = lyrics;
        this.el.setAttribute('visible', true);
        this.update();
    },
    hide: function() {
        this.el.setAttribute('visible', false);
    }
});

// NOTA: Debes incluir la librería aframe-htmlembed-component en tu index.html para que funcione el iframe de YouTube.
// <script src="https://unpkg.com/aframe-htmlembed-component/dist/aframe-htmlembed-component.min.js"></script>
