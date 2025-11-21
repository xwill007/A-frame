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
        el.setAttribute('position', data.position);
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

        // Input numérico 1..3: tres botones horizontales
        const inputContainer = document.createElement('a-entity');
        inputContainer.setAttribute('position', `0 -0.15 0.01`);
        el.appendChild(inputContainer);

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
                    // posición inicial para la primera palabra
                    let y = -0.75;
                    words.forEach((w, idx) => {
                        const t = document.createElement('a-text');
                        const esp = w.esp_palabra || '';
                        const ing = w.ing_palabra || '';
                        t.setAttribute('value', `${esp} — ${ing}`);
                        t.setAttribute('align', 'left');
                        t.setAttribute('color', '#ffffff');
                        t.setAttribute('width', data.width - 0.9);
                        t.setAttribute('position', `-${data.width/2 - 0.12} ${y} 0.01`);
                        t.setAttribute('wrap-count', '40');
                        this._wordsContainer.appendChild(t);
                        y -= 0.14;
                    });

                    // anexar las palabras al payload y emitir evento
                    payload.words = words;
                    // incluir 'archivo' en el payload para trazabilidad
                    payload.archivo = data.songTitle || '';
                    console.log('Emitting submit-evaluation with payload:', payload);
                    try { el.emit('submit-evaluation', payload); } catch(e){}
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

        // store refs
        this._titleEl = title;
        this._songEl = st;
        this._artistEl = ar;
        this._bg = bg;
        this._closeBtn = closeBtn;
        this._evalBtn = evalBtn;
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
            if (this.el) this.el.setAttribute('position', this.data.position);
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

    _selectNumber: function(n) {
        this._selected = n;
        // highlight selected button
        (this._numButtons || []).forEach((btn, idx) => {
            try { btn.setAttribute('color', (idx === (n-1)) ? '#ffcc00' : '#666666'); } catch(e){}
        });
    }
    ,

    _clearWords: function() {
        try {
            while (this._wordsContainer && this._wordsContainer.firstChild) {
                this._wordsContainer.removeChild(this._wordsContainer.firstChild);
            }
        } catch(e) {}
    },
});
