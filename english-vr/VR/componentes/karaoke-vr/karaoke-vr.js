// Funcionalidad del karaoke VR
document.addEventListener('DOMContentLoaded', function() {
    console.log('Karaoke VR cargado');

    // Componente karaoke-vr.js
    // Requiere aframe-htmlembed-component para mostrar iframes de YouTube
    AFRAME.registerComponent('karaoke-vr', {
        schema: {
            videoPath: { type: 'string', default: './videos/mi-video.mp4' },
            videoWidth: { type: 'number', default: 9 },
            videoHeight: { type: 'number', default: 6 },
            videoList: { type: 'string', default: 'GangstasParadise.mp4,itsMyLife.mp4,StandByMe.mp4' },
            textColor: { type: 'string', default: '#00008B' },
            videoPosition: { type: 'string', default: '0 2.5 3' },
            listPosition: { type: 'string', default: '6 2.5 -3' }
        },
        init: function () {
            console.log('Inicializando componente karaoke-vr');

            // Crear contenedor para la lista de videos
            const videoListContainer = document.createElement('a-entity');
            videoListContainer.setAttribute('position', this.data.listPosition);

            // Obtener lista de videos desde la propiedad videoList
            const videos = this.data.videoList.split(',');

            // Crear elementos para cada video
            videos.forEach((video, index) => {
                const videoItem = document.createElement('a-text');
                videoItem.setAttribute('value', video);
                videoItem.setAttribute('position', `0 ${-index * 0.5} 0`);
                videoItem.setAttribute('color', this.data.textColor);
                videoItem.setAttribute('class', 'clickable');

                // Agregar evento de clic para seleccionar el video
                videoItem.addEventListener('click', () => {
                    console.log(`Seleccionado: ${video}`);
                    this.loadVideo(`./videos/karaoke/${video}`);
                });

                videoListContainer.appendChild(videoItem);
            });

            this.el.appendChild(videoListContainer);

            // Verificar si la propiedad visible es true y cargar el video inicial
            if (this.el.getAttribute('visible')) {
                this.loadVideo(this.data.videoPath);
            }
        },

        loadVideo: function (videoPath) {
            console.log(`Cargando video: ${videoPath}`);

            // Eliminar cualquier video existente
            const existingVideo = this.el.querySelector('a-video');
            if (existingVideo) {
                this.el.removeChild(existingVideo);
            }

            // Crear nuevo elemento de video
            const videoElement = document.createElement('a-video');
            videoElement.setAttribute('src', videoPath);
            videoElement.setAttribute('width', this.data.videoWidth);
            videoElement.setAttribute('height', this.data.videoHeight);
            videoElement.setAttribute('position', this.data.videoPosition);

            this.el.appendChild(videoElement);
        }
    });
    
    // NOTA: Debes incluir la librería aframe-htmlembed-component en tu index.html para que funcione el iframe de YouTube.
    // <script src="https://unpkg.com/aframe-htmlembed-component/dist/aframe-htmlembed-component.min.js"></script>
});
