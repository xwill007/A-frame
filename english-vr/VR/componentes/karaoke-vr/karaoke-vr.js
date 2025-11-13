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
            const backgroundHeight = buttonCount * 0.8 + 1.0; // Altura ajustada para incluir el título
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
                // Crear un texto para la línea superior: número y título, alineado a la izquierda
                const topText = document.createElement('a-text');
                topText.setAttribute('value', `${index + 1}. ${fileName}`);
                topText.setAttribute('align', 'left');
                topText.setAttribute('color', this.data.textColor);
                topText.setAttribute('width', 2.6); // ancho disponible dentro del botón
                // posicionar hacia la izquierda dentro del plano (x negativo)
                topText.setAttribute('position', `-1.1 0.18 0.1`);
                // reducir ligeramente el tamaño para que quepa bien
                topText.setAttribute('wrap-count', '30');

                // Crear un texto para la línea inferior: artista y duración, alineado a la izquierda
                const bottomText = document.createElement('a-text');
                bottomText.setAttribute('value', `${artistName} (${videoDuration})`);
                bottomText.setAttribute('align', 'left');
                bottomText.setAttribute('color', this.data.textColor);
                bottomText.setAttribute('width', 2.6);
                bottomText.setAttribute('position', `-1.1 -0.18 0.1`);
                bottomText.setAttribute('wrap-count', '40');

                // Hacer el botón accesible por teclado
                button.setAttribute('tabindex', '0');

                // Función única que activa la selección desde cualquier fuente de entrada
                const activateSelection = (evt) => {
                    // Evitar manejos duplicados si un evento fue prevenido
                    if (evt && evt.defaultPrevented) return;
                    console.log(`Seleccionado: ${fileName} - ${artistName}`, evt && evt.type);
                    // Pasar metadata (nombre y artista) a loadVideo para que el botón EVALUATE pueda usarla
                    this.loadVideo(`./videos/karaoke/${fileName}`, { fileName, artistName });
                };

                // Añadir listeners para varios tipos de entrada: mouse, touch, y eventos típicos de controles VR/hand
                const inputEvents = [
                    'click',
                    'mousedown',
                    'touchstart',
                    // Eventos emitidos por controladores VR (nombres comunes según plataformas)
                    'triggerdown',
                    'gripdown',
                    'abuttondown',
                    'xbuttondown',
                    'ybuttondown'
                ];
                inputEvents.forEach((ev) => button.addEventListener(ev, activateSelection));

                // Soporte de teclado (Enter / Space) cuando el plano recibe foco
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activateSelection(e);
                    }
                });
                // Guardar referencia a la función de activación en el propio elemento para uso por raycast manual
                button._activateSelection = activateSelection;

                button.appendChild(topText);
                button.appendChild(bottomText);
                videoListContainer.appendChild(button);

                // Guardar referencia para raycasting manual (mouse/touch)
                if (!this._karaokeButtons) this._karaokeButtons = [];
                this._karaokeButtons.push(button);
            });

            this.el.appendChild(videoListContainer);

            // Configurar raycasting manual para clicks del mouse/touch si no hay cursor con rayOrigin: mouse
            const setupPointerRaycast = () => {
                const sceneEl = this.el.sceneEl;
                if (!sceneEl || !sceneEl.camera) return;

                const canvas = sceneEl.canvas;
                if (!canvas) return;

                // Raycaster reutilizable
                const three = AFRAME && AFRAME.THREE ? AFRAME.THREE : window.THREE;
                if (!three) return;
                const raycaster = new three.Raycaster();

                // Construir mapa mesh -> buttonEl para buscar el elemento a partir del intersect
                const buildMeshMap = () => {
                    const meshList = [];
                    const meshToEl = new Map();
                    (this._karaokeButtons || []).forEach((btnEl) => {
                        // recorrer hijos threejs del object3D
                        btnEl.object3D.traverse((obj) => {
                            if (obj.isMesh) {
                                meshList.push(obj);
                                meshToEl.set(obj, btnEl);
                            }
                        });
                    });
                    return { meshList, meshToEl };
                };

                let meshData = buildMeshMap();

                const getPointerNDC = (clientX, clientY) => {
                    const rect = canvas.getBoundingClientRect();
                    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
                    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
                    return { x, y };
                };

                const handlePointer = (ev) => {
                    // soporte touch
                    let clientX, clientY;
                    if (ev.touches && ev.touches.length) {
                        clientX = ev.touches[0].clientX;
                        clientY = ev.touches[0].clientY;
                    } else {
                        clientX = ev.clientX;
                        clientY = ev.clientY;
                    }

                    const ndc = getPointerNDC(clientX, clientY);
                    raycaster.setFromCamera(ndc, sceneEl.camera);

                    // refrescar mapa si necesario
                    if (!meshData || meshData.meshList.length === 0) meshData = buildMeshMap();

                    const intersects = raycaster.intersectObjects(meshData.meshList, true);
                    if (intersects && intersects.length > 0) {
                        const mesh = intersects[0].object;
                        const btnEl = meshData.meshToEl.get(mesh);
                        if (btnEl) {
                            // Preferir llamar a la función guardada en el elemento (si existe)
                            if (typeof btnEl._activateSelection === 'function') {
                                try { btnEl._activateSelection({ type: 'pointerdown', defaultPrevented: false }); } catch (err) { console.warn('Error al ejecutar _activateSelection:', err); }
                            } else {
                                // Como fallback, despachar un evento 'click' para activar los listeners existentes
                                try { btnEl.dispatchEvent(new Event('click', { bubbles: true, cancelable: true })); } catch (err) { console.warn('Error al despachar click:', err); }
                            }
                            // evitar que el evento nativo propague si corresponde
                            ev.preventDefault();
                        }
                    }
                };

                // Añadir listeners al canvas
                canvas.addEventListener('mousedown', handlePointer, { passive: false });
                canvas.addEventListener('touchstart', handlePointer, { passive: false });

                // Reconstruir mesh map cuando cambie la geometría (por si hay re-render)
                this.el.addEventListener('object3dset', () => { meshData = buildMeshMap(); });
            };

            // Si la escena aún no ha inicializado la cámara/canvas, esperar al evento 'renderstart'
            if (this.el.sceneEl && this.el.sceneEl.camera && this.el.sceneEl.canvas) {
                setupPointerRaycast();
            } else if (this.el.sceneEl) {
                this.el.sceneEl.addEventListener('renderstart', setupPointerRaycast);
            }

            // Verificar si la propiedad visible es true y cargar el video inicial
            if (this.el.getAttribute('visible')) {
                this.loadVideo(this.data.videoPath);
            }
        },

        loadVideo: function (videoPath, meta) {
            console.log(`Cargando video: ${videoPath}`);

            // Guardar metadata de la canción actual si se provee
            const fileName = (meta && meta.fileName) ? meta.fileName : null;
            const artistName = (meta && meta.artistName) ? meta.artistName : null;
            this._currentSong = { path: videoPath, fileName: fileName, artist: artistName };

            // Eliminar cualquier video existente
            const existingVideo = this.el.querySelector('a-video');
            if (existingVideo) {
                this.el.removeChild(existingVideo);
            }

            // Eliminar botón de evaluar previo si existe
            if (this._evaluateButton) {
                try { this.el.removeChild(this._evaluateButton); } catch (e) {/* ignore */}
                // remover del array de botones para raycast si estaba ahí
                if (this._karaokeButtons) {
                    const idx = this._karaokeButtons.indexOf(this._evaluateButton);
                    if (idx !== -1) this._karaokeButtons.splice(idx, 1);
                }
                this._evaluateButton = null;
            }

            // Crear nuevo elemento de video: primero creamos un <video> HTML oculto para tener control total
            try {
                // remover video HTML previo si existía
                if (this._htmlVideo && this._htmlVideo.parentNode) {
                    try { this._htmlVideo.pause(); } catch (e) {}
                    this._htmlVideo.parentNode.removeChild(this._htmlVideo);
                }
            } catch (e) { /* ignore */ }

            const vidId = 'karaoke-video-' + Math.floor(Math.random() * 1000000);
            const htmlVideo = document.createElement('video');
            htmlVideo.setAttribute('id', vidId);
            htmlVideo.setAttribute('crossorigin', 'anonymous');
            htmlVideo.setAttribute('preload', 'metadata');
            htmlVideo.style.display = 'none';
            htmlVideo.src = videoPath;
            document.body.appendChild(htmlVideo);
            this._htmlVideo = htmlVideo;

            // Crear el a-video y apuntarlo al <video> HTML con selector #id
            const aVideoEl = document.createElement('a-video');
            aVideoEl.setAttribute('src', `#${vidId}`);
            aVideoEl.setAttribute('width', this.data.videoWidth);
            aVideoEl.setAttribute('height', this.data.videoHeight);
            aVideoEl.setAttribute('position', this.data.videoPosition);
            this.el.appendChild(aVideoEl);
            this._aVideo = aVideoEl;

            // ---- Crear controles como hijos del componente, posicionados debajo del video ----
            // calcular posición relativa basada en videoPosition y videoHeight
            const posParts = (this.data.videoPosition || '0 0 0').split(' ').map(parseFloat);
            const vx = isNaN(posParts[0]) ? 0 : posParts[0];
            const vy = isNaN(posParts[1]) ? 0 : posParts[1];
            const vz = isNaN(posParts[2]) ? 0 : posParts[2];

            // eliminar controles previos si existen
            if (this._controlsEntity) {
                try { this.el.removeChild(this._controlsEntity); } catch (e) {}
                this._controlsEntity = null;
            }

            const controls = document.createElement('a-entity');
            // separacion por debajo del borde del video
            const controlOffset = 0.6;
            const controlsY = vy - (this.data.videoHeight / 2) - controlOffset;
            controls.setAttribute('position', `${vx} ${controlsY} ${vz}`);
            controls.setAttribute('id', 'karaoke-controls');

            // fondo y linea
            const progressBg = document.createElement('a-plane');
            progressBg.setAttribute('id', 'karaoke-progress-bg');
            progressBg.setAttribute('width', Math.max(1.8, this.data.videoWidth));
            progressBg.setAttribute('height', 1.0);
            progressBg.setAttribute('color', '#101010');
            progressBg.setAttribute('opacity', '0.6');
            progressBg.setAttribute('position', `0 -0.05 -0.02`);

            const progressLine = document.createElement('a-plane');
            progressLine.setAttribute('id', 'karaoke-progress-line');
            // hacer la linea ligeramente más angosta que el video para tener padding
            progressLine.setAttribute('width', (this.data.videoWidth * 0.9).toString());
            progressLine.setAttribute('height', 0.04);
            progressLine.setAttribute('color', '#bbbbbb');
            progressLine.setAttribute('position', `0 -0.1 0.01`);
            progressLine.setAttribute('class', 'clickable');

            const thumb = document.createElement('a-circle');
            thumb.setAttribute('id', 'karaoke-progress-thumb');
            thumb.setAttribute('radius', 0.09);
            thumb.setAttribute('color', '#ffffff');
            // posicion inicial a la izquierda
            const initialX = -(parseFloat(progressLine.getAttribute('width')) / 2) || -(this.data.videoWidth * 0.9 / 2);
            thumb.setAttribute('position', `${initialX} -0.1 0.02`);
            thumb.setAttribute('class', 'clickable');

            // tiempos
            const timeElapsed = document.createElement('a-text');
            timeElapsed.setAttribute('id', 'karaoke-time-elapsed');
            timeElapsed.setAttribute('value', '0:00');
            timeElapsed.setAttribute('align', 'left');
            timeElapsed.setAttribute('color', '#ffffff');
            timeElapsed.setAttribute('width', 1.6);
            timeElapsed.setAttribute('position', `${-this.data.videoWidth * 0.45} 0.06 0.02`);

            const timeTotal = document.createElement('a-text');
            timeTotal.setAttribute('id', 'karaoke-time-total');
            timeTotal.setAttribute('value', '0:00');
            timeTotal.setAttribute('align', 'right');
            timeTotal.setAttribute('color', '#ffffff');
            timeTotal.setAttribute('width', 1.6);
            timeTotal.setAttribute('position', `${this.data.videoWidth * 0.45} 0.06 0.02`);

            // botones
            const btnBack = document.createElement('a-circle');
            btnBack.setAttribute('id', 'karaoke-btn-back');
            btnBack.setAttribute('class', 'clickable');
            // Aumentar tamaño para mantener proporción con el botón Play (0.07 -> 0.14)
            btnBack.setAttribute('radius', 0.14);
            btnBack.setAttribute('color', '#333333');
            // Elevar Y para alinearlo con el botón Play más grande
            btnBack.setAttribute('position', `-${this.data.videoWidth * 0.2} 0.3 0.02`);
            const backText = document.createElement('a-text');
            backText.setAttribute('value', '<<');
            backText.setAttribute('align','center');
            backText.setAttribute('color','#ffffff');
            backText.setAttribute('position','0 0 0.01');
            // Aumentar tamaño del texto: usar scale para agrandar visualmente
            backText.setAttribute('width','1.0');
            backText.setAttribute('scale','3.0 3.0 3.0');
            btnBack.appendChild(backText);

            const btnPlay = document.createElement('a-circle');
            btnPlay.setAttribute('id', 'karaoke-btn-play');
            btnPlay.setAttribute('class', 'clickable');
            // Diámetro duplicado: radius aumentado de 0.1 -> 0.2
            btnPlay.setAttribute('radius', 0.2);
            btnPlay.setAttribute('color', '#121093');
            btnPlay.setAttribute('position', `0 0.3 0.02`);
            // Aumentar el ancho del texto para mayor legibilidad
            const playText = document.createElement('a-text');
            playText.setAttribute('id','karaoke-play-text');
            playText.setAttribute('value','Play');
            playText.setAttribute('align','center');
            playText.setAttribute('color','#ffffff');
            playText.setAttribute('position','0 0 0.01');
            playText.setAttribute('width','4.0');
            btnPlay.appendChild(playText);

            const btnForward = document.createElement('a-circle');
            btnForward.setAttribute('id', 'karaoke-btn-forward');
            btnForward.setAttribute('class', 'clickable');
            // Aumentar tamaño para mantener proporción con el botón Play (0.07 -> 0.14)
            btnForward.setAttribute('radius', 0.14);
            btnForward.setAttribute('color', '#333333');
            // Elevar Y para alinearlo con el botón Play más grande
            btnForward.setAttribute('position', `${this.data.videoWidth * 0.2} 0.3 0.02`);
            const fwdText = document.createElement('a-text');
            fwdText.setAttribute('value','>>');
            fwdText.setAttribute('align','center');
            fwdText.setAttribute('color','#ffffff');
            fwdText.setAttribute('position','0 0 0.01');
            // Aumentar tamaño del texto: usar scale para agrandar visualmente
            fwdText.setAttribute('width','1.0');
            fwdText.setAttribute('scale','3.0 3.0 3.0');
            btnForward.appendChild(fwdText);
            // Mostrar duración total al lado del icono >> (se actualizará en updateUI)
            const fwdTime = document.createElement('a-text');
            fwdTime.setAttribute('id', 'karaoke-forward-duration');
            fwdTime.setAttribute('value', '0:00');
            fwdTime.setAttribute('align', 'left');
            fwdTime.setAttribute('color', '#ffffff');
            fwdTime.setAttribute('width', '1.4');
            // posicionarlo a la derecha del botón
            fwdTime.setAttribute('position', '3.65 0 0.01');
            fwdTime.setAttribute('scale', '6.0 6.0 6.0'); // escalar para mayor legibilidad
            btnForward.appendChild(fwdTime);

            // agregar todos como hijos
            controls.appendChild(progressBg);
            controls.appendChild(progressLine);
            controls.appendChild(thumb);
            controls.appendChild(timeElapsed);
            controls.appendChild(timeTotal);
            controls.appendChild(btnBack);
            controls.appendChild(btnPlay);
            controls.appendChild(btnForward);

            this.el.appendChild(controls);
            this._controlsEntity = controls;

            // ---- lógica de interacción con el HTMLVideoElement ----
            const video = htmlVideo;

            const formatTime = (sec) => {
                if (isNaN(sec)) return '0:00';
                const s = Math.floor(sec % 60).toString().padStart(2, '0');
                const m = Math.floor(sec / 60);
                return `${m}:${s}`;
            };

            // flag para evitar que updateUI mueva el thumb mientras el usuario está arrastrando
            let isDragging = false;

            const updateUI = () => {
                const current = video.currentTime || 0;
                const duration = video.duration || 0;
                try { timeElapsed.setAttribute('value', formatTime(current)); } catch(e){}
                try { timeTotal.setAttribute('value', formatTime(duration)); } catch(e){}
                // actualizar también la duración mostrada junto al botón Forward (si existe)
                try { if (typeof fwdTime !== 'undefined') fwdTime.setAttribute('value', formatTime(duration)); } catch(e){}

                const lineW = parseFloat(progressLine.getAttribute('width')) || (this.data.videoWidth * 0.9);
                const half = lineW / 2;
                const ratio = duration ? Math.max(0, Math.min(1, current / duration)) : 0;
                const x = -half + ratio * lineW;
                // sólo mover el thumb automáticamente si no se está arrastrando
                if (!isDragging) {
                    try { thumb.setAttribute('position', `${x} -0.1 0.02`); } catch(e){}
                }
            };

            // Eventos del video
            video.addEventListener('timeupdate', updateUI);
            video.addEventListener('loadedmetadata', updateUI);
            video.addEventListener('play', () => { try { playText.setAttribute('value','Pause'); } catch(e){} });
            video.addEventListener('pause', () => { try { playText.setAttribute('value','Play'); } catch(e){} });

            // botones
            btnPlay.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
            btnBack.addEventListener('click', () => { video.currentTime = Math.max(0, (video.currentTime || 0) - 10); });
            btnForward.addEventListener('click', () => { video.currentTime = Math.min(video.duration || (video.currentTime || 0) + 10, video.duration || (video.currentTime || 0) + 10); });

            // click en la barra para seek
            progressLine.addEventListener('click', (evt) => {
                try {
                    const inter = evt.detail && evt.detail.intersection && evt.detail.intersection.point;
                    if (!inter) return;
                    const point = inter.clone();
                    progressLine.object3D.worldToLocal(point);
                    const lineWidth = parseFloat(progressLine.getAttribute('width')) || (this.data.videoWidth * 0.9);
                    const half = lineWidth / 2;
                    const ratio = Math.max(0, Math.min(1, (point.x + half) / lineWidth));
                    const seekTime = (video.duration || 0) * ratio;
                    if (!isNaN(seekTime)) video.currentTime = seekTime;
                } catch (err) { console.error('Error al seekear desde controles del componente:', err); }
            });

            // === Drag-to-seek: permitir arrastrar el thumb para seekear ===
            try {
                const self = this;
                const three = (AFRAME && AFRAME.THREE) ? AFRAME.THREE : window.THREE;
                const rr = three ? new three.Raycaster() : null;

                const pointerToRatio = (clientX, clientY) => {
                    try {
                        const sceneEl = self.el.sceneEl;
                        if (!sceneEl || !sceneEl.camera || !sceneEl.canvas || !rr) return null;
                        const rect = sceneEl.canvas.getBoundingClientRect();
                        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
                        const y = -((clientY - rect.top) / rect.height) * 2 + 1;
                        rr.setFromCamera({ x, y }, sceneEl.camera);
                        const intersects = rr.intersectObject(progressLine.object3D, true);
                        if (intersects && intersects.length > 0) {
                            const p = intersects[0].point.clone();
                            progressLine.object3D.worldToLocal(p);
                            const lineWidth = parseFloat(progressLine.getAttribute('width')) || (self.data.videoWidth * 0.9);
                            const half = lineWidth / 2;
                            const ratio = Math.max(0, Math.min(1, (p.x + half) / lineWidth));
                            return ratio;
                        }
                    } catch (e) { /* ignore */ }
                    return null;
                };

                const onPointerMove = (ev) => {
                    ev.preventDefault && ev.preventDefault();
                    let clientX, clientY;
                    if (ev.touches && ev.touches.length) {
                        clientX = ev.touches[0].clientX; clientY = ev.touches[0].clientY;
                    } else {
                        clientX = ev.clientX; clientY = ev.clientY;
                    }
                    const r = pointerToRatio(clientX, clientY);
                    if (r === null) return;
                    const t = (video.duration || 0) * r;
                    if (!isNaN(t)) {
                        try { video.currentTime = t; } catch(e){}
                        updateUI();
                    }
                };

                const stopDrag = (ev) => {
                    isDragging = false;
                    document.removeEventListener('mousemove', onPointerMove);
                    document.removeEventListener('touchmove', onPointerMove);
                    document.removeEventListener('mouseup', stopDrag);
                    document.removeEventListener('touchend', stopDrag);
                };

                const startDrag = (ev) => {
                    ev && ev.preventDefault && ev.preventDefault();
                    isDragging = true;
                    // mover inmediatamente al punto de inicio para mayor responsividad
                    if (ev.touches && ev.touches.length) onPointerMove(ev);
                    else if (ev.clientX !== undefined) onPointerMove(ev);
                    document.addEventListener('mousemove', onPointerMove, { passive: false });
                    document.addEventListener('touchmove', onPointerMove, { passive: false });
                    document.addEventListener('mouseup', stopDrag);
                    document.addEventListener('touchend', stopDrag);
                };

                // Listeners en el thumb
                thumb.addEventListener('mousedown', startDrag);
                thumb.addEventListener('touchstart', startDrag, { passive: false });
                // Soporte para eventos de controladores VR (trigger/grip)
                ['triggerdown', 'gripdown', 'abuttondown', 'xbuttondown'].forEach((evName) => thumb.addEventListener(evName, startDrag));
                ['triggerup', 'gripup', 'abuttonup', 'xbuttonup'].forEach((evName) => thumb.addEventListener(evName, stopDrag));
            } catch (e) {
                console.warn('Drag-to-seek no disponible (raycaster o escena faltante):', e);
            }

            // comenzar precarga del video para que metadata esté disponible
            try { video.load(); } catch(e) {}

            // actualizar UI inicial
            setTimeout(updateUI, 200);

            // guardar referencias para limpieza futura
            this._video = video;
            this._aVideo = aVideoEl;

            // Crear botón "EVALUATE SONG" debajo del video
            try {
                const posParts = (this.data.videoPosition || '0 0 0').split(' ').map(parseFloat);
                const vx = isNaN(posParts[0]) ? 0 : posParts[0];
                const vy = isNaN(posParts[1]) ? 0 : posParts[1];
                const vz = isNaN(posParts[2]) ? 0 : posParts[2];

                const evalBtn = document.createElement('a-plane');
                // ancho máximo basado en videoWidth
                let btnWidth = Math.min(this.data.videoWidth, 4);
                // Aumentar el alto del botón para que el texto escalado quede centrado y sea más visible
                const btnHeight = 1.2;
                // posicionar en la parte superior del video (centro del video más la mitad de su altura)
                const btnY = vy + (this.data.videoHeight / 2) + (btnHeight / 2) + 0.15;
                // Ajuste dinámico del ancho en base a la longitud del texto (aprox.)
                const tmpTextValue = 'EVALUATE SONG';
                // factor aproximado por carácter (ajustable)
                const charFactor = 0.12; // world units por carácter en escala 1
                const scaleFactor = 1.0; // porque usamos scale 2 en el texto
                const desiredWidth = Math.min(btnWidth, Math.max(1.8, tmpTextValue.length * charFactor * scaleFactor + 0.6));
                btnWidth = Math.max(btnWidth * 0.6, desiredWidth); // nunca demasiado pequeño

                evalBtn.setAttribute('width', btnWidth + 1);
                evalBtn.setAttribute('height', btnHeight);
                // Usar color hex de 6 dígitos (A-Frame/three.js no siempre acepta 8 dígitos RGBA)
                evalBtn.setAttribute('color', '#d21919');
                // Forzar material plano y doble cara para asegurar color sólido
                try { evalBtn.setAttribute('material', 'shader: flat; side: double;'); } catch (e) {}
                evalBtn.setAttribute('position', `${vx} ${btnY} ${vz}`);
                evalBtn.setAttribute('class', 'clickable evaluate-button');
                evalBtn.setAttribute('tabindex', '0');

                const evalText = document.createElement('a-text');
                evalText.setAttribute('value', 'EVALUATE SONG');
                evalText.setAttribute('align', 'center');
                evalText.setAttribute('color', '#8e8a8aff');
                // Ajustar width para que el texto escalado no quede recortado (ligeramente mayor que el scale)
                evalText.setAttribute('width', (btnWidth - 0.2) * 1.8);
                // Duplicar el tamaño de la letra: aumentar la escala del texto
                evalText.setAttribute('scale', '2 2 2');
                // Intentar centrar verticalmente el texto (baseline/anchor si están soportados)
                try {
                    evalText.setAttribute('baseline', 'center');
                    evalText.setAttribute('anchor', 'center');
                } catch (e) { /* ignore if not supported */ }
                // Posicionar el texto ligeramente por delante del plano y centrado verticalmente
                evalText.setAttribute('position', `0 0 0.06`);
                // Forzar material plano y doble cara para evitar recortes y asegurarlo visible
                try {
                    evalText.setAttribute('material', 'shader: flat; side: double; depthTest: false;');
                } catch (e) { /* ignore */ }

                // Crear dos círculos en los extremos para simular esquinas redondeadas (efecto "pill")
                try {
                    const radius = btnHeight / 2;
                    const offsetX = (btnWidth / 2) - radius +1;
                    const leftCircle = document.createElement('a-circle');
                    leftCircle.setAttribute('radius', radius);
                    leftCircle.setAttribute('segments', 32);
                    leftCircle.setAttribute('color', '#d21919');
                    leftCircle.setAttribute('position', `${-offsetX} 0 0.003`);
                    leftCircle.setAttribute('rotation', '0 0 0');

                    const rightCircle = document.createElement('a-circle');
                    rightCircle.setAttribute('radius', radius);
                    rightCircle.setAttribute('segments', 32);
                    rightCircle.setAttribute('color', '#d21919');
                    rightCircle.setAttribute('position', `${offsetX} 0 0.003`);
                    rightCircle.setAttribute('rotation', '0 0 0');

                    // Añadir círculos como hijos del plano para componer la forma
                    evalBtn.appendChild(leftCircle);
                    evalBtn.appendChild(rightCircle);
                } catch (e) {
                    // si no se soportan a-circle, ignorar
                }

                evalBtn.appendChild(evalText);

                // Handler que usa el path actual (videoPath)
                const onEvaluate = (e) => {
                    e && e.preventDefault && e.preventDefault();
                    this.evaluateSong(videoPath);
                };

                // soportar varios disparadores
                ['click', 'mousedown', 'touchstart', 'triggerdown', 'gripdown'].forEach((ev) => evalBtn.addEventListener(ev, onEvaluate));
                evalBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEvaluate(e); } });

                this.el.appendChild(evalBtn);
                this._evaluateButton = evalBtn;
                // Incluir el botón de evaluación en la lista para raycast manual y asignar activador
                if (!this._karaokeButtons) this._karaokeButtons = [];
                this._karaokeButtons.push(evalBtn);
                evalBtn._activateSelection = onEvaluate;
            } catch (e) {
                console.warn('No se pudo crear el botón EVALUATE SONG:', e);
            }
        }

        ,

        evaluateSong: function(videoPath) {
            // Acción al evaluar la canción: emitir evento y loguear
            const current = this._currentSong || { path: videoPath, fileName: null, artist: null };
            const fileName = current.fileName || (videoPath ? videoPath.split('/').pop() : 'unknown');
            const artist = current.artist || 'Artista desconocido';
            console.log('Evaluate song requested for:', videoPath, '-', fileName, '-', artist);
            try {
                this.el.emit('evaluate-song', { path: videoPath, fileName: fileName, artist: artist });
            } catch (e) {
                // fallback: nada
            }
        }
    });
    
    // NOTA: Debes incluir la librería aframe-htmlembed-component en tu index.html para que funcione el iframe de YouTube.
    // <script src="https://unpkg.com/aframe-htmlembed-component/dist/aframe-htmlembed-component.min.js"></script>
});
