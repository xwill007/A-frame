# ✅ Check List: Paso a paso para crear el proyecto

## 📝 Planificación
1. **Definir los requerimientos del proyecto.**
   - Revisar las historias de usuario.
   - Identificar los módulos principales.
2. **Diseñar la arquitectura del sistema.**
   - Frontend: HTML, CSS, JavaScript, A-Frame.
   - Backend: FastAPI (Python).
   - Base de datos: MySQL.
3. **Crear prototipos y diseños.**
   - Formularios (registro, login).
   - Pantallas (lista de canciones, karaoke, evaluación).

---

## 🛠️ Configuración inicial
1. **Configurar el repositorio Git.**
   - Crear un repositorio en GitHub.
   - Clonar el repositorio localmente.
2. **Configurar el entorno de desarrollo.**
   - Instalar Python y FastAPI.
   - Instalar Node.js (si es necesario).
   - Configurar un servidor local (por ejemplo, Live Server o Python HTTP Server).
3. **Crear la estructura de carpetas.**
   - `/frontend`
   - `/backend`
   - `/documentacion`

---

## 🌐 Desarrollo del Frontend
1. **Crear los módulos principales.**
   - Módulo de registro.
   - Módulo de login.
   - Módulo de canciones.
   - Módulo de karaoke VR.
   - Módulo de evaluación.
2. **Implementar las vistas HTML.**
   - Formularios y pantallas.
3. **Estilizar con CSS.**
   - Crear estilos para cada módulo.
4. **Agregar la lógica con JavaScript.**
   - Validaciones de formularios.
   - Comunicación con el backend (fetch API).
5. **Integrar A-Frame para VR.**
   - Crear escenas 3D.
   - Sincronizar letra y audio.

---

## 🚀 Desarrollo del Backend
1. **Configurar FastAPI.**
   - Crear el archivo principal (`main.py`).
   - Configurar rutas y endpoints.
2. **Definir los modelos.**
   - `Usuario`.
   - `Cancion`.
   - `Puntaje`.
3. **Configurar la base de datos.**
   - Crear la conexión con MySQL.
   - Crear las tablas necesarias.
4. **Implementar los endpoints.**
   - `/users` para usuarios.
   - `/songs` para canciones.
   - `/scores` para puntajes.
5. **Probar el backend.**
   - Usar la documentación interactiva de FastAPI (`/docs`).

---

## 🔗 Integración
1. **Conectar el frontend con el backend.**
   - Usar `fetch()` para consumir los endpoints.
2. **Probar el flujo completo.**
   - Registro e inicio de sesión.
   - Selección y reproducción de canciones.
   - Evaluación y guardado de puntajes.

---

## 🧪 Pruebas
1. **Pruebas unitarias.**
   - Validar funciones individuales (registro, login, puntaje).
2. **Pruebas de integración.**
   - Verificar la comunicación entre frontend y backend.
3. **Pruebas funcionales.**
   - Simular el flujo completo del sistema.

---

## 📦 Despliegue
1. **Configurar el servidor de producción.**
   - Backend: Desplegar FastAPI (por ejemplo, en Heroku o AWS).
   - Frontend: Subir a un servidor web (por ejemplo, Netlify o Vercel).
2. **Configurar la base de datos en producción.**
   - Crear la base de datos en el servidor.
   - Migrar los datos iniciales.
3. **Realizar pruebas finales.**
   - Verificar el sistema en producción.

---

## 📄 Documentación
1. **Actualizar la documentación del proyecto.**
   - Agregar capturas de pantalla y ejemplos.
   - Documentar la API (endpoints, parámetros, respuestas).
2. **Crear un manual de usuario.**
   - Instrucciones para usar el sistema.

---

📄 **Autor:** Wilber Alberto Vargas Gómez  
📅 **Año:** 2025
