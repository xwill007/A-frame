document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const loginForm = document.getElementById("login-form");
  const registroFormEl = document.getElementById('registro-form');
  const pwdInput = document.getElementById('password');
  const pwdConfirmInput = document.getElementById('password-confirm');
  const pwdMsgEl = document.getElementById('password-match-msg');

  btnLogin.addEventListener("click", () => {
    loginForm.style.display = "block";
    btnLogin.style.display = "none"; // Hide the button after showing the form
  });

  // Mostrar mensaje del servidor si se reciben parámetros ?status=&message=
  try {
    const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const message = params.get('message');
  const emailParam = params.get('email');
  const passwordParam = params.get('password');
  const nombreParam = params.get('nombre');
    const msgDiv = document.getElementById('server-message');
    if (status && message && msgDiv) {
      // Asegurarse de no acumular clases previas y mostrar el mensaje con animación
      msgDiv.textContent = message;
      msgDiv.classList.remove('success', 'error', 'visible');
      msgDiv.classList.add(status === 'success' ? 'success' : 'error');
      // accesibilidad: status para notificaciones exitosas, alert para errores
      msgDiv.setAttribute('role', status === 'success' ? 'status' : 'alert');
      msgDiv.style.display = 'block';
      // Forzar un frame para que la transición .visible se aplique
      requestAnimationFrame(() => {
        msgDiv.classList.add('visible');
      });
  // Si es success y vienen email+password, prellenar el formulario de login y mostrarlo
  if (status === 'success' && emailParam && passwordParam) {
        // Prefill login inputs
        const loginUser = document.getElementById('user');
        const loginPass = document.getElementById('password-login');
        if (loginUser) loginUser.value = decodeURIComponent(emailParam);
        if (loginPass) loginPass.value = decodeURIComponent(passwordParam);

        // Mostrar el formulario de login y ocultar el de registro
        const loginFormEl = document.getElementById('login-form');
        const registroForm = document.getElementById('registro-form');
        const registroContainer = registroForm ? registroForm.closest('.formulario-registro') : null;
        if (registroContainer) registroContainer.style.display = 'none';
        if (loginFormEl) loginFormEl.style.display = 'block';
        // Ocultar el botón 'I AM REGISTERED' si existe
        const btnLoginEl = document.getElementById('btn-login');
        if (btnLoginEl) btnLoginEl.style.display = 'none';
      }
      // Si es error por email duplicado, prellenar el formulario de registro para no perder datos
      if (status === 'error' && message && message.toLowerCase().includes('email ya existe')) {
        const regName = document.getElementById('nombre');
        const regEmail = document.getElementById('email');
        if (nombreParam && regName) regName.value = decodeURIComponent(nombreParam);
        if (emailParam && regEmail) regEmail.value = decodeURIComponent(emailParam);
        // Asegurarse de que el formulario de registro esté visible (no se ocultó)
        const registroForm = document.getElementById('registro-form');
        const registroContainer = registroForm ? registroForm.closest('.formulario-registro') : null;
        if (registroContainer) registroContainer.style.display = 'block';
      }
      // Quitar los parámetros de la URL para evitar que el mensaje reaparezca al recargar
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // Auto-ocultar después de X ms (6s). Cancelar previo si existe.
      const HIDE_MS = 6000;
      if (window._serverMessageTimeout) {
        clearTimeout(window._serverMessageTimeout);
      }
      window._serverMessageTimeout = setTimeout(() => {
        msgDiv.classList.remove('visible');
        // después de la transición, esconder completamente
        setTimeout(() => {
          msgDiv.style.display = 'none';
          msgDiv.classList.remove('success', 'error');
          msgDiv.removeAttribute('role');
        }, 260);
      }, HIDE_MS);
    }
  } catch (e) {
    // si algo falla, no rompemos la página
    console.error('Error al mostrar mensaje del servidor:', e);
  }

  // --- Client-side validation: ensure password and confirm match before submitting registro form ---
  function showPasswordError(text) {
    if (pwdMsgEl) {
      pwdMsgEl.textContent = text;
      pwdMsgEl.style.display = 'block';
    }
    if (pwdInput) pwdInput.classList.add('input-error');
    if (pwdConfirmInput) pwdConfirmInput.classList.add('input-error');
  }

  function clearPasswordError() {
    if (pwdMsgEl) {
      pwdMsgEl.textContent = '';
      pwdMsgEl.style.display = 'none';
    }
    if (pwdInput) pwdInput.classList.remove('input-error');
    if (pwdConfirmInput) pwdConfirmInput.classList.remove('input-error');
  }

  if (registroFormEl) {
    registroFormEl.addEventListener('submit', (e) => {
      // Only validate if both fields exist
      if (pwdInput && pwdConfirmInput) {
        if (pwdInput.value !== pwdConfirmInput.value) {
          e.preventDefault();
          showPasswordError('Passwords do not match');
          pwdConfirmInput.focus();
          return false;
        }
      }
      // allow submit
      clearPasswordError();
      return true;
    });
  }

  // Live validation to give immediate feedback
  function checkMatchLive() {
    if (!pwdInput || !pwdConfirmInput) return;
    if (pwdConfirmInput.value.length === 0) {
      clearPasswordError();
      return;
    }
    if (pwdInput.value === pwdConfirmInput.value) {
      clearPasswordError();
    } else {
      showPasswordError('Passwords do not match');
    }
  }

  if (pwdInput) pwdInput.addEventListener('input', checkMatchLive);
  if (pwdConfirmInput) pwdConfirmInput.addEventListener('input', checkMatchLive);
});