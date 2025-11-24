// Componente de evaluación simple para VR
AFRAME.registerComponent('evaluacion-vr', {
    schema: {
        songTitle: { type: 'string', default: '' },
        artist: { type: 'string', default: '' },
        phraseId: { type: 'int', default: 1 },
        width: { type: 'number', default: 3.2 },
        height: { type: 'number', default: 2.2 },
        position: { type: 'string', default: '-2 2.5 3' },
        visible: { type: 'boolean', default: true }
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

        // mensaje de instrucción
        const instr = document.createElement('a-text');
        instr.setAttribute('value', 'Select a Difficulty Rating (1-3):');
        instr.setAttribute('align', 'center');
        instr.setAttribute('color', '#ffffff');
        instr.setAttribute('width', data.width - 0.9);
        instr.setAttribute('position', `0 ${0.2} 0.01`);
        instr.setAttribute('wrap-count', '30');
        el.appendChild(instr);

    // store reference so we can hide it when quiz starts
    this._instr = instr;

        // Input numérico 1..3: tres botones horizontales
        const inputContainer = document.createElement('a-entity');
        inputContainer.setAttribute('position', `0 -0.15 0.01`);
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
        inputLabel.setAttribute('value', '1:EASY, 2:NORMAL, 3:HARD');
        inputLabel.setAttribute('align', 'center');
        inputLabel.setAttribute('color', '#ffffff');
        inputLabel.setAttribute('width', data.width - 0.9);
        inputLabel.setAttribute('position', `0 -0.0 0.01`);
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
            // si no hay selección, indicar visualmente
            if (!this._selected) {
                // flash the button red briefly
                const prev = evalBtn.getAttribute('color');
                evalBtn.setAttribute('color', '#aa2222');
                setTimeout(() => evalBtn.setAttribute('color', prev), 300);
                return;
            }
            // cuando hay selección: obtener palabras desde el backend y mostrarlas
            const payload = { rating: this._selected, songTitle: data.songTitle, artist: data.artist };
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

                    // Start interactive multiple-choice quiz using fetched words
                    // map to simple form [{esp, ing}]
                    const quizWords = words.map(w => ({ esp: w.esp_palabra || '', ing: w.ing_palabra || '' }));
                    // store quiz state and begin
                    this._startQuiz(quizWords, payload);
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

            const doPost = (idUsuario) => {
                const body = { id_usuario: idUsuario || 0, archivo: archivo, total: total, nota_evaluacion: nota, terminado: terminado };
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
    },

    _selectNumber: function(n) {
        this._selected = n;
        // highlight selected button
        (this._numButtons || []).forEach((btn, idx) => {
            try { btn.setAttribute('color', (idx === (n-1)) ? '#ffcc00' : '#666666'); } catch(e){}
        });
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
                        try { this._saveEvaluation({ archivo: payload.archivo, total: this._quizWords.length, nota_evaluacion: '', terminado: 1 }); } catch(e){}

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
                    try { this._saveEvaluation({ archivo: this.data.songTitle || '', total: idx, nota_evaluacion: option, terminado: 0 }); } catch(e){}
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
        } catch(e) {}
    },
});
