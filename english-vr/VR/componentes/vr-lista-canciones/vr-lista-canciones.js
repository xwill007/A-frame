// Componente A-Frame para lista de canciones VR - VERSION FUNCIONAL
AFRAME.registerComponent('lista-canciones-vr-simple', {
    schema: {
        buttonPosition: {type: 'vec3', default: {x: 4, y: 1.5, z: 3}},
        listPosition: {type: 'vec3', default: {x: 4, y: 2.5, z: 3}}
    },

    init: function () {
        console.log('Inicializando componente de lista de canciones');
        
        // Estados del componente
        this.isListVisible = false;
        this.selectedSongIndex = 0;
        
        // Lista de canciones con link de YouTube y frases de letra
        this.songs = [];
        
        // Agregar canciones de la carpeta videos/karaoke
        const karaokeVideos = [
            { title: "Gangsta's Paradise", artist: "Coolio", level: "Intermedio", duration: "4:00", url: "videos/karaoke/GangstasParadise.mp4", lyrics: [] },
            { title: "It's My Life", artist: "Bon Jovi", level: "Avanzado", duration: "3:45", url: "videos/karaoke/ItsMyLife.mp4", lyrics: [] },
            { title: "Stand By Me", artist: "Ben E. King", level: "Principiante", duration: "2:55", url: "videos/karaoke/StandByMe.mp4", lyrics: [] }
        ];

        this.songs = this.songs.concat(karaokeVideos);
        
        // Crear elementos
        this.createButton();
        this.createList();
        
        console.log('Componente inicializado correctamente');
    },

    createButton: function() {
        const data = this.data;
        
        // Contenedor del botón
        this.buttonContainer = document.createElement('a-entity');
        this.buttonContainer.setAttribute('position', `${data.buttonPosition.x} ${data.buttonPosition.y} ${data.buttonPosition.z}`);
        
        // Botón principal
        const button = document.createElement('a-box');
        button.setAttribute('width', '2.2');
        button.setAttribute('height', '2.2');
        button.setAttribute('depth', '0.2');
        button.setAttribute('color', '#6a2c70');
        button.classList.add('clickable');
        
        // Texto del botón
        const text = document.createElement('a-text');
        text.setAttribute('value', 'CANCIONES');
        text.setAttribute('position', '0 0 0.15');
        text.setAttribute('align', 'center');
        text.setAttribute('color', '#ffffff');
        text.setAttribute('scale', '0.8 0.8 1');
        
        // Ensamblar botón
        button.appendChild(text);
        this.buttonContainer.appendChild(button);
        this.el.appendChild(this.buttonContainer);
        
        // Evento de click
        const self = this;
        button.addEventListener('click', function(e) {
            console.log('Click en botón de canciones');
            e.preventDefault();
            e.stopPropagation();
            self.showList();
        });
        
        this.buttonElement = button;
    },

    createList: function() {
        // Contenedor principal de la lista
        const data = this.data;
        this.listContainer = document.createElement('a-entity');
        this.listContainer.setAttribute('position', `${data.listPosition.x} ${data.listPosition.y} ${data.listPosition.z}`);
        this.listContainer.setAttribute('visible', false);
        
        // Panel de fondo
        const panel = document.createElement('a-plane');
        panel.setAttribute('width', '8');
        panel.setAttribute('height', '10');
        panel.setAttribute('color', '#6a2c70');
        panel.setAttribute('opacity', '0.9');
        
        // Título
        const title = document.createElement('a-text');
        title.setAttribute('value', '🎵 LISTA DE CANCIONES 🎵');
        title.setAttribute('position', '0 4.5 0.1');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#ffffff');
        title.setAttribute('scale', '1.2 1.2 1');
        
        // Crear canciones
        const songsContainer = document.createElement('a-entity');
        songsContainer.setAttribute('position', '0 0 0.1');
        
        this.songs.forEach((song, index) => {
            const songElement = this.createSongElement(song, index);
            songsContainer.appendChild(songElement);
        });
        
        // Botón cerrar
        const closeButton = document.createElement('a-box');
        closeButton.setAttribute('position', '0 -4.5 0.1');
        closeButton.setAttribute('width', '2');
        closeButton.setAttribute('height', '0.5');
        closeButton.setAttribute('depth', '0.1');
        closeButton.setAttribute('color', '#666666');
        closeButton.classList.add('clickable');
        
        const closeText = document.createElement('a-text');
        closeText.setAttribute('value', 'CERRAR');
        closeText.setAttribute('position', '0 0 0.06');
        closeText.setAttribute('align', 'center');
        closeText.setAttribute('color', '#ffffff');
        closeText.setAttribute('scale', '0.6 0.6 1');
        
        closeButton.appendChild(closeText);
        
        // Ensamblar lista
        this.listContainer.appendChild(panel);
        this.listContainer.appendChild(title);
        this.listContainer.appendChild(songsContainer);
        this.listContainer.appendChild(closeButton);
        this.el.appendChild(this.listContainer);
        
        // Evento cerrar
        const self = this;
        closeButton.addEventListener('click', function(e) {
            console.log('Cerrando lista');
            e.preventDefault();
            e.stopPropagation();
            self.hideList();
        });
    },
    
    createSongElement: function(song, index) {
        const songContainer = document.createElement('a-entity');
        const yPos = 3.5 - (index * 1.2);
        songContainer.setAttribute('position', `0 ${yPos} 0`);
        
        // Fondo de la canción
        const bg = document.createElement('a-plane');
        bg.setAttribute('width', '7');
        bg.setAttribute('height', '1');
        bg.setAttribute('color', index === this.selectedSongIndex ? '#8e44ad' : '#4a1a5a');
        bg.setAttribute('opacity', '0.8');
        bg.classList.add('clickable');
        
        // Título
        const titleText = document.createElement('a-text');
        titleText.setAttribute('value', song.title);
        titleText.setAttribute('position', '-3 0.2 0.02');
        titleText.setAttribute('color', '#ffffff');
        titleText.setAttribute('scale', '0.7 0.7 1');
        
        // Artista
        const artistText = document.createElement('a-text');
        artistText.setAttribute('value', `por ${song.artist}`);
        artistText.setAttribute('position', '-3 -0.1 0.02');
        artistText.setAttribute('color', '#cccccc');
        artistText.setAttribute('scale', '0.5 0.5 1');
        
        // Nivel
        const levelColor = song.level === 'Principiante' ? '#00ff00' : 
                          song.level === 'Intermedio' ? '#ffff00' : '#ff4444';
        const levelText = document.createElement('a-text');
        levelText.setAttribute('value', song.level);
        levelText.setAttribute('position', '1.5 0.1 0.02');
        levelText.setAttribute('color', levelColor);
        levelText.setAttribute('scale', '0.5 0.5 1');
        
        // Duración
        const durationText = document.createElement('a-text');
        durationText.setAttribute('value', song.duration);
        durationText.setAttribute('position', '2.8 0.1 0.02');
        durationText.setAttribute('color', '#b83dba');
        durationText.setAttribute('scale', '0.5 0.5 1');
        
        // Botón play
        const playButton = document.createElement('a-sphere');
        playButton.setAttribute('position', '3.2 0 0.02');
        playButton.setAttribute('radius', '0.15');
        playButton.setAttribute('color', '#00aa00');
        playButton.classList.add('clickable');
        
        const playText = document.createElement('a-text');
        playText.setAttribute('value', '▶');
        playText.setAttribute('position', '0 0 0.16');
        playText.setAttribute('align', 'center');
        playText.setAttribute('color', '#ffffff');
        playText.setAttribute('scale', '0.8 0.8 1');
        
        playButton.appendChild(playText);
        
        // Ensamblar canción
        songContainer.appendChild(bg);
        songContainer.appendChild(titleText);
        songContainer.appendChild(artistText);
        songContainer.appendChild(levelText);
        songContainer.appendChild(durationText);
        songContainer.appendChild(playButton);
        
        // Eventos
        const self = this;
        bg.addEventListener('click', function(e) {
            console.log('Seleccionando canción:', song.title);
            e.preventDefault();
            e.stopPropagation();
            self.selectSong(index);
        });
        
        playButton.addEventListener('click', function(e) {
            console.log('Reproduciendo:', song.title);
            e.preventDefault();
            e.stopPropagation();
            self.playSong(index);
        });
        
        return songContainer;
    },
    
    showList: function() {
        console.log('Mostrando lista de canciones');
        this.isListVisible = true;
        
        // Ocultar botón
        this.buttonContainer.setAttribute('visible', false);
        
        // Mostrar lista
        this.listContainer.setAttribute('visible', true);
        this.listContainer.setAttribute('animation__show', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 500');
    },
    
    hideList: function() {
        console.log('Ocultando lista de canciones');
        this.isListVisible = false;
        
        // Ocultar lista
        this.listContainer.setAttribute('animation__hide', 'property: scale; to: 0 0 0; dur: 500');
        
        // Mostrar botón después de la animación
        setTimeout(() => {
            this.listContainer.setAttribute('visible', false);
            this.buttonContainer.setAttribute('visible', true);
        }, 500);
    },
    
    selectSong: function(index) {
        this.selectedSongIndex = index;
        const song = this.songs[index];
        console.log('Canción seleccionada:', song.title);
        
        this.showMessage(`Seleccionada: "${song.title}" por ${song.artist}`, '#b83dba');
    },
    
    playSong: function(index) {
        const song = this.songs[index];
        console.log('mostrando canción:', song.title);
        this.showMessage(`🎵 Reproduciendo: "${song.title}" 🎵`, '#00aa00');

        // Mostrar karaoke-vr con el video de la canción
        const karaoke = document.querySelector('#karaoke-vr-component');
        if (karaoke && karaoke.components['karaoke-vr']) {
            karaoke.components['karaoke-vr'].show(song.youtube);
        }
    },
    
    showMessage: function(message, color) {
        // Crear mensaje temporal
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

        // Remover después de 3 segundos
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
});

console.log('Componente lista-canciones-vr-simple funcional registrado');
