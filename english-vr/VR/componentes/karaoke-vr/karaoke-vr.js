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
            videoList: { type: 'string', default: 'GangstasParadise.mp4|Coolio,itsMyLife.mp4|Bon Jovi,StandByMe.mp4|Ben E. King' },
            textColor: { type: 'string', default: '#FFFFFF' },
            buttonColor: { type: 'string', default: '#4CAF50' },
            backgroundColor: { type: 'string', default: '#454545ff' },
            videoPosition: { type: 'string', default: '0 2.5 3' },
            listPosition: { type: 'string', default: '6 2.5 -3' }
        },
        init: function () {
            console.log('Inicializando componente karaoke-vr');

            // Eliminar canal alfa de los colores
            const buttonColor = this.data.buttonColor.slice(0, 7);
            const backgroundColor = this.data.backgroundColor.slice(0, 7);

            console.log('Color del botón (sin alfa):', buttonColor);
            console.log('Color del fondo (sin alfa):', backgroundColor);

            // Crear contenedor para la lista de videos
            const videoListContainer = document.createElement('a-entity');
            videoListContainer.setAttribute('position', this.data.listPosition);

            // Crear fondo para la lista de videos
            const background = document.createElement('a-plane');
            const buttonCount = this.data.videoList.split(',').length;
            const backgroundHeight = buttonCount * 0.8 + 1.5; // Altura ajustada para incluir el título
            background.setAttribute('width', 4); // Ajustar el ancho del fondo
            background.setAttribute('height', backgroundHeight); // Ajustar la altura del fondo
            background.setAttribute('color', backgroundColor);
            background.setAttribute('position', `0 ${-backgroundHeight / 2 + 0.4} -0.01`); // Centrar el fondo respecto a los botones

            // Agregar título dentro del fondo
            const title = document.createElement('a-text');
            title.setAttribute('value', 'LISTA CANCIONES');
            title.setAttribute('align', 'center');
            title.setAttribute('color', this.data.textColor);
            title.setAttribute('width', 4); // Ajustar el ancho del texto
            title.setAttribute('position', '0 1.6 0.1'); // Posición ajustada para estar al inicio del cuadro
            background.appendChild(title);

            videoListContainer.appendChild(background);

            // Ajustar la lógica para incluir la duración del video
            const videos = this.data.videoList.split(',');
            videos.forEach((video, index) => {
                const [fileName, artist, duration] = video.split('|');

                // Verificar si el nombre del artista y la duración están definidos
                const artistName = artist ? artist : 'Artista desconocido';
                const videoDuration = duration ? duration : 'Duración desconocida';

                // Crear cuadro para el botón
                const button = document.createElement('a-plane');
                button.setAttribute('width', 3); // Ajustar el ancho del cuadro
                button.setAttribute('height', 0.7); // Ajustar la altura del cuadro
                button.setAttribute('color', buttonColor);
                button.setAttribute('position', `0 ${-index * 0.8 - 0.5} 0`); // Ajustar posición para dar espacio al título
                button.setAttribute('class', 'clickable');

                // Crear texto para el título, artista y duración
                const titleText = document.createElement('a-text');
                titleText.setAttribute('value', `${fileName} - ${artistName} (${videoDuration})`);
                titleText.setAttribute('align', 'center');
                titleText.setAttribute('color', this.data.textColor);
                titleText.setAttribute('width', 2.8); // Ajustar el ancho del texto para que se ajuste al cuadro
                titleText.setAttribute('position', '0 0 0.1');

                // Agregar evento de clic para seleccionar el video
                button.addEventListener('click', () => {
                    console.log(`Seleccionado: ${fileName}`);
                    this.loadVideo(`./videos/karaoke/${fileName}`);
                });

                button.appendChild(titleText);
                videoListContainer.appendChild(button);
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
