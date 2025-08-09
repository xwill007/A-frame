// Funcionalidad del karaoke VR
document.addEventListener('DOMContentLoaded', function() {
    console.log('Karaoke VR cargado');
    
    // Letras de la canción
    const lyrics = [
        { english: "Imagine there's no heaven", spanish: "Imagina que no hay un cielo", time: 0 },
        { english: "It's easy if you try", spanish: "Es fácil si lo intentas", time: 4000 },
        { english: "No hell below us", spanish: "No hay infierno debajo de nosotros", time: 8000 },
        { english: "Above us only sky", spanish: "Sobre nosotros solo el cielo", time: 12000 },
        { english: "Imagine all the people", spanish: "Imagina a toda la gente", time: 16000 },
        { english: "Living for today", spanish: "Viviendo el presente", time: 20000 }
    ];
    
    let currentLyricIndex = 0;
    let isPlaying = false;
    let startTime = 0;
    
    // Esperar a que A-Frame esté listo
    document.querySelector('a-scene').addEventListener('loaded', function() {
        console.log('Escena de karaoke VR cargada');
        
        // Elementos de la interfaz
        const playBtn = document.getElementById('play-btn');
        const stopBtn = document.getElementById('stop-btn');
        const backBtn = document.getElementById('back-btn');
        const currentLine = document.getElementById('current-line');
        const translationLine = document.getElementById('translation-line');
        const nextLine = document.getElementById('next-line');
        const progressFill = document.getElementById('progress-fill');
        
        // Contenedor del video de YouTube
        const youtubeContainer = document.getElementById('youtube-video-container');

        // Función para mostrar el video de YouTube
        function showYouTubeVideo() {
            if (youtubeContainer) {
                youtubeContainer.setAttribute('visible', 'true');
                console.log('Mostrando video de YouTube');
            }
        }

        // Función para ocultar el video de YouTube
        function hideYouTubeVideo() {
            if (youtubeContainer) {
                youtubeContainer.setAttribute('visible', 'false');
                console.log('Ocultando video de YouTube');
            }
        }
        
        // Controles de música
        if (playBtn) {
            playBtn.addEventListener('click', function() {
                if (!isPlaying) {
                    startKaraoke();
                    showYouTubeVideo();
                    this.querySelector('a-text').setAttribute('value', 'PAUSE');
                    this.setAttribute('color', '#ffaa00');
                } else {
                    pauseKaraoke();
                    hideYouTubeVideo();
                    this.querySelector('a-text').setAttribute('value', 'PLAY');
                    this.setAttribute('color', '#00ff00');
                }
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                stopKaraoke();
                if (playBtn) {
                    playBtn.querySelector('a-text').setAttribute('value', 'PLAY');
                    playBtn.setAttribute('color', '#00ff00');
                }
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                console.log('Volviendo a la lista de canciones VR');
                window.location.href = '../views/canciones-vr.html';
            });
        }
        
        // Función para iniciar el karaoke
        function startKaraoke() {
            isPlaying = true;
            startTime = Date.now();
            console.log('Karaoke iniciado');
            
            // Simular progreso y cambio de letras
            updateLyrics();
        }
        
        // Función para pausar
        function pauseKaraoke() {
            isPlaying = false;
            console.log('Karaoke pausado');
        }
        
        // Función para parar
        function stopKaraoke() {
            isPlaying = false;
            currentLyricIndex = 0;
            startTime = 0;
            
            // Resetear interfaz
            if (currentLine) currentLine.setAttribute('value', lyrics[0].english);
            if (translationLine) translationLine.setAttribute('value', lyrics[0].spanish);
            if (nextLine && lyrics[1]) nextLine.setAttribute('value', lyrics[1].english);
            if (progressFill) progressFill.setAttribute('width', '0');
            
            console.log('Karaoke detenido');
        }
        
        // Función para actualizar letras
        function updateLyrics() {
            if (!isPlaying) return;
            
            const elapsed = Date.now() - startTime;
            const totalDuration = 24000; // Duración total estimada
            
            // Actualizar barra de progreso
            const progress = Math.min(elapsed / totalDuration, 1);
            if (progressFill) {
                progressFill.setAttribute('width', progress * 4);
                progressFill.setAttribute('position', (-2 + (progress * 2)) + ' 0 0');
            }
            
            // Buscar la letra actual basada en el tiempo
            for (let i = 0; i < lyrics.length; i++) {
                if (elapsed >= lyrics[i].time && i !== currentLyricIndex) {
                    currentLyricIndex = i;
                    
                    // Actualizar textos
                    if (currentLine) {
                        currentLine.setAttribute('value', lyrics[i].english);
                        // Efecto de brillo
                        currentLine.setAttribute('animation', 
                            'property: scale; to: 1.4 1.4 1.4; dur: 300; direction: alternate; loop: 2');
                    }
                    
                    if (translationLine) {
                        translationLine.setAttribute('value', lyrics[i].spanish);
                    }
                    
                    // Mostrar siguiente línea
                    if (nextLine && lyrics[i + 1]) {
                        nextLine.setAttribute('value', lyrics[i + 1].english);
                    } else if (nextLine) {
                        nextLine.setAttribute('value', '');
                    }
                    
                    console.log('Línea actual:', lyrics[i].english);
                    break;
                }
            }
            
            // Continuar actualizando si está reproduciendo
            if (isPlaying && elapsed < totalDuration) {
                setTimeout(updateLyrics, 100);
            } else if (elapsed >= totalDuration) {
                // Canción terminada
                stopKaraoke();
                if (playBtn) {
                    playBtn.querySelector('a-text').setAttribute('value', 'PLAY');
                    playBtn.setAttribute('color', '#00ff00');
                }
                console.log('Canción terminada');
            }
        }
        
        // Navegación con teclado
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case ' ': // Espacio para play/pause
                    e.preventDefault();
                    if (playBtn) playBtn.click();
                    break;
                case 'Escape': // ESC para volver
                    if (backBtn) backBtn.click();
                    break;
                case 's': // S para stop
                    if (stopBtn) stopBtn.click();
                    break;
            }
        });
        
        // Inicializar con la primera línea
        if (currentLine) currentLine.setAttribute('value', lyrics[0].english);
        if (translationLine) translationLine.setAttribute('value', lyrics[0].spanish);
        if (nextLine && lyrics[1]) nextLine.setAttribute('value', lyrics[1].english);
        
        console.log('Controles del karaoke VR:');
        console.log('- Espacio: Play/Pause');
        console.log('- S: Stop');
        console.log('- ESC: Volver');
    });
    // Componente karaoke-vr.js
    // Requiere aframe-htmlembed-component para mostrar iframes de YouTube
    AFRAME.registerComponent('karaoke-vr', {
        schema: {
            videoPath: { type: 'string', default: '' },
            videoWidth: { type: 'number', default: 4 },
            videoHeight: { type: 'number', default: 2 },
            videoList: { type: 'string', default: '' }
        },
        init: function () {
            console.log('Inicializando componente karaoke-vr');

            // Crear contenedor para la lista de videos
            const videoListContainer = document.createElement('a-entity');
            videoListContainer.setAttribute('position', '0 2 -3');

            // Obtener lista de videos desde la propiedad videoList
            const videos = this.data.videoList.split(',');

            // Crear elementos para cada video
            videos.forEach((video, index) => {
                const videoItem = document.createElement('a-text');
                videoItem.setAttribute('value', video);
                videoItem.setAttribute('position', `0 ${-index * 0.5} 0`);
                videoItem.setAttribute('color', '#FFFFFF');
                videoItem.setAttribute('class', 'clickable');

                // Agregar evento de clic para seleccionar el video
                videoItem.addEventListener('click', () => {
                    console.log(`Seleccionado: ${video}`);
                    this.loadVideo(`./videos/karaoke/${video}`);
                });

                videoListContainer.appendChild(videoItem);
            });

            this.el.appendChild(videoListContainer);
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
            videoElement.setAttribute('position', '0 2 -3');

            this.el.appendChild(videoElement);
        }
    });
    
    // NOTA: Debes incluir la librería aframe-htmlembed-component en tu index.html para que funcione el iframe de YouTube.
    // <script src="https://unpkg.com/aframe-htmlembed-component/dist/aframe-htmlembed-component.min.js"></script>
});
