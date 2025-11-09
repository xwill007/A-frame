// Módulo lista de canciones - renderiza 3 canciones por defecto como entidades A-Frame
export default class ListaCanciones {
	constructor(container, position = '0 0 0') {
		// container puede ser un selector string o un elemento DOM
		if (typeof container === 'string') {
			this.container = document.querySelector(container);
		} else {
			this.container = container;
		}
		this.position = position;

		// Lista por defecto de 3 canciones
		this.songs = [
			{file: 'GangstasParadise.mp4', title: 'Gangstas Paradise', artist: 'Coolio', duration: '3:45'},
			{file: 'ItsMyLife.mp4', title: "It's My Life", artist: 'Bon Jovi', duration: '4:25'},
			{file: 'StandByMe.mp4', title: 'Stand By Me', artist: 'Ben E. King', duration: '2:58'}
		];
	}

	render() {
		console.log('ListaCanciones.render() llamado, container=', this.container);
		if (!this.container) {
			console.warn('ListaCanciones: container no encontrado');
			return;
		}

		// Limpia el contenedor
		while (this.container.firstChild) this.container.removeChild(this.container.firstChild);

		// Posición base
		this.container.setAttribute('position', this.position);

		// Asegurar que el contenedor esté visible
		this.container.setAttribute('visible', 'true');

		const startY = 0.8; // altura inicial relativa (dejar espacio para el título)
		const gap = -0.8; // espacio entre filas

		// Añadir fondo rectangular detrás de la lista para mejorar visibilidad
		const totalHeight = Math.abs(gap * (this.songs.length - 1)) + 1.2; // espacio para filas + márgenes
		const bg = document.createElement('a-plane');
		bg.setAttribute('width', '5');
		bg.setAttribute('height', `${totalHeight}`);
		// colocarlo ligeramente detrás (z negativo) para evitar z-fighting
		bg.setAttribute('position', `0 ${startY + (gap * (this.songs.length - 1)) / 2 - 0.1} -0.05`);
		bg.setAttribute('color', '#1f1f1f');
		bg.setAttribute('material', 'opacity: 0.85; shader: flat; side: double');
		this.container.appendChild(bg);

		// Título encima de la lista
		const title = document.createElement('a-text');
		title.setAttribute('value', 'Lista de canciones');
		title.setAttribute('color', '#ffffff');
		title.setAttribute('width', '4');
		title.setAttribute('align', 'center');
		title.setAttribute('position', `0 ${startY + 0.6} 0.01`);
		this.container.appendChild(title);

		// Además, renderizar solo los títulos de cada canción en un nivel frontal
		// Esto garantiza que, incluso si los planos no se ven por algún motivo, los títulos sí sean visibles.
		const titlesGroup = document.createElement('a-entity');
		titlesGroup.setAttribute('id', 'lista-canciones-titulos');
		this.container.appendChild(titlesGroup);

		// Crear títulos grandes y contrastantes para cada canción (frente al fondo)
		this.songs.forEach((song, index) => {
			const y = startY + index * gap;
			const songTitle = document.createElement('a-text');
			songTitle.setAttribute('value', song.title);
			songTitle.setAttribute('color', '#ffd54f');
			songTitle.setAttribute('width', '3.5');
			songTitle.setAttribute('align', 'center');
			// colocarlo un poco delante para asegurar visibilidad
			songTitle.setAttribute('position', `0 ${y} 0.06`);
			// dar pequeño margin y peso visual
			songTitle.setAttribute('baseline', 'center');
			titlesGroup.appendChild(songTitle);
		});

		this.songs.forEach((song, index) => {
			const y = startY + index * gap;

			// Plano clickable que actúa como fila
			const plane = document.createElement('a-plane');
			plane.setAttribute('width', '4');
			plane.setAttribute('height', '0.6');
			plane.setAttribute('color', '#2b2b2b');
			// usar material flat y doble cara para mejorar visibilidad
			plane.setAttribute('material', 'shader: flat; side: double');
			// colocar ligeramente delante del fondo (z positivo pequeño)
			plane.setAttribute('position', `0 ${y} 0.01`);
			plane.setAttribute('class', 'clickable lista-cancion-item');
			plane.setAttribute('shadow', 'receive: false');

			// Data en atributo para facilitar recogida
			plane.dataset.song = JSON.stringify(song);

			// Texto con título y artista
			const titleText = document.createElement('a-text');
			titleText.setAttribute('value', `${song.title} — ${song.artist}`);
			titleText.setAttribute('color', '#fff');
			titleText.setAttribute('width', '3.8');
			titleText.setAttribute('position', '-1.9 0 0.01');
			titleText.setAttribute('align', 'left');

			// Texto con duración a la derecha
			const durText = document.createElement('a-text');
			durText.setAttribute('value', song.duration || '');
			durText.setAttribute('color', '#ddd');
			durText.setAttribute('width', '1');
			durText.setAttribute('position', '1.5 0 0.01');
			durText.setAttribute('align', 'right');

			// Añadir indicadores o icono (opcional)
			const playIcon = document.createElement('a-text');
			playIcon.setAttribute('value', '▶');
			playIcon.setAttribute('color', '#4caf50');
			playIcon.setAttribute('width', '0.5');
			playIcon.setAttribute('position', '1.9 0 0.01');

			plane.appendChild(titleText);
			plane.appendChild(durText);
			plane.appendChild(playIcon);

			// Click handler: despacha evento personalizado con detalles de la canción
			plane.addEventListener('click', (ev) => {
				const data = JSON.parse(ev.currentTarget.dataset.song);
				console.log('Canción seleccionada:', data);

				// Despacha evento personalizado desde el contenedor del módulo
				const custom = new CustomEvent('song-selected', {detail: data});
				this.container.dispatchEvent(custom);
			});

			this.container.appendChild(plane);
		});
	}
}

