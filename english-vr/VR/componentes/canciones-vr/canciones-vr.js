// Funcionalidad de la lista de canciones VR
document.addEventListener('DOMContentLoaded', function() {
    console.log('Lista de canciones VR cargada');
    
    // Esperar a que A-Frame esté listo
    document.querySelector('a-scene').addEventListener('loaded', function() {
        console.log('Escena de lista de canciones VR cargada');
        
        // Elementos de la interfaz
        const song1 = document.getElementById('song-1');
        const song2 = document.getElementById('song-2');
        const song3 = document.getElementById('song-3');
        const backButton = document.getElementById('back-button');
        
        // Datos de las canciones
        const songsData = {
            'song-1': {
                title: 'Imagine',
                artist: 'John Lennon',
                difficulty: 'Fácil',
                description: 'Canción tranquila con vocabulario sencillo'
            },
            'song-2': {
                title: 'Let It Be',
                artist: 'The Beatles',
                difficulty: 'Principiante',
                description: 'Frases repetitivas y claras'
            },
            'song-3': {
                title: 'Perfect',
                artist: 'Ed Sheeran',
                difficulty: 'Intermedio',
                description: 'Vocabulario amoroso y tiempos verbales'
            }
        };
        
        // Función para manejar clicks en canciones
        function handleSongClick(songElement, songId) {
            if (!songElement) return;
            
            songElement.addEventListener('click', function(e) {
                console.log('Canción seleccionada:', songsData[songId].title);
                
                // Efecto visual de selección
                songElement.setAttribute('animation__select', 
                    'property: rotation; to: 0 360 0; dur: 1000; loop: 1');
                
                // Ir al karaoke después de la animación
                setTimeout(() => {
                    window.location.href = '../views/karaoke-vr.html';
                }, 1000);
            });
            
            // Efectos de hover adicionales
            songElement.addEventListener('mouseenter', function() {
                // Efecto de levitación
                this.setAttribute('animation__hover', 
                    'property: position; to: ' + this.getAttribute('position').x + ' 0.3 ' + this.getAttribute('position').z + '; dur: 300');
                
                // Información adicional
                console.log('Hover sobre:', songsData[songId].title, '-', songsData[songId].difficulty);
            });
            
            songElement.addEventListener('mouseleave', function() {
                // Volver a posición original
                const originalPos = this.getAttribute('position');
                this.setAttribute('animation__hover', 
                    'property: position; to: ' + originalPos.x + ' 0 ' + originalPos.z + '; dur: 300');
            });
        }
        
        // Configurar eventos para cada canción
        handleSongClick(song1, 'song-1');
        handleSongClick(song2, 'song-2'); 
        handleSongClick(song3, 'song-3');
        
        // Botones de práctica individuales
        const practiceButtons = document.querySelectorAll('.practice-btn');
        practiceButtons.forEach((btn, index) => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // Evitar que se active el click de la canción
                console.log('Practicar canción:', Object.values(songsData)[index].title);
                
                // Efecto de brillo
                this.setAttribute('animation__click', 
                    'property: scale; to: 1.3 1.3 1.3; dur: 200; direction: alternate; loop: 2');
                
                setTimeout(() => {
                    window.location.href = '../views/karaoke-vr.html';
                }, 400);
            });
        });
        
        // Botón de volver
        if (backButton) {
            backButton.addEventListener('click', function() {
                console.log('Volviendo al inicio VR');
                
                // Efecto de rotación
                this.setAttribute('animation__back', 
                    'property: rotation; to: 0 0 -360; dur: 800; loop: 1');
                
                setTimeout(() => {
                    window.location.href = '../views/entorno-principal.html';
                }, 800);
            });
        }
        
        // Animación de entrada para las canciones
        function animateEntry() {
            const songs = [song1, song2, song3];
            songs.forEach((song, index) => {
                if (song) {
                    // Empezar fuera de la vista
                    song.setAttribute('position', '0 -5 -10');
                    song.setAttribute('scale', '0 0 0');
                    
                    // Animar entrada con delay
                    setTimeout(() => {
                        const finalPos = song.getAttribute('position');
                        song.setAttribute('animation__entry', 
                            'property: position; to: ' + finalPos.x + ' 0 ' + finalPos.z + '; dur: 1000; easing: easeOutBounce');
                        song.setAttribute('animation__scale', 
                            'property: scale; to: 1 1 1; dur: 800; easing: easeOutBack');
                    }, index * 300);
                }
            });
        }
        
        // Ejecutar animación de entrada
        setTimeout(animateEntry, 500);
        
        // Rotación continua del contenedor de canciones
        const songsContainer = document.getElementById('songs-container');
        if (songsContainer) {
            songsContainer.setAttribute('animation__rotate', 
                'property: rotation; to: 0 360 0; dur: 120000; loop: true');
        }
        
        // Control con teclado
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case '1':
                    if (song1) song1.click();
                    break;
                case '2':
                    if (song2) song2.click();
                    break;
                case '3':
                    if (song3) song3.click();
                    break;
                case 'Escape':
                    if (backButton) backButton.click();
                    break;
            }
        });
        
        // Efectos de sonido simulados
        function playHoverSound() {
            console.log('*Hover sound*');
        }
        
        function playSelectSound() {
            console.log('*Select sound*');
        }
        
        // Agregar sonidos a elementos interactivos
        document.querySelectorAll('.clickable').forEach(element => {
            element.addEventListener('mouseenter', playHoverSound);
            element.addEventListener('click', playSelectSound);
        });
        
        console.log('Controles de lista de canciones VR:');
        console.log('- 1, 2, 3: Seleccionar canción');
        console.log('- ESC: Volver al inicio');
        console.log('- Click/VR: Interactuar con elementos');
    });
});
