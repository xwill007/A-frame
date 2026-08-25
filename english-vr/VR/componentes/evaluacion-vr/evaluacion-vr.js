// Componente de evaluación simple para VR
AFRAME.registerComponent('evaluacion-vr', {
    schema: {
        songTitle: { type: 'string', default: '' },
        artist: { type: 'string', default: '' },
        phraseId: { type: 'int', default: 1 },
        width: { type: 'number', default: 3.2 },
        height: { type: 'number', default: 2.2 },
        position: { type: 'string', default: '-2 2.5 3' },
        visible: { type: 'boolean', default: true },
        // Fraction of correct words required to pass Level 2 (Pronunciation), e.g. 0.8 = 80%
        passingThreshold: { type: 'number', default: 0.8 },
        // Number of attempts allowed per word (Level 2 - Pronunciation) before advancing to the next word
        pronMaxAttempts: { type: 'int', default: 2 }
    },

    init: function() {
        const el = this.el;
        const data = this.data;

        // Set initial position & visibility
        // Move the panel 2 units farther on Z so it's slightly away from the camera when rendered.
        // Keep the original position in case it's needed later.
        this._origPosition = data.position;
        let _adjustedPos = data.position;
        try {
            const parts = ('' + data.position).trim().split(/\s+/);
            if (parts.length === 3) {
                const x = parseFloat(parts[0]) || 0;
                const y = parseFloat(parts[1]) || 0;
                const z = parseFloat(parts[2]) || 0;
                _adjustedPos = `${x} ${y + 1} ${z - 1}`;
            }
        } catch (e) { /* ignore and use provided position */ }
        this._adjustedPosition = _adjustedPos;
        el.setAttribute('position', _adjustedPos);
        el.setAttribute('visible', data.visible);

        // Fondo
        const bg = document.createElement('a-plane');
        bg.setAttribute('width', data.width);
        bg.setAttribute('height', data.height);
        bg.setAttribute('color', '#1e1e2f');
        bg.setAttribute('material', 'shader: flat; side: double;');
        bg.setAttribute('position', '0 0 0');
        el.appendChild(bg);

        // Título de la evaluación
        const title = document.createElement('a-text');
        title.setAttribute('value', 'EVALUATION');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#ffffff');
        title.setAttribute('width', data.width);
        title.setAttribute('position', `0 ${data.height/2 - 0.25} 0.01`);
        title.setAttribute('wrap-count', '20');
        el.appendChild(title);

    // User info display (name and id) — positioned centered under the title
    const userTxt = document.createElement('a-text');
    userTxt.setAttribute('value', 'User: Guest (id: 0)');
    userTxt.setAttribute('align', 'center');
    userTxt.setAttribute('color', '#ccccff');
    // slightly narrower than panel so it wraps nicely
    userTxt.setAttribute('width', data.width - 0.4);
    // place centered above the title so it doesn't overlap the song list
    userTxt.setAttribute('position', `0 ${data.height/2 - 0.05} 0.01`);
    userTxt.setAttribute('wrap-count', '24');
    // slightly smaller so it doesn't overflow the panel
    userTxt.setAttribute('scale', '0.75 0.75 1');
    el.appendChild(userTxt);
    this._userText = userTxt;

        // populate user info from localStorage or session endpoint
        try {
            const localId = (function(){ try { return localStorage.getItem('user_id'); } catch(e){ return null; } })();
            if (localId) {
                console.log('evaluacion-vr: local user_id found in localStorage ->', localId);
                // try to also show name if stored
                const localName = (function(){ try { return localStorage.getItem('user_name'); } catch(e){ return null; } })();
                this._userText.setAttribute('value', `User: ${localName || 'User'} (id: ${localId})`);
            } else {
                // ask server for current session user
                fetch('/A-frame/Proyecto/backend/modelos/usuarios/current_user.php', { credentials: 'same-origin' })
                    .then(r => r.json())
                    .then(j => {
                        if (j && j.status === 'success' && j.user && j.user.id) {
                            const uid = j.user.id;
                            const uname = j.user.nombre || j.user.email || 'User';
                            try { localStorage.setItem('user_id', String(uid)); console.log('evaluacion-vr: saved user_id to localStorage ->', uid); } catch(e){}
                            try { localStorage.setItem('user_name', String(uname)); console.log('evaluacion-vr: saved user_name to localStorage ->', uname); } catch(e){}
                            this._userText.setAttribute('value', `User: ${uname} (id: ${uid})`);
                        }
                    }).catch(e => { /* ignore */ });
            }
        } catch(e) { /* ignore */ }

        // Song title
        const st = document.createElement('a-text');
        st.setAttribute('value', data.songTitle || 'Sin título');
        st.setAttribute('align', 'left');
        st.setAttribute('color', '#ffd');
        st.setAttribute('width', data.width - 0.2);
        st.setAttribute('position', `-${data.width/2 - 0.12} ${0.6} 0.01`);
        st.setAttribute('wrap-count', '30');
        el.appendChild(st);

        // Artist
        const ar = document.createElement('a-text');
        ar.setAttribute('value', data.artist || 'Artista desconocido');
        ar.setAttribute('align', 'left');
        ar.setAttribute('color', '#cfcfcf');
        ar.setAttribute('width', data.width - 0.2);
        ar.setAttribute('position', `-${data.width/2 - 0.12} ${0.4} 0.01`);
        ar.setAttribute('wrap-count', '30');
        el.appendChild(ar);

        // Nivel de evaluación: se deriva del botón circular elegido (ver _selectNumber).
        // Botón 2 = Nivel 2 (Pronunciación); botones 1 y 3 = Nivel 1 (Vocabulario).
        this._selectedLevel = 1;

        // mensaje de instrucción
        const instr = document.createElement('a-text');
        instr.setAttribute('value', 'Select a Difficulty Rating (1-3):');
        instr.setAttribute('align', 'center');
        instr.setAttribute('color', '#ffffff');
        instr.setAttribute('width', data.width - 0.9);
        instr.setAttribute('position', `0 ${0.1} 0.01`);
        instr.setAttribute('wrap-count', '30');
        el.appendChild(instr);

    // store reference so we can hide it when quiz starts
    this._instr = instr;

        // Input numérico 1..3: tres botones horizontales
        const inputContainer = document.createElement('a-entity');
        inputContainer.setAttribute('position', `0 -0.25 0.01`);
        el.appendChild(inputContainer);

    // store reference so it can be hidden when quiz begins
    this._inputContainer = inputContainer;

        this._numButtons = [];
        this._selected = null;
        for (let n = 1; n <= 3; n++) {
            const btn = document.createElement('a-circle');
            btn.setAttribute('radius', 0.18);
            btn.setAttribute('segments', 32);
            btn.setAttribute('color', '#666666');
            btn.setAttribute('class', 'clickable');
            btn.setAttribute('position', `${(n-2)*0.7} -0.2 0`);
            const txt = document.createElement('a-text');
            txt.setAttribute('value', String(n));
            txt.setAttribute('align', 'center');
            txt.setAttribute('color', '#ffffff');
            txt.setAttribute('width', 3.0);
            txt.setAttribute('position', '0 -0.0 0.02');
            btn.appendChild(txt);
            btn.addEventListener('click', () => {
                this._selectNumber(n);
            });
            inputContainer.appendChild(btn);
            this._numButtons.push(btn);
        }

        //label for input
        const inputLabel = document.createElement('a-text');
        inputLabel.setAttribute('value', '1:EASY, 2:PRONUNCIATION, 3:HARD');
        inputLabel.setAttribute('align', 'center');
        inputLabel.setAttribute('color', '#ffffff');
        inputLabel.setAttribute('width', data.width - 0.9);
        inputLabel.setAttribute('position', `0 -0.10 0.01`);
        inputLabel.setAttribute('wrap-count', '30');
        el.appendChild(inputLabel);

    // keep reference to hide later
    this._inputLabel = inputLabel;

        // Evaluate (confirm) button
        const evalBtn = document.createElement('a-plane');
        evalBtn.setAttribute('width', 1.0);
        evalBtn.setAttribute('height', 0.36);
        evalBtn.setAttribute('color', '#117711');
        evalBtn.setAttribute('class', 'clickable');
        evalBtn.setAttribute('position', `0 ${-data.height/2 + 0.35} 0.01`);
        const evalText = document.createElement('a-text');
        evalText.setAttribute('value', 'EVALUATE');
        evalText.setAttribute('align', 'center');
        evalText.setAttribute('color', '#ffffff');
        evalText.setAttribute('width', 3.0);
        evalText.setAttribute('position', '0 0 0.02');
        evalBtn.appendChild(evalText);
        evalBtn.addEventListener('click', () => {
            // Requiere haber elegido uno de los botones circulares (1, 2 o 3)
            if (!this._selected) {
                // flash the button red briefly
                const prev = evalBtn.getAttribute('color');
                evalBtn.setAttribute('color', '#aa2222');
                setTimeout(() => evalBtn.setAttribute('color', prev), 300);
                return;
            }
            // cuando hay selección: obtener palabras desde el backend y mostrarlas
            const payload = { rating: this._selected, level: this._selectedLevel, songTitle: data.songTitle, artist: data.artist };
            // send songTitle + author so backend can lookup id_cancion and return related words
            const songTitleParam = encodeURIComponent(data.songTitle || '');
            const authorParam = encodeURIComponent(data.artist || '');
            const archivoParam = encodeURIComponent(data.songTitle || '');
            const url = `/A-frame/Proyecto/backend/modelos/palabras/obtener_palabras.php?archivo=${archivoParam}&author=${authorParam}&debug=1`;

            // mostrar indicador de carga
            this._clearWords();
            const loading = document.createElement('a-text');
            loading.setAttribute('value', 'Loading words...');
            loading.setAttribute('align', 'left');
            loading.setAttribute('color', '#ffffcc');
            loading.setAttribute('width', data.width - 0.9);
            loading.setAttribute('position', `-${data.width/2 - 0.12} ${-0.75} 0.01`);
            this._wordsContainer.appendChild(loading);
            console.log('Evaluate song requested for:', data.songTitle, data.artist, 'phraseId:', data.phraseId);
            console.log('Fetching words from URL:', url);

            fetch(url, { credentials: 'same-origin' })
                .then(r => {
                    console.log('Fetch response:', r.status, r.statusText);
                    return r.json().then(json => ({ status: r.status, ok: r.ok, json }));
                })
                .then(({ status, ok, json }) => {
                    console.log('Parsed API JSON:', json);
                    if (this._wordsContainer && loading.parentNode === this._wordsContainer) {
                        try { this._wordsContainer.removeChild(loading); } catch(e){}
                    }

                    if (!json || (json.status && json.status !== 'success')) {
                        console.warn('API returned no words or error:', json);
                        const err = document.createElement('a-text');
                        err.setAttribute('value', 'No words found');
                        err.setAttribute('align', 'left');
                        err.setAttribute('color', '#ffcccc');
                        err.setAttribute('width', data.width - 0.9);
                        err.setAttribute('position', `-${data.width/2 - 0.12} ${-0.75} 0.01`);
                        this._wordsContainer.appendChild(err);
                        try { el.emit('submit-evaluation', payload); } catch(e){}
                        return;
                    }

                    const words = json.words || [];
                    if (!words.length) {
                        const err = document.createElement('a-text');
                        err.setAttribute('value', 'No words found');
                        err.setAttribute('align', 'left');
                        err.setAttribute('color', '#ffcccc');
                        err.setAttribute('width', data.width - 0.9);
                        err.setAttribute('position', `-${data.width/2 - 0.12} ${-0.75} 0.01`);
                        this._wordsContainer.appendChild(err);
                        try { el.emit('submit-evaluation', payload); } catch(e){}
                        return;
                    }

                    // map to simple form [{esp, ing}]
                    const quizWords = words.map(w => ({ esp: w.esp_palabra || '', ing: w.ing_palabra || '' }));
                    // Nivel 2: pronunciación. Nivel 1 (por defecto): quiz de traducción
                    if (this._selectedLevel === 2) {
                        this._startPronunciation(quizWords, payload);
                    } else {
                        this._startQuiz(quizWords, payload);
                    }
                })
                .catch(err => {
                    console.error('Error fetching words:', err);
                    if (this._wordsContainer && loading.parentNode === this._wordsContainer) {
                        try { this._wordsContainer.removeChild(loading); } catch(e){}
                    }
                    const eTxt = document.createElement('a-text');
                    eTxt.setAttribute('value', 'Error fetching words');
                    eTxt.setAttribute('align', 'left');
                    eTxt.setAttribute('color', '#ffaaaa');
                    eTxt.setAttribute('width', data.width - 0.9);
                    eTxt.setAttribute('position', `-${data.width/2 - 0.12} ${-0.75} 0.01`);
                    this._wordsContainer.appendChild(eTxt);
                    try { el.emit('submit-evaluation', payload); } catch(e){}
                });
        });
        el.appendChild(evalBtn);

        // Contenedor para mostrar evaluaciones previas (debajo del botón EVALUATE)
        this._evaluationsContainer = document.createElement('a-entity');
        this._evaluationsContainer.setAttribute('position', `0 ${-data.height/2 - 0.5} 0.01`);
        el.appendChild(this._evaluationsContainer);

        // Cargar evaluaciones previas al iniciar
        this._loadPreviousEvaluations();

        // Close button
        const closeBtn = document.createElement('a-plane');
        closeBtn.setAttribute('width', 0.28);
        closeBtn.setAttribute('height', 0.18);
        closeBtn.setAttribute('color', '#aa2222');
        closeBtn.setAttribute('position', `${data.width/2 - 0.18} ${data.height/2 - 0.18} 0.01`);
        closeBtn.setAttribute('class', 'clickable');
        const closeText = document.createElement('a-text');
        closeText.setAttribute('value', 'X');
        closeText.setAttribute('align', 'center');
        closeText.setAttribute('color', '#fff');
        closeText.setAttribute('position', '0 0 0.02');
        closeBtn.appendChild(closeText);
        closeBtn.addEventListener('click', () => {
            try { if (el.parentNode) el.parentNode.removeChild(el); } catch(e){}
        });
        el.appendChild(closeBtn);

        // Enable mouse pointer (non-raycaster) clicks on the close button by performing
        // a THREE.Raycaster test from the camera using the mouse screen coords.
        try {
            const THREE = AFRAME.THREE;
            this._mouse = new THREE.Vector2();
            this._raycaster = new THREE.Raycaster();
            this._onPointerDown = (evt) => {
                try {
                    const sceneEl = this.el.sceneEl;
                    const canvas = sceneEl && sceneEl.canvas ? sceneEl.canvas : document.querySelector('canvas');
                    if (!canvas || !sceneEl.camera) return;
                    const rect = canvas.getBoundingClientRect();
                    // normalize mouse coords [-1,1]
                    this._mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
                    this._mouse.y = - ((evt.clientY - rect.top) / rect.height) * 2 + 1;
                    this._raycaster.setFromCamera(this._mouse, sceneEl.camera);

                    // collect mesh objects and map uuids back to their elements
                    const meshes = [];
                    const meshMap = Object.create(null);

                    // close button meshes
                    if (this._closeBtn && this._closeBtn.object3D) {
                        this._closeBtn.object3D.traverse(o => {
                            if (o.isMesh) {
                                meshes.push(o);
                                meshMap[o.uuid] = { type: 'close', el: this._closeBtn };
                            }
                        });
                    }

                    // numeric buttons (difficulty selector)
                    (this._numButtons || []).forEach((b, idx) => {
                        try {
                            if (b && b.object3D) {
                                b.object3D.traverse(o => {
                                    if (o.isMesh) {
                                        meshes.push(o);
                                        meshMap[o.uuid] = { type: 'num', index: idx, el: b };
                                    }
                                });
                            }
                        } catch(e) {}
                    });

                    // pronunciation "LISTEN" button (Level 2 flow)
                    if (this._pronListenBtn && this._pronListenBtn.object3D) {
                        this._pronListenBtn.object3D.traverse(o => {
                            if (o.isMesh) {
                                meshes.push(o);
                                meshMap[o.uuid] = { type: 'pron-listen', el: this._pronListenBtn };
                            }
                        });
                    }

                    // option buttons (current quiz options) - created dynamically in _renderQuestion
                    (this._optionButtons || []).forEach((b, idx) => {
                        try {
                            if (b && b.object3D) {
                                b.object3D.traverse(o => {
                                    if (o.isMesh) {
                                        meshes.push(o);
                                        meshMap[o.uuid] = { type: 'option', index: idx, el: b };
                                    }
                                });
                            }
                        } catch(e) {}
                    });

                    // evaluate button meshes (allow screen mouse clicks without VR cursor)
                    if (this._evalBtn && this._evalBtn.object3D) {
                        this._evalBtn.object3D.traverse(o => {
                            if (o.isMesh) {
                                meshes.push(o);
                                meshMap[o.uuid] = { type: 'eval', el: this._evalBtn };
                            }
                        });
                    }

                    if (!meshes.length) return;
                    const intersects = this._raycaster.intersectObjects(meshes, true);
                    if (intersects && intersects.length) {
                        const hit = intersects[0].object;
                        const info = meshMap[hit.uuid];
                        if (info) {
                            if (info.type === 'close') {
                                try { if (this.el.parentNode) this.el.parentNode.removeChild(this.el); } catch(e){}
                                return;
                            }
                            if (info.type === 'num') {
                                // call the same selection method as the UI buttons
                                try { this._selectNumber(info.index + 1); } catch(e){}
                                return;
                            }
                            if (info.type === 'pron-listen') {
                                try { this._startListening(); } catch(e){}
                                return;
                            }
                            if (info.type === 'option') {
                                // Trigger the option button's click handler
                                try {
                                    info.el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                } catch (e) {
                                    try { this._chooseOption && this._chooseOption(info.el && info.el.value, info.el); } catch(e){}
                                }
                                return;
                            }
                            if (info.type === 'eval') {
                                // Trigger the evaluate button's click handler as if clicked by mouse
                                try {
                                    // Prefer dispatching a MouseEvent so handlers expecting MouseEvent run
                                    info.el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                } catch (e) {
                                    try { info.el.click && info.el.click(); } catch (e) {}
                                }
                                return;
                            }
                        }
                    }
                } catch(e) { /* ignore */ }
            };
            window.addEventListener('pointerdown', this._onPointerDown);
        } catch(e) {}

        // store refs
        this._titleEl = title;
        this._songEl = st;
        this._artistEl = ar;
        this._bg = bg;
        this._closeBtn = closeBtn;
        this._evalBtn = evalBtn;
    // input refs (stored earlier)
    this._inputLabel = this._inputLabel || null;
    this._inputContainer = this._inputContainer || null;
    this._instr = this._instr || null;
        // contenedor para palabras que se mostrarán debajo
        this._wordsContainer = document.createElement('a-entity');
        this._wordsContainer.setAttribute('position', '0 0 0.01');
        el.appendChild(this._wordsContainer);
    },

    update: function(oldData) {
        // actualizar texto si cambian atributos
        try {
            if (this._songEl) this._songEl.setAttribute('value', this.data.songTitle || 'Sin título');
            if (this._artistEl) this._artistEl.setAttribute('value', this.data.artist || 'Artista desconocido');
            // Recompute adjusted position (original minus 2 on Z) when attributes update
            try {
                const posStr = this.data.position || this._origPosition || '0 0 0';
                const parts = ('' + posStr).trim().split(/\s+/);
                let adj = posStr;
                if (parts.length === 3) {
                    const x = parseFloat(parts[0]) || 0;
                    const y = parseFloat(parts[1]) || 0;
                    const z = parseFloat(parts[2]) || 0;
                    adj = `${x} ${y} ${z - 2}`;
                }
                if (this.el) this.el.setAttribute('position', adj);
                this._adjustedPosition = adj;
            } catch (e) { /* ignore */ }
            if (this.el) this.el.setAttribute('visible', this.data.visible);
        } catch(e) {}
    },

    _setRating: function(r) {
        this._currentRating = r;
        // legacy for stars, keep behavior
        if (this._stars && this._stars.length) {
            this._stars.forEach((s, idx) => {
                try { s.setAttribute('color', (idx < r) ? '#ffcc00' : '#666666'); } catch(e){}
            });
        }
    }
    ,

    // Save evaluation to backend. Attempts to obtain user id from localStorage or session endpoint.
    _saveEvaluation: function(info) {
        try {
            const archivo = info.archivo || '';
            const total = Number.isFinite(info.total) ? info.total : 0;
            const nota = info.nota_evaluacion || null;
            const terminado = info.terminado ? 1 : 0;
            const nivel = info.nivel || 1;

            const doPost = (idUsuario) => {
                const body = { id_usuario: idUsuario || 0, archivo: archivo, total: total, nota_evaluacion: nota, terminado: terminado, nivel: nivel };
                fetch('/A-frame/Proyecto/backend/modelos/evaluaciones/guardar_evaluacion.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    credentials: 'same-origin'
                }).then(r => r.json()).then(j => {
                    console.log('guardar_evaluacion response', j);
                    if (j && j.status === 'success' && j.id_evaluacion && idUsuario) {
                        // store last evaluation id optionally
                        try { localStorage.setItem('last_evaluation_id', j.id_evaluacion); } catch(e){}
                    }
                }).catch(err => console.warn('Error saving evaluation', err));
            };

            // Try client-side stored user id first
            let uid = null;
            try { uid = localStorage.getItem('user_id'); } catch(e) { uid = null; }
            if (uid) {
                doPost(parseInt(uid,10));
                return;
            }

            // Fallback: query session from server
            fetch('/A-frame/Proyecto/backend/modelos/usuarios/current_user.php', { credentials: 'same-origin' })
                .then(r => r.json())
                .then(j => {
                    if (j && j.status === 'success' && j.user && j.user.id) {
                        try { localStorage.setItem('user_id', String(j.user.id)); } catch(e){}
                        doPost(j.user.id);
                    } else {
                        // send as anonymous (user_id = 0)
                        doPost(0);
                    }
                }).catch(e => {
                    // network issue: send anonymous
                    doPost(0);
                });
        } catch(e) { console.warn('saveEvaluation error', e); }
    },

    remove: function() {
        // cleanup global listeners
        try {
            if (this._onPointerDown) window.removeEventListener('pointerdown', this._onPointerDown);
        } catch(e) {}
        // stop any in-progress speech recognition
        try {
            if (this._recognition) { this._recognition.onresult = null; this._recognition.onerror = null; this._recognition.onend = null; this._recognition.abort(); }
        } catch(e) {}
        // release the microphone/audio meter if it was left open
        try { this._stopAudioMeter(); } catch(e) {}
    },

    // Handle circular button selection (1, 2 or 3). Button 2 doubles as the
    // Level 2 (Pronunciation) trigger; buttons 1 and 3 select Level 1 (Vocabulary) difficulty.
    _selectNumber: function(n) {
        this._selected = n;
        // highlight selected button
        (this._numButtons || []).forEach((btn, idx) => {
            try { btn.setAttribute('color', (idx === (n-1)) ? '#ffcc00' : '#666666'); } catch(e){}
        });
        this._selectLevel(n === 2 ? 2 : 1);
    }
    ,

    // Select evaluation level: 1 = Vocabulary (translation quiz), 2 = Pronunciation
    _selectLevel: function(n) {
        this._selectedLevel = n;
    }
    ,

    // Initialize and start quiz flow with the fetched words
    _startQuiz: function(words, payload) {
        this._quizWords = words || [];
        this._currentIndex = 0;
        this._payloadForSubmit = payload || {};
        this._awaitingAnswer = false;
        // clear any previous UI
        this._clearWords();
        // hide previous texts / controls so only quiz UI is visible
        try {
            const toHide = ['_titleEl','_songEl','_artistEl','_instr','_inputLabel','_inputContainer','_evalBtn'];
            toHide.forEach(k => {
                try {
                    const elRef = this[k];
                    if (elRef) {
                        // some refs are arrays (e.g., buttons); handle both
                        if (Array.isArray(elRef)) {
                            elRef.forEach(x => { try { x.setAttribute('visible', false); } catch(e){} });
                        } else {
                            try { elRef.setAttribute('visible', false); } catch(e){}
                        }
                    }
                } catch(e){}
            });
        } catch(e) {}

        // render first question
        this._renderQuestion();
    }
    ,

    // Render current question: show English word and three Spanish options
    _renderQuestion: function() {
        try {
            this._clearWords();
            if (!this._quizWords || !this._quizWords.length) {
                const noTxt = document.createElement('a-text');
                noTxt.setAttribute('value', 'No quiz words available');
                noTxt.setAttribute('align', 'left');
                noTxt.setAttribute('color', '#ffcccc');
                noTxt.setAttribute('width', this.data.width - 0.9);
                noTxt.setAttribute('position', `-${this.data.width/2 - 0.12} ${-0.75} 0.01`);
                this._wordsContainer.appendChild(noTxt);
                return;
            }

            const idx = this._currentIndex || 0;
            const current = this._quizWords[idx];
            const eng = current.ing || '';
            const correctEsp = current.esp || '';

            // Center the quiz content on the grey plane (plane center is 0,0)
            // Place English word near the top-center of the plane, options centered below it.
            const planeW = this.data.width;
            const planeH = this.data.height;
            const centerY = 0; // plane center
            const engY = centerY + (planeH * 0.18); // towards the top of the panel
            const optionsY = centerY - (planeH * 0.06); // a bit below center
            const progY = centerY - (planeH * 0.22);

            const engTxt = document.createElement('a-text');
            engTxt.setAttribute('value', eng);
            engTxt.setAttribute('align', 'center');
            engTxt.setAttribute('color', '#ffffff');
            engTxt.setAttribute('width', Math.max(1.0, planeW - 0.6));
            engTxt.setAttribute('position', `0 ${engY} 0.01`);
            engTxt.setAttribute('wrap-count', '30');
            this._wordsContainer.appendChild(engTxt);

            // Prepare options: correct + two random distractors
            const distractors = [];
            const pool = this._quizWords.map(w => w.esp).filter((s, i) => i !== idx && s);
            // shuffle pool
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
            }
            if (pool.length >= 2) {
                distractors.push(pool[0], pool[1]);
            } else if (pool.length === 1) {
                distractors.push(pool[0]);
            }

            const options = [correctEsp].concat(distractors).slice(0,3);
            // if less than 3 options, pad with empty strings
            while (options.length < 3) options.push('');

            // shuffle options so correct isn't always first
            for (let i = options.length -1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = options[i]; options[i] = options[j]; options[j] = tmp;
            }

            // Create option buttons (horizontal) centered under the english word
            // Keep references so we can detect clicks via screen mouse raycasting
            this._optionButtons = [];
            const optW = 1.0;
            const optGap = 0.12;
            const totalW = options.length * optW + (options.length - 1) * optGap;
            const startX = - (totalW / 2) + (optW / 2);
            options.forEach((opt, i) => {
                const btn = document.createElement('a-plane');
                btn.setAttribute('width', optW);
                btn.setAttribute('height', 0.32);
                btn.setAttribute('color', '#333333');
                btn.setAttribute('class', 'clickable');
                const x = startX + i * (optW + optGap);
                btn.setAttribute('position', `${x} ${optionsY} 0.01`);
                btn.setAttribute('material', 'shader: flat');

                const txt = document.createElement('a-text');
                txt.setAttribute('value', opt || '—');
                txt.setAttribute('align', 'center');
                txt.setAttribute('color', '#ffffff');
                txt.setAttribute('width', 2.2);
                txt.setAttribute('position', '0 0 0.02');
                btn.appendChild(txt);

                // click handler
                btn.addEventListener('click', (evt) => {
                    if (this._awaitingAnswer) return;
                    this._chooseOption(opt, evt.currentTarget);
                });

                this._wordsContainer.appendChild(btn);
                // store reference for external raycast-based clicks
                try { this._optionButtons.push(btn); } catch(e){}
            });

            // progress indicator (centered under options)
            const prog = document.createElement('a-text');
            prog.setAttribute('value', `Word ${idx+1} / ${this._quizWords.length}`);
            prog.setAttribute('align', 'center');
            prog.setAttribute('color', '#cfcfcf');
            prog.setAttribute('width', Math.max(1.0, planeW - 0.9));
            prog.setAttribute('position', `0 ${progY} 0.01`);
            this._wordsContainer.appendChild(prog);

            this._awaitingAnswer = false;
        } catch(e) { console.warn('Render question error', e); }
    }
    ,

    // Handle option selection: on correct advance, on incorrect restart to first
    _chooseOption: function(option, btnEl) {
        try {
            if (this._awaitingAnswer) return;
            this._awaitingAnswer = true;
            const idx = this._currentIndex || 0;
            const correct = (this._quizWords && this._quizWords[idx]) ? this._quizWords[idx].esp : '';
            if (option === correct) {
                // correct: flash green and advance
                try { btnEl.setAttribute('color', '#118811'); } catch(e){}
                setTimeout(() => {
                    this._currentIndex = idx + 1;
                    if (this._currentIndex >= this._quizWords.length) {
                        // finished: emit payload
                        const payload = this._payloadForSubmit || {};
                        payload.words = this._quizWords;
                        payload.archivo = this.data.songTitle || '';
                        console.log('Quiz complete — emitting submit-evaluation with payload:', payload);
                        try { this.el.emit('submit-evaluation', payload); } catch(e){}

                        // Save evaluation to backend: completed
                        try { this._saveEvaluation({ archivo: payload.archivo, total: this._quizWords.length, nota_evaluacion: '', terminado: 1, nivel: 1 }); } catch(e){}

                        // show finished message
                        this._clearWords();
                        const done = document.createElement('a-text');
                        done.setAttribute('value', 'All correct! Evaluation submitted.');
                        done.setAttribute('align', 'center');
                        done.setAttribute('color', '#aaffaa');
                        done.setAttribute('width', this.data.width - 0.9);
                        done.setAttribute('position', `0 ${-0.75} 0.01`);
                        this._wordsContainer.appendChild(done);
                        this._awaitingAnswer = false;
                        return;
                    }
                    // render next
                    this._renderQuestion();
                }, 350);
            } else {
                // incorrect: flash red, then restart from first
                try { btnEl.setAttribute('color', '#aa2222'); } catch(e){}
                setTimeout(() => {
                    this._currentIndex = 0;
                    // show feedback
                    this._clearWords();
                    const fail = document.createElement('a-text');
                    fail.setAttribute('value', 'Incorrect — restarting from first word');
                    fail.setAttribute('align', 'center');
                    fail.setAttribute('color', '#ffaaaa');
                    fail.setAttribute('width', this.data.width - 0.9);
                    fail.setAttribute('position', `0 ${-0.75} 0.01`);
                    this._wordsContainer.appendChild(fail);
                    // report incorrect attempt (save partial result and the wrong word)
                    try { this._saveEvaluation({ archivo: this.data.songTitle || '', total: idx, nota_evaluacion: option, terminado: 0, nivel: 1 }); } catch(e){}
                    setTimeout(() => this._renderQuestion(), 800);
                }, 350);
            }
        } catch(e) { console.warn('Choose option error', e); this._awaitingAnswer = false; }
    }
    ,

    _clearWords: function() {
        try {
            while (this._wordsContainer && this._wordsContainer.firstChild) {
                this._wordsContainer.removeChild(this._wordsContainer.firstChild);
            }
            // clear any stored option button refs to avoid stale handles
            try { this._optionButtons = []; } catch(e){}
            try { this._pronListenBtn = null; this._pronListenTxt = null; this._pronFeedback = null; } catch(e){}
            // the meter bars just got removed from the DOM along with the rest of wordsContainer;
            // stop the mic/analyser loop and drop the stale references
            try { this._stopAudioMeter(); this._meterBars = []; this._meterContainer = null; } catch(e){}
        } catch(e) {}
    },

    // ---------------------------------------------------------------
    // Nivel 2: Evaluación de pronunciación
    // ---------------------------------------------------------------

    // Initialize pronunciation flow with the fetched words
    // Crea (o recrea) el panel lateral derecho, dentro del mismo componente, que lista
    // en vivo las palabras falladas del Nivel 2 (la más reciente arriba) y su contador.
    _createFailedSidebar: function() {
        try { if (this._failedSidebar && this._failedSidebar.parentNode) this._failedSidebar.parentNode.removeChild(this._failedSidebar); } catch(e){}

        const planeW = this.data.width;
        const planeH = this.data.height;
        const sidebarW = 1.6;
        const gap = 0.15;

        const sidebar = document.createElement('a-entity');
        sidebar.setAttribute('position', `${planeW / 2 + gap + sidebarW / 2} 0 0.01`);
        this.el.appendChild(sidebar);

        const bg = document.createElement('a-plane');
        bg.setAttribute('width', sidebarW);
        bg.setAttribute('height', planeH);
        bg.setAttribute('color', '#2a1620');
        bg.setAttribute('material', 'shader: flat; side: double;');
        sidebar.appendChild(bg);

        const counter = document.createElement('a-text');
        counter.setAttribute('align', 'center');
        counter.setAttribute('color', '#ff8888');
        counter.setAttribute('width', sidebarW - 0.1);
        counter.setAttribute('position', `0 ${planeH / 2 - 0.25} 0.01`);
        counter.setAttribute('wrap-count', '18');
        sidebar.appendChild(counter);
        this._failedCounterTxt = counter;

        const list = document.createElement('a-text');
        list.setAttribute('align', 'left');
        list.setAttribute('color', '#ffdddd');
        list.setAttribute('width', sidebarW - 0.1);
        list.setAttribute('position', `-${sidebarW / 2 - 0.12} ${planeH / 2 - 0.55} 0.02`);
        list.setAttribute('wrap-count', '16');
        list.setAttribute('scale', '0.8 0.8 1');
        sidebar.appendChild(list);
        this._failedListTxt = list;

        this._failedSidebar = sidebar;
        this._updateFailedSidebar();
    }
    ,

    // Refresca el contador y la lista (la más reciente arriba) a partir de this._pronFailedList.
    // Cada entrada es { ing, transcript }: la palabra esperada y lo que el reconocimiento captó.
    _updateFailedSidebar: function() {
        try {
            const words = this._pronFailedList || [];
            if (this._failedCounterTxt) this._failedCounterTxt.setAttribute('value', `Errors: ${words.length}`);
            if (this._failedListTxt) {
                const maxShown = 10;
                const shown = words.slice(0, maxShown);
                let text = shown.map((w, i) => `${i + 1}. ${w.ing}\n   (heard: ${w.transcript || '?'})`).join('\n');
                if (words.length > maxShown) text += `\n+${words.length - maxShown} more`;
                this._failedListTxt.setAttribute('value', text);
            }
        } catch(e) {}
    }
    ,

    _startPronunciation: function(words, payload) {
        this._pronWords = words || [];
        this._pronIndex = 0;
        this._pronResults = [];
        this._pronFailedList = [];
        this._payloadForSubmit = payload || {};
        this._awaitingPronResult = false;
        this._clearWords();
        this._createFailedSidebar();

        // hide selection UI so only the pronunciation flow is visible
        try {
            const toHide = ['_titleEl','_songEl','_artistEl','_instr','_inputLabel','_inputContainer','_evalBtn'];
            toHide.forEach(k => {
                try {
                    const elRef = this[k];
                    if (elRef) {
                        if (Array.isArray(elRef)) {
                            elRef.forEach(x => { try { x.setAttribute('visible', false); } catch(e){} });
                        } else {
                            try { elRef.setAttribute('visible', false); } catch(e){}
                        }
                    }
                } catch(e){}
            });
        } catch(e) {}

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            const err = document.createElement('a-text');
            err.setAttribute('value', 'Speech recognition is not supported in this browser.\nPlease use Chrome or Edge.');
            err.setAttribute('align', 'center');
            err.setAttribute('color', '#ffaaaa');
            err.setAttribute('width', this.data.width - 0.6);
            err.setAttribute('position', '0 0 0.01');
            err.setAttribute('wrap-count', '26');
            this._wordsContainer.appendChild(err);
            return;
        }

        this._renderPronunciation();
    }
    ,

    // Render current word to pronounce, the listen button, feedback and progress
    _renderPronunciation: function() {
        try {
            this._clearWords();

            if (!this._pronWords || !this._pronWords.length) {
                const noTxt = document.createElement('a-text');
                noTxt.setAttribute('value', 'No words available for pronunciation');
                noTxt.setAttribute('align', 'left');
                noTxt.setAttribute('color', '#ffcccc');
                noTxt.setAttribute('width', this.data.width - 0.9);
                noTxt.setAttribute('position', `-${this.data.width/2 - 0.12} ${-0.75} 0.01`);
                this._wordsContainer.appendChild(noTxt);
                return;
            }

            const idx = this._pronIndex || 0;
            if (idx >= this._pronWords.length) {
                this._finishPronunciation();
                return;
            }

            // reset attempt count for the word being shown
            this._pronAttempts = 0;

            const current = this._pronWords[idx];
            const planeW = this.data.width;
            const planeH = this.data.height;
            const engY = planeH * 0.18;
            const instrY = planeH * 0.03;
            const listenY = -planeH * 0.05;
            const meterY = -planeH * 0.20;
            const feedbackY = -planeH * 0.30;
            const progY = -planeH * 0.37;

            const engTxt = document.createElement('a-text');
            engTxt.setAttribute('value', current.ing || '');
            engTxt.setAttribute('align', 'center');
            engTxt.setAttribute('color', '#ffffff');
            engTxt.setAttribute('width', Math.max(1.0, planeW - 0.6));
            engTxt.setAttribute('position', `0 ${engY} 0.01`);
            engTxt.setAttribute('wrap-count', '30');
            this._wordsContainer.appendChild(engTxt);

            const instrTxt = document.createElement('a-text');
            instrTxt.setAttribute('value', 'Say the word in English');
            instrTxt.setAttribute('align', 'center');
            instrTxt.setAttribute('color', '#cfcfcf');
            instrTxt.setAttribute('width', Math.max(1.0, planeW - 0.9));
            instrTxt.setAttribute('position', `0 ${instrY} 0.01`);
            instrTxt.setAttribute('wrap-count', '30');
            this._wordsContainer.appendChild(instrTxt);

            // Listen button (explicit user gesture required to start the microphone)
            const listenBtn = document.createElement('a-plane');
            listenBtn.setAttribute('width', 1.2);
            listenBtn.setAttribute('height', 0.34);
            listenBtn.setAttribute('color', '#225577');
            listenBtn.setAttribute('class', 'clickable');
            listenBtn.setAttribute('position', `0 ${listenY} 0.01`);
            const listenTxt = document.createElement('a-text');
            listenTxt.setAttribute('value', 'LISTEN');
            listenTxt.setAttribute('align', 'center');
            listenTxt.setAttribute('color', '#ffffff');
            listenTxt.setAttribute('width', 3.0);
            listenTxt.setAttribute('position', '0 0 0.02');
            listenBtn.appendChild(listenTxt);
            listenBtn.addEventListener('click', () => this._startListening());
            this._wordsContainer.appendChild(listenBtn);
            this._pronListenBtn = listenBtn;
            this._pronListenTxt = listenTxt;

            // Audio meter (equalizer-style bars) showing live microphone input level while listening
            this._meterMinHeight = 0.03;
            this._meterMaxHeight = 0.16;
            const meterContainer = document.createElement('a-entity');
            meterContainer.setAttribute('position', `0 ${meterY} 0.01`);
            this._wordsContainer.appendChild(meterContainer);
            this._meterBars = [];
            const barCount = 9;
            const barW = 0.09;
            const barGap = 0.025;
            const totalBarsW = barCount * barW + (barCount - 1) * barGap;
            const barsStartX = -(totalBarsW / 2) + (barW / 2);
            for (let bi = 0; bi < barCount; bi++) {
                const bar = document.createElement('a-plane');
                const bx = barsStartX + bi * (barW + barGap);
                bar.setAttribute('width', barW);
                bar.setAttribute('height', this._meterMinHeight);
                bar.setAttribute('color', '#335577');
                bar.setAttribute('material', 'shader: flat; side: double;');
                bar.setAttribute('position', `${bx} ${this._meterMinHeight / 2} 0`);
                bar._baseX = bx;
                meterContainer.appendChild(bar);
                this._meterBars.push(bar);
            }
            this._meterContainer = meterContainer;

            // Feedback placeholder (filled in after recognition result)
            const feedback = document.createElement('a-text');
            feedback.setAttribute('value', '');
            feedback.setAttribute('align', 'center');
            feedback.setAttribute('color', '#ffffff');
            feedback.setAttribute('width', Math.max(1.0, planeW - 0.9));
            feedback.setAttribute('position', `0 ${feedbackY} 0.01`);
            feedback.setAttribute('wrap-count', '30');
            this._wordsContainer.appendChild(feedback);
            this._pronFeedback = feedback;

            // Progress indicator
            const prog = document.createElement('a-text');
            prog.setAttribute('value', `Word ${idx+1} / ${this._pronWords.length}`);
            prog.setAttribute('align', 'center');
            prog.setAttribute('color', '#888888');
            prog.setAttribute('width', Math.max(1.0, planeW - 0.9));
            prog.setAttribute('position', `0 ${progY} 0.01`);
            this._wordsContainer.appendChild(prog);

            this._awaitingPronResult = false;
        } catch(e) { console.warn('Render pronunciation error', e); }
    }
    ,

    // Show a short feedback message under the listen button
    _showPronFeedback: function(text, color) {
        try {
            if (this._pronFeedback) {
                this._pronFeedback.setAttribute('value', text || '');
                this._pronFeedback.setAttribute('color', color || '#ffffff');
            }
        } catch(e) {}
    }
    ,

    // Open the microphone (independently of SpeechRecognition) and animate the equalizer bars
    // from live frequency data, so the user gets visual confirmation the mic is picking up sound.
    _startAudioMeter: function() {
        try {
            this._stopAudioMeter();
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                this._micStream = stream;
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) { this._stopAudioMeter(); return; }
                this._audioCtx = new AudioCtx();
                const source = this._audioCtx.createMediaStreamSource(stream);
                const analyser = this._audioCtx.createAnalyser();
                analyser.fftSize = 32;
                analyser.smoothingTimeConstant = 0.6;
                source.connect(analyser);
                this._analyser = analyser;
                this._analyserData = new Uint8Array(analyser.frequencyBinCount);

                this._meterInterval = setInterval(() => {
                    const bars = this._meterBars;
                    if (!this._analyser || !bars || !bars.length) return;
                    this._analyser.getByteFrequencyData(this._analyserData);
                    for (let i = 0; i < bars.length; i++) {
                        const dataIdx = Math.floor((i / bars.length) * this._analyserData.length);
                        const v = this._analyserData[dataIdx] / 255; // 0..1
                        const h = this._meterMinHeight + v * (this._meterMaxHeight - this._meterMinHeight);
                        try {
                            bars[i].setAttribute('height', h.toFixed(3));
                            bars[i].setAttribute('position', `${bars[i]._baseX} ${(h / 2).toFixed(3)} 0`);
                            bars[i].setAttribute('color', v > 0.66 ? '#ff4444' : (v > 0.33 ? '#ffcc33' : '#33cc66'));
                        } catch(e) {}
                    }
                }, 60);
            }).catch((err) => {
                console.warn('Audio meter: microphone unavailable', err);
            });
        } catch(e) { console.warn('startAudioMeter error', e); }
    }
    ,

    // Stop the mic stream/analyser and reset the equalizer bars to their resting height
    _stopAudioMeter: function() {
        try {
            if (this._meterInterval) { clearInterval(this._meterInterval); this._meterInterval = null; }
            if (this._micStream) { this._micStream.getTracks().forEach(t => { try { t.stop(); } catch(e){} }); this._micStream = null; }
            if (this._audioCtx) { try { this._audioCtx.close(); } catch(e){} this._audioCtx = null; }
            this._analyser = null;
            this._analyserData = null;
            (this._meterBars || []).forEach(b => {
                try {
                    b.setAttribute('height', this._meterMinHeight || 0.02);
                    b.setAttribute('position', `${b._baseX} ${(this._meterMinHeight || 0.02) / 2} 0`);
                    b.setAttribute('color', '#335577');
                } catch(e) {}
            });
        } catch(e) {}
    }
    ,

    // Start (or restart) speech recognition for the current word
    _startListening: function() {
        try {
            if (this._awaitingPronResult) return;
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) {
                this._showPronFeedback('Speech recognition not supported in this browser', '#ffaaaa');
                return;
            }
            if (this._recognition) {
                try { this._recognition.onresult = null; this._recognition.onerror = null; this._recognition.onend = null; this._recognition.abort(); } catch(e){}
                this._recognition = null;
            }

            const recognition = new SR();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            this._recognition = recognition;

            try { this._pronListenTxt.setAttribute('value', 'LISTENING...'); } catch(e){}
            try { this._pronListenBtn.setAttribute('color', '#337799'); } catch(e){}
            this._showPronFeedback('', '#ffffff');
            this._startAudioMeter();

            recognition.onresult = (event) => {
                const transcript = (event.results && event.results[0] && event.results[0][0]) ? event.results[0][0].transcript : '';
                this._handlePronunciationResult(transcript);
            };
            recognition.onerror = (event) => {
                const err = event && event.error;
                if (err === 'not-allowed' || err === 'permission-denied') {
                    this._showPronFeedback('Microphone access denied. Enable it in your browser settings.', '#ffaaaa');
                } else if (err === 'no-speech') {
                    this._showPronFeedback('No speech detected. Press LISTEN and try again.', '#ffddaa');
                } else {
                    this._showPronFeedback('Speech recognition error: ' + (err || 'unknown'), '#ffaaaa');
                }
                try { this._pronListenTxt.setAttribute('value', 'LISTEN'); } catch(e){}
                try { this._pronListenBtn.setAttribute('color', '#225577'); } catch(e){}
                this._stopAudioMeter();
            };
            recognition.onend = () => {
                try { if (this._pronListenTxt) this._pronListenTxt.setAttribute('value', 'LISTEN'); } catch(e){}
                try { if (this._pronListenBtn) this._pronListenBtn.setAttribute('color', '#225577'); } catch(e){}
                this._stopAudioMeter();
            };
            recognition.start();
        } catch(e) {
            console.warn('startListening error', e);
            this._showPronFeedback('Unable to start speech recognition', '#ffaaaa');
            this._stopAudioMeter();
        }
    }
    ,

    // Normalize text for pronunciation comparison (lowercase, no punctuation/contractions, collapsed spaces)
    _normalize: function(text) {
        if (!text) return '';
        let t = String(text).toLowerCase();
        t = t.replace(/[‘’]/g, "'"); // smart quotes -> straight quote
        t = t.replace(/'/g, ''); // drop apostrophes: "ain't" -> "aint"
        t = t.replace(/[^a-z0-9\s]/g, ' '); // strip remaining punctuation
        t = t.replace(/_/g, ' ');
        t = t.replace(/\s+/g, ' ').trim();
        const spokenMap = { 'gonna': 'going to', 'wanna': 'want to' };
        if (spokenMap[t]) t = spokenMap[t];
        return t;
    }
    ,

    // Compare recognized transcript against the expected word (tolerant match: transcript may contain extra words).
    // Retries the same word up to `pronMaxAttempts` times before advancing to the next one.
    _handlePronunciationResult: function(transcript) {
        try {
            if (this._awaitingPronResult) return;
            this._awaitingPronResult = true;

            const idx = this._pronIndex || 0;
            const current = this._pronWords[idx] || {};
            const normTranscript = this._normalize(transcript);
            const normExpected = this._normalize(current.ing);
            const correct = !!(normExpected && normTranscript && normTranscript.includes(normExpected));

            this._pronResults = this._pronResults || [];
            const maxAttempts = (typeof this.data.pronMaxAttempts === 'number' && this.data.pronMaxAttempts > 0) ? this.data.pronMaxAttempts : 2;

            if (correct) {
                this._pronResults.push({ ing: current.ing || '', esp: current.esp || '', correct: true, transcript: transcript || '' });
                this._showPronFeedback(`Correct! (heard: "${transcript}")`, '#aaffaa');
                setTimeout(() => {
                    this._pronIndex = idx + 1;
                    this._awaitingPronResult = false;
                    this._renderPronunciation();
                }, 900);
                return;
            }

            this._pronAttempts = (this._pronAttempts || 0) + 1;
            if (this._pronAttempts < maxAttempts) {
                // attempts remaining: let the user retry the same word
                this._showPronFeedback(`Incorrect (heard: "${transcript || '...'}") — try again (${this._pronAttempts}/${maxAttempts})`, '#ffddaa');
                this._awaitingPronResult = false;
                return;
            }

            // attempts exhausted: record as incorrect and advance
            this._pronResults.push({ ing: current.ing || '', esp: current.esp || '', correct: false, transcript: transcript || '' });
            // agregar al inicio de la lista de errores (más reciente arriba) y refrescar el panel lateral
            this._pronFailedList = this._pronFailedList || [];
            this._pronFailedList.unshift({ ing: current.ing || '', transcript: transcript || '' });
            this._updateFailedSidebar();
            this._showPronFeedback(`Incorrect (heard: "${transcript || '...'}")`, '#ffaaaa');
            setTimeout(() => {
                this._pronIndex = idx + 1;
                this._awaitingPronResult = false;
                this._renderPronunciation();
            }, 900);
        } catch(e) {
            console.warn('handlePronunciationResult error', e);
            this._awaitingPronResult = false;
        }
    }
    ,

    // Show final score, pass/fail vs passingThreshold, and the list of mispronounced words
    _finishPronunciation: function() {
        try {
            const results = this._pronResults || [];
            const total = results.length;
            const correctCount = results.filter(r => r.correct).length;
            const percentage = total ? (correctCount / total) : 0;
            const threshold = (typeof this.data.passingThreshold === 'number') ? this.data.passingThreshold : 0.8;
            const passed = percentage >= threshold;
            const failedWords = results.filter(r => !r.correct).map(r => r.ing).filter(Boolean);
            // Pares "palabra original -> palabra captada por el reconocimiento" para guardar en la BD
            const failedPairs = this._pronFailedList || [];

            const payload = this._payloadForSubmit || {};
            payload.words = this._pronWords;
            payload.archivo = this.data.songTitle || '';
            payload.level = 2;
            payload.correctCount = correctCount;
            payload.total = total;
            payload.percentage = percentage;
            payload.passed = passed;
            payload.failedWords = failedWords;

            console.log('Pronunciation evaluation complete — emitting submit-evaluation with payload:', payload);
            try { this.el.emit('submit-evaluation', payload); } catch(e){}

            try {
                this._saveEvaluation({
                    archivo: payload.archivo,
                    total: correctCount,
                    // registra palabra original -> palabra captada por el reconocimiento, por cada fallo
                    nota_evaluacion: failedPairs.length ? failedPairs.map(w => `${w.ing}->${w.transcript || '?'}`).join(', ') : 'none',
                    terminado: 1,
                    nivel: 2
                });
            } catch(e){}

            this._clearWords();

            const planeW = this.data.width;
            const planeH = this.data.height;
            const pct = Math.round(percentage * 100);

            const summary = document.createElement('a-text');
            summary.setAttribute('value', `${passed ? 'PASSED' : 'FAILED'} — ${correctCount}/${total} correct (${pct}%)`);
            summary.setAttribute('align', 'center');
            summary.setAttribute('color', passed ? '#aaffaa' : '#ffaaaa');
            summary.setAttribute('width', Math.max(1.0, planeW - 0.6));
            summary.setAttribute('position', `0 ${planeH * 0.1} 0.01`);
            summary.setAttribute('wrap-count', '30');
            this._wordsContainer.appendChild(summary);

            const missedText = failedWords.length ? `Missed: ${failedWords.join(', ')}` : 'No mistakes — great job!';
            const missed = document.createElement('a-text');
            missed.setAttribute('value', missedText);
            missed.setAttribute('align', 'center');
            missed.setAttribute('color', '#ffffff');
            missed.setAttribute('width', Math.max(1.0, planeW - 0.6));
            missed.setAttribute('position', `0 ${-planeH * 0.05} 0.01`);
            missed.setAttribute('wrap-count', '40');
            this._wordsContainer.appendChild(missed);
        } catch(e) { console.warn('finishPronunciation error', e); }
    }
    ,

    // Cargar y mostrar evaluaciones previas de la canción actual
    _loadPreviousEvaluations: function() {
        try {
            const data = this.data;
            const songTitle = data.songTitle || '';
            
            // Obtener id de usuario
            const userId = (function(){
                try {
                    return localStorage.getItem('user_id') || null;
                } catch(e) {
                    return null;
                }
            })();

            // Construir URL para obtener evaluaciones
            const archivoParam = encodeURIComponent(songTitle);
            let url = `/A-frame/Proyecto/backend/modelos/evaluaciones/obtener_evaluaciones.php?archivo=${archivoParam}`;
            
            if (userId) {
                url += `&id_usuario=${userId}`;
            }

            console.log('Cargando evaluaciones previas desde:', url);

            // Mostrar indicador de carga
            const loading = document.createElement('a-text');
            loading.setAttribute('value', 'Loading previous evaluations...');
            loading.setAttribute('align', 'center');
            loading.setAttribute('color', '#888888');
            loading.setAttribute('width', this.data.width - 0.4);
            loading.setAttribute('position', '0 0 0');
            loading.setAttribute('wrap-count', '30');
            this._evaluationsContainer.appendChild(loading);

            fetch(url, { credentials: 'same-origin' })
                .then(r => {
                    console.log('Evaluaciones response:', r.status, r.statusText);
                    return r.json();
                })
                .then(json => {
                    console.log('Evaluaciones JSON:', json);
                    
                    // Limpiar indicador de carga
                    while (this._evaluationsContainer.firstChild) {
                        this._evaluationsContainer.removeChild(this._evaluationsContainer.firstChild);
                    }

                    if (!json || json.status !== 'success') {
                        console.warn('No se pudieron cargar las evaluaciones:', json?.message || 'error desconocido');
                        return;
                    }

                    const evaluations = json.evaluations || [];
                    
                    if (evaluations.length === 0) {
                        const noEvals = document.createElement('a-text');
                        noEvals.setAttribute('value', 'No previous evaluations found');
                        noEvals.setAttribute('align', 'center');
                        noEvals.setAttribute('color', '#666666');
                        noEvals.setAttribute('width', this.data.width - 0.4);
                        noEvals.setAttribute('position', '0 0 0');
                        noEvals.setAttribute('wrap-count', '30');
                        this._evaluationsContainer.appendChild(noEvals);
                        return;
                    }

                    // Mostrar título de sección
                    const titleEvals = document.createElement('a-text');
                    titleEvals.setAttribute('value', 'Previous Evaluations:');
                    titleEvals.setAttribute('align', 'center');
                    titleEvals.setAttribute('color', '#ffffff');
                    titleEvals.setAttribute('width', this.data.width - 0.4);
                    titleEvals.setAttribute('position', '0.1 0.3 0');
                    titleEvals.setAttribute('wrap-count', '30');
                    this._evaluationsContainer.appendChild(titleEvals);

                    // Mostrar hasta 3 evaluaciones más recientes
                    const maxDisplay = 3;
                    evaluations.slice(0, maxDisplay).forEach((ev, idx) => {
                        const yPos = 0.05 - (idx * 0.15);
                        
                        // Formatear fecha de forma compacta (sin espacios que causen saltos de línea)
                        let dateStr = '';
                        try {
                            const d = new Date(ev.fecha_hora);
                            // Formato compacto: DD/MM/YYYY-HH:MM:SS (sin espacios)
                            const day = String(d.getDate()).padStart(2, '0');
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const year = d.getFullYear();
                            const hours = String(d.getHours()).padStart(2, '0');
                            const minutes = String(d.getMinutes()).padStart(2, '0');
                            const seconds = String(d.getSeconds()).padStart(2, '0');
                            dateStr = `${day}/${month}/${year}-${hours}:${minutes}:${seconds}`;
                        } catch(e) {
                            dateStr = (ev.fecha_hora || 'N/A').replace(/\s+/g, '-');
                        }

                        // Determinar estado
                        const status = ev.terminado ? 'Completed' : 'Incomplete';
                        const statusColor = ev.terminado ? '#00ff00' : '#ff0000';
                        
                        // Texto de evaluación con id_cancion incluido
                        const nivelLabel = `L${ev.nivel || 1}`;
                        const evalText = `${status} | ${nivelLabel} | SCORE:${ev.total} | LAST WORD:${ev.nota_evaluacion || 'no'} | ${dateStr}`;
                        
                        const evalItem = document.createElement('a-text');
                        evalItem.setAttribute('value', evalText);
                        evalItem.setAttribute('align', 'left');
                        evalItem.setAttribute('color', statusColor);
                        evalItem.setAttribute('width', this.data.width - 0.3);
                        evalItem.setAttribute('position', `-${this.data.width/2 - 0.10} ${yPos} 0`);
                        evalItem.setAttribute('wrap-count', '80');
                        evalItem.setAttribute('scale', '1.5 1.5 1');
                        this._evaluationsContainer.appendChild(evalItem);
                    });

                    if (evaluations.length > maxDisplay) {
                        const more = document.createElement('a-text');
                        more.setAttribute('value', `... and ${evaluations.length - maxDisplay} more`);
                        more.setAttribute('align', 'center');
                        more.setAttribute('color', '#666666');
                        more.setAttribute('width', this.data.width - 0.4);
                        more.setAttribute('position', `0 ${0.05 - (maxDisplay * 0.15)} 0`);
                        more.setAttribute('wrap-count', '30');
                        more.setAttribute('scale', '0.7 0.7 1');
                        this._evaluationsContainer.appendChild(more);
                    }
                })
                .catch(err => {
                    console.error('Error cargando evaluaciones:', err);
                    // Limpiar indicador de carga
                    while (this._evaluationsContainer.firstChild) {
                        this._evaluationsContainer.removeChild(this._evaluationsContainer.firstChild);
                    }
                    
                    const errorTxt = document.createElement('a-text');
                    errorTxt.setAttribute('value', 'Error loading evaluations');
                    errorTxt.setAttribute('align', 'center');
                    errorTxt.setAttribute('color', '#ff6666');
                    errorTxt.setAttribute('width', this.data.width - 0.4);
                    errorTxt.setAttribute('position', '0 0 0');
                    errorTxt.setAttribute('wrap-count', '30');
                    this._evaluationsContainer.appendChild(errorTxt);
                });
        } catch(e) {
            console.error('Error en _loadPreviousEvaluations:', e);
        }
    },
});
