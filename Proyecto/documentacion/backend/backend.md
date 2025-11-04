# 🚀 Backend – Aprende inglés con canciones en karaoke en realidad virtual

## 🧾 Informe técnico del plan de trabajo

### 1. Tecnologías principales
- **Backend:** Python con FastAPI
- **Base de datos:** MySQL
- **Control de versiones:** Git y GitHub

### 2. Organización del código
Estructura modular por carpetas:
- **API:** Contiene los endpoints para usuarios, canciones y puntajes.
- **Modelos:** Define las clases principales (`Usuario`, `Cancion`, `Puntaje`).
- **Base de datos:** Configuración y conexión con MySQL.

### 3. Funciones por módulo
- **Módulo de registro:** manejo de usuarios (registro, inicio de sesión).
- **Módulo de canciones:** listado, búsqueda y reproducción.
- **Módulo de evaluación:** almacenamiento y consulta de puntajes.

---

## ⚙️ Módulos y componentes

### 🧠 Módulo 1 – Gestión de usuarios
- Registro e inicio de sesión.
- Validación de datos.
- Almacenamiento en base de datos.
**Componentes:** API `/users` + clase `Usuario`.

### 🎵 Módulo 2 – Catálogo de canciones
- Lista de canciones disponibles.
- Búsqueda por nivel o artista.
- Envío de selección al modo karaoke.
**Componentes:** API `/songs` + clase `Cancion`.

### ⭐ Módulo 3 – Resultados y puntajes
- Mostrar puntaje o progreso.
- Guardar historial del usuario.
**Componentes:** API `/scores` + clase `Puntaje`.

---

## 🚀 Backend – FastAPI

FastAPI manejará las peticiones entre el cliente y el servidor:

- **GET /songs** → devuelve lista de canciones
- **POST /scores** → guarda puntaje
- **POST /users/login** → valida credenciales

**Ventajas:**
- Rápido y moderno
- Compatible con JSON
- Integración fácil con JS y A-Frame
- Permite probar desde `/docs`

---

## 🔍 Pruebas del sistema

- **Pruebas unitarias:** por funciones del backend (FastAPI).
- **Pruebas de integración:** comunicación entre frontend y backend.
- **Pruebas funcionales:** ejecución del flujo completo (inicio, selección de canción, evaluación).

---

📄 **Autor:** Wilber Alberto Vargas Gómez  
📅 **Año:** 2025
