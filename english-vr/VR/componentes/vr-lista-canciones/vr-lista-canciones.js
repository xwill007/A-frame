// Componente A-Frame para lista de canciones VR
AFRAME.registerComponent('lista-canciones-vr', {
    schema: {
        listPosition: {type: 'vec3', default: {x: 0, y: 2.5, z: -3}},
        buttonPosition: {type: 'vec3', default: {x: 4, y: 1.5, z: 3}},
        visible: {type: 'boolean', default: false}
    },

    init: function () {
        // Estados del componente
        this.isListVisible = false;
        this.isButtonVisible = true;
        this.selectedSongIndex = 0;
        this.currentPage = 0;
        this.songsPerPage = 6;

        // Lista de canciones de ejemplo
        this.songs = [
            { title: "Hello", artist: "Adele", level: "Principiante", duration: "4:55" },
            { title: "Yesterday", artist: "The Beatles", level: "Principiante", duration: "2:05" },
            { title: "Imagine", artist: "John Lennon", level: "Intermedio", duration: "3:01" },
            { title: "Bohemian Rhapsody", artist: "Queen", level: "Avanzado", duration: "5:55" },
            { title: "Hotel California", artist: "Eagles", level: "Avanzado", duration: "6:30" },
            { title: "Shape of You", artist: "Ed Sheeran", level: "Intermedio", duration: "3:53" },
            { title: "Let It Be", artist: "The Beatles", level: "Principiante", duration: "3:50" },
            { title: "Stairway to Heaven", artist: "Led Zeppelin", level: "Avanzado", duration: "8:02" },
            { title: "Perfect", artist: "Ed Sheeran", level: "Intermedio", duration: "4:23" },
            { title: "Wonderwall", artist: "Oasis", level: "Intermedio", duration: "4:18" }
        ];

        // Crear el botón de activación de la lista
        this.createTriggerButton();

        // Crear el contenedor principal de la lista
        this.createListContainer();

        // Configurar eventos
        this.setupEvents();

        // Efectos ambientales
        this.createAmbientEffects();

        console.log('Componente lista-canciones-vr inicializado');
    },

    createTriggerButton: function() {
        const data = this.data;
        
        // Contenedor del botón
        const buttonContainer = document.createElement('a-entity');
        buttonContainer.setAttribute('id', 'list-trigger-button');
        buttonContainer.setAttribute('position', `${data.buttonPosition.x} ${data.buttonPosition.y} ${data.buttonPosition.z}`);

        // Fondo del botón
        const buttonPlane = document.createElement('a-plane');
        buttonPlane.setAttribute('width', '2.2');
        buttonPlane.setAttribute('height', '2.2');
        buttonPlane.setAttribute('color', '#6a2c70');
        buttonPlane.setAttribute('opacity', '0.9');
        buttonPlane.classList.add('clickable');

        // Borde brillante
        const border = document.createElement('a-ring');
        border.setAttribute('radius-inner', '1.05');
        border.setAttribute('radius-outer', '1.15');
        border.setAttribute('color', '#b83dba');
        border.setAttribute('opacity', '0.8');
        border.setAttribute('position', '0 0 0.01');
        border.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 8000; loop: true');

        // Ícono de lista musical
        const musicNote1 = document.createElement('a-sphere');
        musicNote1.setAttribute('radius', '0.08');
        musicNote1.setAttribute('color', '#ffffff');
        musicNote1.setAttribute('position', '-0.2 0.3 0.02');

        const musicNote2 = document.createElement('a-sphere');
        musicNote2.setAttribute('radius', '0.08');
        musicNote2.setAttribute('color', '#ffffff');
        musicNote2.setAttribute('position', '0.2 0.1 0.02');

        // Líneas de la lista
        const line1 = document.createElement('a-box');
        line1.setAttribute('width', '0.8');
        line1.setAttribute('height', '0.05');
        line1.setAttribute('depth', '0.01');
        line1.setAttribute('color', '#ffffff');
        line1.setAttribute('position', '0 0 0.02');

        const line2 = document.createElement('a-box');
        line2.setAttribute('width', '0.6');
        line2.setAttribute('height', '0.05');
        line2.setAttribute('depth', '0.01');
        line2.setAttribute('color', '#ffffff');
        line2.setAttribute('position', '0 -0.2 0.02');

        const line3 = document.createElement('a-box');
        line3.setAttribute('width', '0.7');
        line3.setAttribute('height', '0.05');
        line3.setAttribute('depth', '0.01');
        line3.setAttribute('color', '#ffffff');
        line3.setAttribute('position', '0 -0.4 0.02');

        // Texto del botón
        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', 'CANCIONES');
        buttonText.setAttribute('position', '0 -0.7 0.02');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#b83dba');
        buttonText.setAttribute('scale', '0.6 0.6 1');
        buttonText.setAttribute('animation', 'property: scale; to: 0.7 0.7 1; dur: 2000; dir: alternate; loop: true');

        // Subtítulo
        const subtitle = document.createElement('a-text');
        subtitle.setAttribute('value', 'Explora música');
        subtitle.setAttribute('position', '0 -1 0.02');
        subtitle.setAttribute('align', 'center');
        subtitle.setAttribute('color', '#ffffff');
        subtitle.setAttribute('scale', '0.4 0.4 1');

        // Efectos de partículas musicales
        const particle1 = document.createElement('a-sphere');
        particle1.setAttribute('radius', '0.015');
        particle1.setAttribute('color', '#b83dba');
        particle1.setAttribute('position', '0.9 0.7 0.1');
        particle1.setAttribute('animation', 'property: position; to: -0.9 -0.7 0.1; dur: 3000; loop: true; dir: alternate');

        const particle2 = document.createElement('a-sphere');
        particle2.setAttribute('radius', '0.02');
        particle2.setAttribute('color', '#ffffff');
        particle2.setAttribute('position', '-0.7 0.8 0.1');
        particle2.setAttribute('animation', 'property: position; to: 0.7 -0.8 0.1; dur: 2500; loop: true; dir: alternate');

        // Ensamblar el botón
        buttonContainer.appendChild(buttonPlane);
        buttonContainer.appendChild(border);
        buttonContainer.appendChild(musicNote1);
        buttonContainer.appendChild(musicNote2);
        buttonContainer.appendChild(line1);
        buttonContainer.appendChild(line2);
        buttonContainer.appendChild(line3);
        buttonContainer.appendChild(buttonText);
        buttonContainer.appendChild(subtitle);
        buttonContainer.appendChild(particle1);
        buttonContainer.appendChild(particle2);

        // Agregar al elemento principal
        this.el.appendChild(buttonContainer);

        // Guardar referencias
        this.buttonContainer = buttonContainer;
        this.buttonPlane = buttonPlane;
    },

    createListContainer: function() {
        const data = this.data;

        // Crear el contenedor principal de la lista
        const listContainer = document.createElement('a-entity');
        listContainer.setAttribute('id', 'list-container-vr');
        listContainer.setAttribute('position', `${data.listPosition.x} ${data.listPosition.y} ${data.listPosition.z}`);
        listContainer.setAttribute('visible', false);

        // Panel principal de la lista
        const mainPanel = document.createElement('a-plane');
        mainPanel.setAttribute('width', '8');
        mainPanel.setAttribute('height', '10');
        mainPanel.setAttribute('color', '#6a2c70');
        mainPanel.setAttribute('opacity', '0.9');
        mainPanel.setAttribute('material', 'shader: flat');
        mainPanel.classList.add('clickable');

        // Borde brillante
        const border = document.createElement('a-ring');
        border.setAttribute('radius-inner', '3.9');
        border.setAttribute('radius-outer', '4.1');
        border.setAttribute('color', '#b83dba');
        border.setAttribute('opacity', '0.6');
        border.setAttribute('position', '0 0 0.01');
        border.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 12000; loop: true');

        // Título
        const title = document.createElement('a-text');
        title.setAttribute('value', '🎵 LISTA DE CANCIONES 🎵');
        title.setAttribute('position', '0 4.5 0.1');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#ffffff');
        title.setAttribute('font', 'roboto');
        title.setAttribute('scale', '1.2 1.2 1');
        title.setAttribute('animation', 'property: scale; to: 1.3 1.3 1; dir: alternate; dur: 2000; loop: true');

        // Contenedor de canciones
        const songsContainer = this.createSongsContainer();

        // Controles de navegación
        const navigationControls = this.createNavigationControls();

        // Botón Cerrar
        const closeButton = this.createButton('CERRAR', '#666666', '0 -4.5 0.1', 'close-list-btn');

        // Agregar todos los elementos al contenedor
        listContainer.appendChild(mainPanel);
        listContainer.appendChild(border);
        listContainer.appendChild(title);
        listContainer.appendChild(songsContainer);
        listContainer.appendChild(navigationControls);
        listContainer.appendChild(closeButton);

        // Agregar el contenedor a la escena
        this.el.appendChild(listContainer);

        // Guardar referencia
        this.listContainer = listContainer;
        this.songsContainer = songsContainer;
    },

    createSongsContainer: function() {
        const container = document.createElement('a-entity');
        container.setAttribute('id', 'songs-container');
        container.setAttribute('position', '0 0 0.1');

        // Guardar referencia para uso posterior
        this.songsContainerRef = container;

        // Crear canciones inicial
        this.populateInitialSongs(container);

        return container;
    },

    populateInitialSongs: function(container) {
        const startIndex = this.currentPage * this.songsPerPage;
        const endIndex = Math.min(startIndex + this.songsPerPage, this.songs.length);
        const songsToShow = this.songs.slice(startIndex, endIndex);

        songsToShow.forEach((song, index) => {
            const songItem = this.createSongItem(song, startIndex + index);
            container.appendChild(songItem);
        });
    },

    updateSongsList: function() {
        // Usar la referencia guardada
        const container = this.songsContainerRef || this.el.querySelector('#songs-container');
        
        if (!container) {
            console.error('No se encontró el contenedor de canciones');
            return;
        }

        // Limpiar contenido anterior
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const startIndex = this.currentPage * this.songsPerPage;
        const endIndex = Math.min(startIndex + this.songsPerPage, this.songs.length);
        const songsToShow = this.songs.slice(startIndex, endIndex);

        songsToShow.forEach((song, index) => {
            const songItem = this.createSongItem(song, startIndex + index);
            container.appendChild(songItem);
        });
    },

    createSongItem: function(song, globalIndex) {
        const itemContainer = document.createElement('a-entity');
        const yPosition = 3.5 - (globalIndex % this.songsPerPage) * 1.2;
        itemContainer.setAttribute('position', `0 ${yPosition} 0`);

        // Fondo del item
        const itemBg = document.createElement('a-plane');
        itemBg.setAttribute('width', '7');
        itemBg.setAttribute('height', '1');
        itemBg.setAttribute('color', globalIndex === this.selectedSongIndex ? '#8e44ad' : '#4a1a5a');
        itemBg.setAttribute('opacity', '0.8');
        itemBg.classList.add('clickable', 'song-item');
        itemBg.setAttribute('data-song-index', globalIndex);

        // Título de la canción
        const songTitle = document.createElement('a-text');
        songTitle.setAttribute('value', song.title);
        songTitle.setAttribute('position', '-3 0.2 0.02');
        songTitle.setAttribute('color', '#ffffff');
        songTitle.setAttribute('scale', '0.8 0.8 1');
        songTitle.setAttribute('font', 'roboto');

        // Artista
        const artist = document.createElement('a-text');
        artist.setAttribute('value', `por ${song.artist}`);
        artist.setAttribute('position', '-3 -0.1 0.02');
        artist.setAttribute('color', '#cccccc');
        artist.setAttribute('scale', '0.6 0.6 1');

        // Nivel de dificultad
        const levelColor = song.level === 'Principiante' ? '#00ff00' : 
                          song.level === 'Intermedio' ? '#ffff00' : '#ff4444';
        const level = document.createElement('a-text');
        level.setAttribute('value', song.level);
        level.setAttribute('position', '1.5 0.1 0.02');
        level.setAttribute('color', levelColor);
        level.setAttribute('scale', '0.6 0.6 1');

        // Duración
        const duration = document.createElement('a-text');
        duration.setAttribute('value', song.duration);
        duration.setAttribute('position', '2.8 0.1 0.02');
        duration.setAttribute('color', '#b83dba');
        duration.setAttribute('scale', '0.6 0.6 1');

        // Botón de reproducir
        const playButton = this.createSmallButton('▶', '#00aa00', '3.2 0 0.02', `play-${globalIndex}`);

        itemContainer.appendChild(itemBg);
        itemContainer.appendChild(songTitle);
        itemContainer.appendChild(artist);
        itemContainer.appendChild(level);
        itemContainer.appendChild(duration);
        itemContainer.appendChild(playButton);

        return itemContainer;
    },

    createNavigationControls: function() {
        const navContainer = document.createElement('a-entity');
        navContainer.setAttribute('position', '0 -3.5 0.1');

        // Botón anterior
        const prevButton = this.createButton('◀ ANTERIOR', '#555555', '-2 0 0', 'prev-page-btn');
        
        // Indicador de página
        const pageIndicator = document.createElement('a-text');
        pageIndicator.setAttribute('id', 'page-indicator');
        pageIndicator.setAttribute('value', this.getPageText());
        pageIndicator.setAttribute('position', '0 0 0');
        pageIndicator.setAttribute('align', 'center');
        pageIndicator.setAttribute('color', '#ffffff');
        pageIndicator.setAttribute('scale', '0.8 0.8 1');

        // Botón siguiente
        const nextButton = this.createButton('SIGUIENTE ▶', '#555555', '2 0 0', 'next-page-btn');

        navContainer.appendChild(prevButton);
        navContainer.appendChild(pageIndicator);
        navContainer.appendChild(nextButton);

        return navContainer;
    },

    createButton: function(text, color, position, id) {
        const buttonContainer = document.createElement('a-entity');
        buttonContainer.setAttribute('position', position);

        const button = document.createElement('a-box');
        button.setAttribute('id', id);
        button.setAttribute('width', '2');
        button.setAttribute('height', '0.4');
        button.setAttribute('depth', '0.1');
        button.setAttribute('color', color);
        button.classList.add('clickable');

        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', text);
        buttonText.setAttribute('position', '0 0 0.06');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#ffffff');
        buttonText.setAttribute('scale', '0.5 0.5 1');

        buttonContainer.appendChild(button);
        buttonContainer.appendChild(buttonText);

        return buttonContainer;
    },

    createSmallButton: function(text, color, position, id) {
        const buttonContainer = document.createElement('a-entity');
        buttonContainer.setAttribute('position', position);

        const button = document.createElement('a-sphere');
        button.setAttribute('id', id);
        button.setAttribute('radius', '0.15');
        button.setAttribute('color', color);
        button.classList.add('clickable');

        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', text);
        buttonText.setAttribute('position', '0 0 0.16');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#ffffff');
        buttonText.setAttribute('scale', '0.8 0.8 1');

        buttonContainer.appendChild(button);
        buttonContainer.appendChild(buttonText);

        return buttonContainer;
    },

    setupEvents: function() {
        const self = this;

        console.log('Configurando eventos para lista de canciones...');

        // Evento de clic en el botón principal
        this.buttonPlane.addEventListener('click', function(e) {
            console.log('Click detectado en botón de lista de canciones');
            e.preventDefault();
            e.stopPropagation();
            self.showList();
        });

        // Efectos de hover en el botón
        this.buttonPlane.addEventListener('mouseenter', function() {
            this.setAttribute('animation__hover', 'property: scale; to: 1.05 1.05 1.05; dur: 200');
        });

        this.buttonPlane.addEventListener('mouseleave', function() {
            this.setAttribute('animation__hover', 'property: scale; to: 1 1 1; dur: 200');
        });

        // Agregar evento de click directamente al elemento principal también
        this.el.addEventListener('click', function(e) {
            console.log('Click en componente de lista:', e.target);
            const target = e.target;
            
            // Verificar si es el botón principal
            if (target === self.buttonPlane || target.closest('#list-trigger-button')) {
                console.log('Click en botón principal detectado');
                e.preventDefault();
                e.stopPropagation();
                self.showList();
                return;
            }
            
            if (target.classList.contains('song-item')) {
                const songIndex = parseInt(target.getAttribute('data-song-index'));
                self.selectSong(songIndex);
            } else if (target.id === 'prev-page-btn') {
                self.previousPage();
            } else if (target.id === 'next-page-btn') {
                self.nextPage();
            } else if (target.id && target.id.startsWith('play-')) {
                const songIndex = parseInt(target.id.replace('play-', ''));
                self.playSong(songIndex);
            } else if (target.id === 'close-list-btn') {
                self.hideList();
            }
        });

        console.log('Eventos configurados correctamente');
    },

    selectSong: function(songIndex) {
        this.selectedSongIndex = songIndex;
        this.updateSongsList();
        
        const song = this.songs[songIndex];
        this.showMessage(`Seleccionada: "${song.title}" por ${song.artist}`, '#b83dba');
    },

    playSong: function(songIndex) {
        const song = this.songs[songIndex];
        console.log('Reproduciendo canción:', song);
        
        this.showMessage(`🎵 Reproduciendo: "${song.title}" 🎵`, '#00aa00');
        
        // Aquí podrías integrar con el sistema de karaoke
        setTimeout(() => {
            console.log('Redirigiendo al karaoke con:', song.title);
            // window.location.href = '../views/karaoke-vr.html?song=' + encodeURIComponent(song.title);
        }, 2000);
    },

    previousPage: function() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateSongsList();
            this.updatePageIndicator();
        }
    },

    nextPage: function() {
        const maxPage = Math.ceil(this.songs.length / this.songsPerPage) - 1;
        if (this.currentPage < maxPage) {
            this.currentPage++;
            this.updateSongsList();
            this.updatePageIndicator();
        }
    },

    updatePageIndicator: function() {
        const indicator = this.el.querySelector('#page-indicator');
        if (indicator) {
            indicator.setAttribute('value', this.getPageText());
        }
    },

    getPageText: function() {
        const totalPages = Math.ceil(this.songs.length / this.songsPerPage);
        return `Página ${this.currentPage + 1} de ${totalPages}`;
    },

    showMessage: function(message, color) {
        const messageEl = document.createElement('a-text');
        messageEl.setAttribute('value', message);
        messageEl.setAttribute('position', '0 5 -1');
        messageEl.setAttribute('align', 'center');
        messageEl.setAttribute('color', color);
        messageEl.setAttribute('scale', '1.2 1.2 1');
        messageEl.setAttribute('animation__appear', 'property: scale; from: 0 0 0; to: 1.2 1.2 1; dur: 500');

        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.appendChild(messageEl);
        }

        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    },

    createAmbientEffects: function() {
        const colors = ['#b83dba', '#ffffff', '#aa44bb', '#cc66dd'];
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('a-sphere');
            particle.setAttribute('radius', Math.random() * 0.015 + 0.01);
            particle.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
            
            const x = (Math.random() - 0.5) * 8;
            const y = Math.random() * 5 + 1;
            const z = (Math.random() - 0.5) * 6 - 3;
            
            particle.setAttribute('position', `${x} ${y} ${z}`);
            particle.setAttribute('animation__float', 
                `property: position; to: ${-x} ${y + 1} ${z - 1}; dur: ${Math.random() * 8000 + 4000}; loop: true; dir: alternate`);
            
            this.el.appendChild(particle);
        }
    },

    showList: function() {
        console.log('Mostrando lista de canciones...');
        this.isListVisible = true;
        this.isButtonVisible = false;

        // Ocultar botón con animación
        this.buttonContainer.setAttribute('animation__hide', 'property: scale; to: 0 0 0; dur: 500');
        setTimeout(() => {
            this.buttonContainer.setAttribute('visible', false);
        }, 500);

        // Mostrar lista con animación
        setTimeout(() => {
            this.listContainer.setAttribute('visible', true);
            this.listContainer.setAttribute('animation__show', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 500');
            // Asegurar que las canciones estén actualizadas
            this.updateSongsList();
        }, 600);
    },

    hideList: function() {
        this.isListVisible = false;
        this.isButtonVisible = true;

        // Ocultar lista con animación
        this.listContainer.setAttribute('animation__hide', 'property: scale; to: 0 0 0; dur: 500');
        setTimeout(() => {
            this.listContainer.setAttribute('visible', false);
        }, 500);

        // Mostrar botón con animación
        setTimeout(() => {
            this.buttonContainer.setAttribute('visible', true);
            this.buttonContainer.setAttribute('animation__show', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 500');
        }, 600);
    },

    // Función para cambiar posiciones dinámicamente
    updatePositions: function(listPos, buttonPos) {
        if (listPos) {
            this.data.listPosition = listPos;
            this.listContainer.setAttribute('position', `${listPos.x} ${listPos.y} ${listPos.z}`);
        }
        if (buttonPos) {
            this.data.buttonPosition = buttonPos;
            this.buttonContainer.setAttribute('position', `${buttonPos.x} ${buttonPos.y} ${buttonPos.z}`);
        }
    }
});

// Funcionalidad adicional para controles de teclado globales
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de lista de canciones VR cargado');
    
    // Controles de teclado para la lista de canciones VR
    document.addEventListener('keydown', function(e) {
        const listComponent = document.getElementById('canciones-vr-component');
        
        if (listComponent) {
            const component = listComponent.components['lista-canciones-vr'];
            
            if (component && component.isListVisible) {
                switch(e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        if (component.selectedSongIndex > 0) {
                            component.selectSong(component.selectedSongIndex - 1);
                        }
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        if (component.selectedSongIndex < component.songs.length - 1) {
                            component.selectSong(component.selectedSongIndex + 1);
                        }
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        component.previousPage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        component.nextPage();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        component.playSong(component.selectedSongIndex);
                        break;
                    case 'Escape':
                        e.preventDefault();
                        component.hideList();
                        break;
                }
            }
        }
    });
    
    console.log('Controles de la lista de canciones VR disponibles:');
    console.log('- Click: Interactuar con canciones y botones');
    console.log('- ↑/↓: Navegar entre canciones');
    console.log('- ←/→: Cambiar de página');
    console.log('- Enter: Reproducir canción seleccionada');
    console.log('- ESC: Cerrar lista');
});
