// Funcionalidad para el index en 2D

document.addEventListener('DOMContentLoaded', () => {
  console.log('Página cargada: Aprende inglés con canciones');

  // Cambiar el color del botón al pasar el mouse
  const boton = document.querySelector('.boton');
  boton.addEventListener('mouseover', () => {
    boton.style.backgroundColor = '#4CAF50';
    boton.style.color = '#FFFFFF';
  });

  boton.addEventListener('mouseout', () => {
    boton.style.backgroundColor = '';
    boton.style.color = '';
  });

  // Mostrar un mensaje al hacer clic en el botón
  boton.addEventListener('click', () => {
    alert('¡Disfruta aprendiendo inglés con tus canciones favoritas!');
  });

  // Ajustar el iframe dinámicamente
  const iframe = document.getElementById('formulario-iframe');
  iframe.onload = () => {
    console.log('Formulario cargado correctamente');
  };

  // Eliminar las barras de desplazamiento múltiples
  // Ocultar las barras de navegación en todos los iframes
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    iframe.style.cssText = 'overflow: hidden; scrollbar-width: none; -ms-overflow-style: none;';
    iframe.onload = () => {
      if (iframe.contentWindow && iframe.contentWindow.document.body) {
        iframe.contentWindow.document.body.style.overflow = 'hidden';
      }
    };
  });

  // Mostrar el formulario de registro y ocultar el de login
  const loginIframe = document.getElementById('login-iframe');
  const registroIframe = document.getElementById('formulario-iframe');

  const mostrarRegistroBtn = document.getElementById('mostrar-registro');
  mostrarRegistroBtn.addEventListener('click', () => {
    loginIframe.style.display = 'none';
    registroIframe.style.display = 'block';
  });
});
