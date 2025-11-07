document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const loginForm = document.getElementById("login-form");
  const registroFormEl = document.getElementById('registro-form');
  const pwdInput = document.getElementById('password');
  const pwdConfirmInput = document.getElementById('password-confirm');
  const pwdMsgEl = document.getElementById('password-match-msg');
  const emailInput = document.getElementById('email');
  const emailMsgEl = document.getElementById('email-msg');
  const pwdLenMsgEl = document.getElementById('password-length-msg');

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
      // Validate email format
      if (emailInput) {
        const emailVal = emailInput.value.trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(emailVal)) {
          e.preventDefault();
          if (emailMsgEl) {
            emailMsgEl.textContent = 'Please enter a valid email address';
            emailMsgEl.style.display = 'block';
          }
          if (emailInput) emailInput.classList.add('input-error');
          emailInput.focus();
          return false;
        }
      }
      // Validate password minimum length (>=5)
      if (pwdInput) {
        if (pwdInput.value.length < 5) {
          e.preventDefault();
          if (pwdLenMsgEl) {
            pwdLenMsgEl.textContent = 'Password must be at least 5 characters';
            pwdLenMsgEl.style.display = 'block';
          }
          if (pwdInput) pwdInput.classList.add('input-error');
          pwdInput.focus();
          return false;
        }
      }
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
      // clear other field errors if present
      if (emailMsgEl) { emailMsgEl.textContent = ''; emailMsgEl.style.display = 'none'; }
      if (emailInput) emailInput.classList.remove('input-error');
      if (pwdLenMsgEl) { pwdLenMsgEl.textContent = ''; pwdLenMsgEl.style.display = 'none'; }
      if (pwdInput) pwdInput.classList.remove('input-error');
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
  if (pwdInput) pwdInput.addEventListener('input', () => { checkMatchLive(); checkPasswordLengthLive(); });
  if (pwdConfirmInput) pwdConfirmInput.addEventListener('input', checkMatchLive);

  // Live validation for password length
  function checkPasswordLengthLive() {
    if (!pwdInput || !pwdLenMsgEl) return;
    if (pwdInput.value.length === 0) {
      pwdLenMsgEl.textContent = '';
      pwdLenMsgEl.style.display = 'none';
      pwdInput.classList.remove('input-error');
      return;
    }
    if (pwdInput.value.length < 5) {
      pwdLenMsgEl.textContent = 'Password must be at least 5 characters';
      pwdLenMsgEl.style.display = 'block';
      pwdInput.classList.add('input-error');
    } else {
      pwdLenMsgEl.textContent = '';
      pwdLenMsgEl.style.display = 'none';
      pwdInput.classList.remove('input-error');
    }
  }

  // Live validation for email format
  function checkEmailLive() {
    if (!emailInput || !emailMsgEl) return;
    const v = emailInput.value.trim();
    if (v.length === 0) {
      emailMsgEl.textContent = '';
      emailMsgEl.style.display = 'none';
      emailInput.classList.remove('input-error');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(v)) {
      emailMsgEl.textContent = 'Please enter a valid email address';
      emailMsgEl.style.display = 'block';
      emailInput.classList.add('input-error');
    } else {
      emailMsgEl.textContent = '';
      emailMsgEl.style.display = 'none';
      emailInput.classList.remove('input-error');
    }
  }

  if (emailInput) emailInput.addEventListener('input', checkEmailLive);

  // --- Toggle password visibility (eye icon) for any .eye-toggle elements ---
  function setupEyeToggles() {
    const toggles = document.querySelectorAll('.eye-toggle');
    toggles.forEach((icon) => {
      const targetId = icon.getAttribute('data-target');
      if (!targetId) return;
      const input = document.getElementById(targetId);
      // ensure initial icon state (passwords hidden => show 'eye')
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');

      const toggle = () => {
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      };

      icon.addEventListener('click', (e) => { e.preventDefault(); toggle(); });
      icon.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
  }

  setupEyeToggles();
});