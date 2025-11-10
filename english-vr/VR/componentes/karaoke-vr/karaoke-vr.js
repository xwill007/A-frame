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
                const titleText = document.createElement('a-text');
                titleText.setAttribute('value', `${fileName} - ${artistName} (${videoDuration})`);
                titleText.setAttribute('align', 'center');
                titleText.setAttribute('color', this.data.textColor);
                titleText.setAttribute('width', 2.8); // Ajustar el ancho del texto para que se ajuste al cuadro
                titleText.setAttribute('position', '0 0 0.1');

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

                button.appendChild(titleText);
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

            // Crear nuevo elemento de video
            const videoElement = document.createElement('a-video');
            videoElement.setAttribute('src', videoPath);
            videoElement.setAttribute('width', this.data.videoWidth);
            videoElement.setAttribute('height', this.data.videoHeight);
            videoElement.setAttribute('position', this.data.videoPosition);

            this.el.appendChild(videoElement);

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
                evalBtn.setAttribute('color', '#d21919ff');
                evalBtn.setAttribute('position', `${vx} ${btnY} ${vz}`);
                evalBtn.setAttribute('class', 'clickable evaluate-button');
                evalBtn.setAttribute('tabindex', '0');

                const evalText = document.createElement('a-text');
                evalText.setAttribute('value', 'EVALUATE SONG');
                evalText.setAttribute('align', 'center');
                evalText.setAttribute('color', '#e81b1bff');
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
                    leftCircle.setAttribute('color', '#d21919ff');
                    leftCircle.setAttribute('position', `${-offsetX} 0 0.001`);
                    leftCircle.setAttribute('rotation', '0 0 0');

                    const rightCircle = document.createElement('a-circle');
                    rightCircle.setAttribute('radius', radius);
                    rightCircle.setAttribute('segments', 32);
                    rightCircle.setAttribute('color', '#d21919ff');
                    rightCircle.setAttribute('position', `${offsetX} 0 0.001`);
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
