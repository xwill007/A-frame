// Funcionalidad para el formulario de login

document.addEventListener('DOMContentLoaded', () => {
  console.log('Formulario de login cargado');

  // Mostrar el formulario de registro al hacer clic en el botón
  const mostrarRegistroBtn = document.getElementById('mostrar-registro');
  mostrarRegistroBtn.addEventListener('click', () => {
    window.location.href = '../formulario-registro/formulario-registro.html';
  });
});
