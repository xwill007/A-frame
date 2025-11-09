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

                // Hacer el botón accesible por teclado
                button.setAttribute('tabindex', '0');

                // Función única que activa la selección desde cualquier fuente de entrada
                const activateSelection = (evt) => {
                    // Evitar manejos duplicados si un evento fue prevenido
                    if (evt && evt.defaultPrevented) return;
                    console.log(`Seleccionado: ${fileName}`, evt && evt.type);
                    this.loadVideo(`./videos/karaoke/${fileName}`);
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
