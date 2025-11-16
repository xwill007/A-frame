// Componente de evaluación simple para VR
AFRAME.registerComponent('evaluacion-vr', {
    schema: {
        songTitle: { type: 'string', default: '' },
        artist: { type: 'string', default: '' },
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
        title.setAttribute('value', 'EVALUACIÓN');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#ffffff');
        title.setAttribute('width', data.width);
        title.setAttribute('position', `0 ${data.height/2 - 0.3} 0.01`);
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
        ar.setAttribute('position', `-${data.width/2 - 0.12} ${0.25} 0.01`);
        ar.setAttribute('wrap-count', '30');
        el.appendChild(ar);

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
            btn.setAttribute('position', `${(n-2)*0.7} 0 0`);
            const txt = document.createElement('a-text');
            txt.setAttribute('value', String(n));
            txt.setAttribute('align', 'center');
            txt.setAttribute('color', '#ffffff');
            txt.setAttribute('width', 0.9);
            txt.setAttribute('position', '0 0 0.02');
            btn.appendChild(txt);
            btn.addEventListener('click', () => {
                this._selectNumber(n);
            });
            inputContainer.appendChild(btn);
            this._numButtons.push(btn);
        }

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
        evalText.setAttribute('width', 1.0);
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
            // emitir evento con la evaluación y limpiar
            const payload = { rating: this._selected, songTitle: data.songTitle, artist: data.artist };
            try { el.emit('submit-evaluation', payload); } catch(e){}
            try { if (el.parentNode) el.parentNode.removeChild(el); } catch(e){}
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
});
