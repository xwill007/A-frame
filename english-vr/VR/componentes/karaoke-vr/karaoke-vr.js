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
        
        // Controles de música
        if (playBtn) {
            playBtn.addEventListener('click', function() {
                if (!isPlaying) {
                    startKaraoke();
                    this.querySelector('a-text').setAttribute('value', 'PAUSE');
                    this.setAttribute('color', '#ffaa00');
                } else {
                    pauseKaraoke();
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
});
