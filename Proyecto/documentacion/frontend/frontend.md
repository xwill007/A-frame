# 🎨 Frontend – Aprende inglés con canciones en karaoke en realidad virtual

## 🧾 Informe técnico del plan de trabajo

### 1. Tecnologías principales
- **Frontend:** HTML5, CSS3, JavaScript y A-Frame (para realidad virtual)

### 2. Organización del código
Estructura modular por carpetas:
- **2D:** Contiene las vistas y componentes para la versión 2D.
- **VR:** Contiene las vistas y componentes para la versión de realidad virtual.

### 3. Funciones por módulo
- **Módulo de registro:** formulario de registro con validación.
- **Módulo de login:** inicio de sesión seguro.
- **Módulo de canciones:** listado, búsqueda y reproducción.
- **Módulo de karaoke VR:** interacción con A-Frame y traducción en tiempo real.
- **Módulo de evaluación:** muestra puntajes y progreso.

---

## ⚙️ Módulos y componentes

### 🧠 Módulo 1 – Gestión de usuarios
- Registro e inicio de sesión.
- Validación de datos.
**Componentes:** formulario HTML + lógica JS.

### 🎵 Módulo 2 – Catálogo de canciones
- Lista de canciones disponibles.
- Búsqueda por nivel o artista.
- Envío de selección al modo karaoke.
**Componentes:** página con listado.

### 🎤 Módulo 3 – Modo Karaoke VR
- Integración con A-Frame.
- Reproducción de canción y letra sincronizada.
- Retroalimentación visual.
**Componentes:** escena VR + lógica JS.

### ⭐ Módulo 4 – Resultados y puntajes
- Mostrar puntaje o progreso.
- Guardar historial del usuario.
**Componentes:** página de resultados.

---

## 💻 Frontend – HTML, JavaScript y A-Frame

- Cada módulo tiene su HTML y su archivo JS.
- Se comunica con el backend usando `fetch()` con métodos GET y POST.
- A-Frame se utiliza para los entornos 3D/VR del karaoke.

---

## 🔍 Pruebas del sistema

- **Pruebas de integración:** comunicación entre frontend y backend.
- **Pruebas funcionales:** ejecución del flujo completo (inicio, selección de canción, evaluación).

---

📄 **Autor:** Wilber Alberto Vargas Gómez  
📅 **Año:** 2025
