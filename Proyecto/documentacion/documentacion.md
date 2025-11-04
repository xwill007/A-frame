
# 🎶 Proyecto: Aprende inglés con canciones en karaoke en realidad virtual

## 📘 Diagrama de clases

**Clases principales del sistema:**

### Clase `Usuario`
| Atributo | Tipo | Descripción |
|-----------|------|--------------|
| id_usuario | int | Identificador único |
| nombre | str | Nombre del usuario |
| correo | str | Correo electrónico |
| nivel | str | Nivel de inglés (A1, A2, B1…) |

**Métodos:**
- `registrar()`
- `iniciar_sesion()`
- `actualizar_nivel()`

---

### Clase `Cancion`
| Atributo | Tipo | Descripción |
|-----------|------|--------------|
| id_cancion | int | Identificador único |
| titulo | str | Título de la canción |
| artista | str | Artista o grupo |
| nivel | str | Nivel recomendado |

**Métodos:**
- `listar_canciones()`
- `buscar_por_nivel()`
- `reproducir()`

---

### Clase `Puntaje`
| Atributo | Tipo | Descripción |
|-----------|------|--------------|
| id_puntaje | int | Identificador único |
| id_usuario | int | Usuario asociado |
| id_cancion | int | Canción evaluada |
| puntaje | float | Resultado del karaoke |

**Métodos:**
- `guardar_puntaje()`
- `obtener_historial()`

---

## 🎯 Casos de uso

1. El usuario puede acceder a canciones y ver la traducción en tiempo real.  
2. El sistema registra el progreso del usuario.  
3. El usuario registra sus datos.  
4. El sistema valida las credenciales del usuario para iniciar sesión.  
5. El sistema califica la traducción de las canciones (oral y escrita).  

---

## 👤 Historias de usuario

> Formato: “Como [tipo de usuario], quiero [acción], para [beneficio].”

- **HU1:** Como aprendiz, quiero ver la letra de la canción sincronizada con el audio, para practicar la pronunciación.  
- **HU2:** Como aprendiz, quiero guardar las nuevas palabras, frases y canciones que he aprendido, para registrar mi progreso.  
- **HU3:** Como aprendiz, quiero guardar mi información personal.  
- **HU4:** Como aprendiz, quiero que el sistema valide mis datos para iniciar sesión.  
- **HU5:** Como aprendiz, quiero que el sistema califique mi progreso oral y escrito.  

---

## 🎨 Diseños y prototipos

- Formulario de registro de usuario  
- Formulario de inicio de sesión  
- Lista de canciones  
- Pantalla de karaoke con letra sincronizada  
- Módulo de evaluación (puntaje y progreso)

> 💡 En este apartado se pueden agregar capturas o prototipos realizados en Canva, Figma o A-Frame.

---

## 🧾 Informe técnico del plan de trabajo

### 1. Tecnologías principales
- **Frontend:** HTML5, CSS3, JavaScript y A-Frame (para realidad virtual)
- **Backend:** Python con FastAPI
- **Base de datos:** MySQL
- **Control de versiones:** Git y GitHub

### 2. Organización del código
Estructura modular por carpetas:


### 3. Funciones por módulo
- **Módulo de registro:** formulario de registro con validación.  
- **Módulo de login:** inicio de sesión seguro.  
- **Módulo de canciones:** listado, búsqueda y reproducción.  
- **Módulo de karaoke VR:** interacción con A-Frame y traducción en tiempo real.  
- **Módulo de evaluación:** muestra puntajes y progreso.

### 4. Pruebas
- **Unitarias:** validación de funciones (registro, login, puntaje).  
- **Integración:** conexión frontend–backend (FastAPI).  
- **Funcionales:** verificación del flujo completo del sistema.  

---

## 🧱 Arquitectura del software

El sistema usa una **arquitectura modular Cliente–Servidor**, separando la interfaz (frontend) de la lógica y datos (backend).

### 🧩 Estructura general
- **Frontend:** HTML, CSS, JavaScript, A-Frame  
- **Backend:** FastAPI (Python)  
- **Base de datos:** MySQL  
- **Control de versiones:** GitHub  

**Flujo básico:**
1. El usuario accede al sistema web (desde navegador o visor VR).  
2. Selecciona una canción y entra al modo karaoke VR.  
3. El frontend envía peticiones GET y POST al backend.  
4. El backend gestiona usuarios, canciones y puntajes.  
5. Los datos se guardan y se muestran al usuario.  

---

## ⚙️ Módulos y componentes

### 🧠 Módulo 1 – Gestión de usuarios
- Registro e inicio de sesión.  
- Validación de datos.  
- Almacenamiento en base de datos.  
**Componentes:** formulario HTML + API `/users` + clase `Usuario`.

### 🎵 Módulo 2 – Catálogo de canciones
- Lista de canciones disponibles.  
- Búsqueda por nivel o artista.  
- Envío de selección al modo karaoke.  
**Componentes:** página con listado + API `/songs` + clase `Cancion`.

### 🎤 Módulo 3 – Modo Karaoke VR
- Integración con A-Frame.  
- Reproducción de canción y letra sincronizada.  
- Retroalimentación visual.  
**Componentes:** escena VR + lógica JS + datos del backend.

### ⭐ Módulo 4 – Resultados y puntajes
- Mostrar puntaje o progreso.  
- Guardar historial del usuario.  
**Componentes:** página de resultados + API `/scores` + clase `Puntaje`.

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

## 💻 Frontend – HTML, JavaScript y A-Frame

- Cada módulo tiene su HTML y su archivo JS.  
- Se comunica con el backend usando `fetch()` con métodos GET y POST.  
- A-Frame se utiliza para los entornos 3D/VR del karaoke.  

---

## 🔍 Pruebas del sistema

- **Pruebas unitarias:** por funciones del backend (FastAPI).  
- **Pruebas de integración:** comunicación entre frontend y backend.  
- **Pruebas funcionales:** ejecución del flujo completo (inicio, selección de canción, evaluación).

---

📄 **Autor:** Wilber Alberto Vargas Gómez  
📅 **Año:** 2025  
