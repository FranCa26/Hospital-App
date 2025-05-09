### Sistema de Gestión Hospital App

## Autor y Contacto
```
👨‍💻 Desarrollador: Franco Catania Dev
🔗 LinkedIn: www.linkedin.com/in/franco-catania-698183283
🐙 GitHub: github.com/FranCa26
📞 Contacto: +54 9 381 3920095 (Argentina)
```
## Descripción General

Este sistema de gestión hospitalaria es una solución full-stack escalable, diseñada para optimizar la programación de citas médicas, gestión de historiales clínicos y disponibilidad de médicos. Utiliza Node.js y Express en el backend, y React con Tailwind CSS en el frontend, asegurando un rendimiento robusto y una experiencia de usuario moderna. Su arquitectura modular permite fácil expansión y personalización. Además, incluye funciones de gestión de usuarios y notificaciones automáticas para mejorar la eficiencia en la atención.

### Estructura del Proyecto
```
Hospital App/
├── hospital-backend/
│                     # Contiene el código del backend (Node.js, Express)
└── hospital-frontend/
                    # Contiene el código del frontend (React, Tailwind CSS)
```
### Estructura del Backend
```
hospital-backend/
├── config/
│   └── db.js                  # Configuración de base de datos
├── controllers/               # Lógica de negocio
│   ├── authController.js      # Lógica de autenticación
│   ├── categoriaController.js # Gestión de categorías
│   ├── disponibilidadController.js # Disponibilidad de médicos
│   ├── historialMedicoController.js # Historiales médicos
│   ├── notificacionController.js # Notificaciones
│   ├── servicioController.js  # Gestión de servicios
│   ├── turnoController.js     # Citas médicas
│   └── usuarioController.js   # Gestión de usuarios
├── database/                  # Scripts de base de datos
│   └── hospital_turnos.sql        # Script de creación de la BDD
├── modelos/                   # Modelos de base de datos
│   ├── ArchivoHistorial.js    # Archivos de historial médico
│   ├── Categoria.js           # Categorías
│   ├── DisponibilidadMedico.js # Disponibilidad de médicos
│   ├── ExcepcionDisponibilidad.js # Excepciones de disponibilidad
│   ├── HistorialMedico.js     # Historiales médicos
│   ├── Notificacion.js        # Notificaciones
│   ├── Servicio.js            # Servicios
│   ├── Turno.js               # Citas
│   ├── Usuario.js             # Usuarios
│   └── Index.js               # centraliza los modelos
├── routes/                    # Rutas de la API
│   ├── authRoutes.js          # Rutas de autenticación
│   ├── categoriaRoutes.js     # Rutas de categorías
│   ├── disponibilidadRoutes.js # Rutas de disponibilidad
│   ├── historialMedicoRoutes.js # Rutas de historiales médicos
│   ├── notificacionRoutes.js  # Rutas de notificaciones
│   ├── servicioRoutes.js      # Rutas de servicios
│   ├── turnoRoutes.js         # Rutas de citas
│   ├── usuarioRoutes.js       # Rutas de usuarios
│   └── indexRoutes.js         # centraliza las rutas
├── upload/                    # Subida de archivos
│   └── historiales/           # Archivos de historiales médicos
├── utils/                     # Funciones de utilidad
│   ├── auth.js                # Utilidades de autenticación
│   ├── email.js               # Servicio de email con nodemailer
│   ├── notificaciones.js      # Servicio de notificaciones
│   ├── sync.js                # Sincronización de base de datos
│   └── turnoUtils.js          # Utilidades de citas
├── server.js                  # Punto de entrada principal
└── package.json               # Dependencias
```
### Estructura del Frontend
```
hospital-frontend/
├── public/
│   └── favicon.svg           # Ícono del sitio
├── index.html                # Plantilla base del proyecto
├── package.json              # Dependencias y scripts
├── vite.config.js            # Configuración de Vite
├── tailwind.config.js        # Configuración de Tailwind CSS
├── postcss.config.js         # Configuración de PostCSS
└── src/
    ├── main.jsx              # Punto de entrada React
    ├── App.jsx               # Rutas principales
    ├── index.css             # Estilos globales
    ├── components/           # Componentes reutilizables
    │   └── UI/               # Inputs, botones, modales, etc.
    ├── contexts/             # Manejo global del estado
    │   ├── AuthContext.jsx   # Autenticación y sesión
    │   └── ToastContext.jsx  # Notificaciones tipo toast
    ├── layouts/              # Estructuras visuales base
    │   ├── DashboardLayout.jsx # Layout privado
    │   ├── PublicLayout.jsx  # Layout público
    │   └── components/       # Subcomponentes de layouts
    ├── pages/                # Vistas de cada sección
    │   ├── calendario/       # Agenda médica
    │   ├── turnos/           # Gestión de turnos
    │   ├── dashboard/        # Estadísticas generales
    │   ├── categorias/       # Clasificación médica
    │   ├── medicos/          # CRUD de médicos
    │   ├── notificaciones/   # Alertas y mensajes
    │   ├── servicios/        # Servicios hospitalarios
    │   ├── usuarios/         # Gestión de usuarios
    │   └── public/           # Páginas públicas
    └── services/             # Conexión con la API
```
## Tecnologías Utilizadas

### Backend

- **Node.js**: Entorno de ejecución para JavaScript
- **Express**: Framework para aplicaciones web
- **Sequelize**: ORM para base de datos
- **MariaDB**: Sistema de gestión de base de datos
- **JWT**: Autenticación basada en tokens
- **Nodemailer**: Servicio de envío de emails
- **Multer**: Manejo de subida de archivos
- **PDFKit**: Generación de documentos PDF
- **Morgan**: Registro de logs de solicitudes HTTP
- **Cors**: Middleware para habilitar el Intercambio de Recursos de Origen Cruzado
- **Cookie-parser**: Middleware para analizar cookies en las solicitudes
- **Dotenv**: Módulo para cargar variables de entorno desde un archivo .env

### Frontend

- **React 19**: Biblioteca para construir interfaces de usuario
- **Vite**: Bundler de frontend ultrarrápido
- **Tailwind CSS 4**: Framework de utilidades CSS
- **Axios**: Cliente HTTP para conectar con la API
- **Framer Motion**: Librería para animaciones
- **Lucide React**: Íconos SVG modernos


## Características Principales

### Gestión de Citas

- Crear, actualizar y cancelar citas
- Verificar disponibilidad de médicos
- Enviar notificaciones por email y en la aplicación


### Gestión de Usuarios

- Registro y autenticación de usuarios
- Control de acceso basado en roles
- Gestión de perfiles


### Historiales Médicos

- Crear y gestionar historiales médicos de pacientes
- Subir y descargar archivos relacionados
- Generar informes en PDF


### Disponibilidad de Médicos

- Configurar horarios semanales regulares
- Añadir excepciones para fechas específicas
- Verificación automática de disponibilidad al programar citas


### Notificaciones

- Notificaciones en la aplicación
- Notificaciones por email
- Recordatorios de citas

### Endpoints de la API

## Autenticación 🔐

| Método | Endpoint           | Descripción               | Requiere Autenticación |
| ------ | ------------------ | ------------------------- | ---------------------- |
| POST   | /api/auth/login    | Inicio de sesión          | No                     |
| POST   | /api/auth/registro | Registro de usuario       | No                     |
| POST   | /api/auth/logout   | Cierre de sesión          | Sí                     |
| GET    | /api/auth/perfil   | Obtener perfil de usuario | Sí                     |

## Usuarios 👤

| Método | Endpoint              | Descripción                | Requiere Autenticación | Rol                 |
| ------ | --------------------- | -------------------------- | ---------------------- | ------------------- |
| GET    | /api/usuarios         | Obtener todos los usuarios | Sí                     | Admin / Médico      |
| GET    | /api/usuarios/medicos | Obtener todos los médicos  | Sí                     | Cualquiera          |
| GET    | /api/usuarios/\:id    | Obtener usuario por ID     | Sí                     | Cualquiera          |
| POST   | /api/usuarios         | Crear nuevo usuario        | Sí                     | Admin               |
| PUT    | /api/usuarios/\:id    | Actualizar usuario         | Sí                     | Propietario / Admin |
| DELETE | /api/usuarios/\:id    | Eliminar usuario           | Sí                     | Admin               |

## Citas (Turnos) 📅

| Método | Endpoint         | Descripción             | Requiere Autenticación |
| ------ | ---------------- | ----------------------- | ---------------------- |
| GET    | /api/turnos      | Obtener todas las citas | Sí                     |
| GET    | /api/turnos/\:id | Obtener cita por ID     | Sí                     |
| POST   | /api/turnos      | Crear nueva cita        | Sí                     |
| PUT    | /api/turnos/\:id | Actualizar cita         | Sí                     |
| DELETE | /api/turnos/\:id | Cancelar cita           | Sí                     |

## Categorías 🗂️ 

| Método | Endpoint             | Descripción                  | Requiere Autenticación | Rol        |
| ------ | -------------------- | ---------------------------- | ---------------------- | ---------- |
| GET    | /api/categorias      | Obtener todas las categorías | No                     | Cualquiera |
| GET    | /api/categorias/\:id | Obtener categoría por ID     | No                     | Cualquiera |
| POST   | /api/categorias      | Crear nueva categoría        | Sí                     | Admin      |
| PUT    | /api/categorias/\:id | Actualizar categoría         | Sí                     | Admin      |
| DELETE | /api/categorias/\:id | Eliminar categoría           | Sí                     | Admin      |

## Servicios 🛎️

| Método | Endpoint            | Descripción                 | Requiere Autenticación | Rol        |
| ------ | ------------------- | --------------------------- | ---------------------- | ---------- |
| GET    | /api/servicios      | Obtener todos los servicios | No                     | Cualquiera |
| GET    | /api/servicios/\:id | Obtener servicio por ID     | No                     | Cualquiera |
| POST   | /api/servicios      | Crear nuevo servicio        | Sí                     | Admin      |
| PUT    | /api/servicios/\:id | Actualizar servicio         | Sí                     | Admin      |
| DELETE | /api/servicios/\:id | Eliminar servicio           | Sí                     | Admin      |

## Disponibilidad de Médicos 🕒

| Método |                      Endpoint                            |               Descripción                | Requiere Aut |      Rol       |
| ------ | ---------------------------------------------------------| -----------------------------------------| -------------| ---------------|
| GET    | /api/disponibilidad/medico/:medicoId                     | Obtener la disponibilidad de un médico   |      No      | Cualquiera     |
| POST   | /api/disponibilidad/medico/:medicoId                     | Configurar la disponibilidad de un médico|      Sí      | Médico / Admin |
| GET    | /api/disponibilidad/medico/:medicoId/excepciones         | Obtener las excepciones de un médico     |      No      | Cualquiera     |
| POST   | /api/disponibilidad/medico/:medicoId/excepciones         | Crear una excepción de disponibilidad    |      Sí      | Médico / Admin |
| DELETE | /api/disponibilidad/excepciones/:id                      | Eliminar una excepción                   |      Sí      | Médico / Admin |
| GET    | /api/disponibilidad/medico/:medicoId/horarios-disponibles| Obtener los horarios disponibles         |      No      | Cualquiera     |



## Historiales Médicos 🏥 

| Método | Endpoint                                     | Descripción                        | Requiere Autenticación | Rol                       |
| ------ | -------------------------------------------- | ---------------------------------- | ---------------------- | ------------------------- |
| GET    | /api/historial-medico                        | Obtener todos los historiales      | Sí                     | Admin / Médico            |
| GET    | /api/historial-medico/medico/\:medicoId      | Obtener historiales por médico     | Sí                     | Médico / Admin            |
| GET    | /api/historial-medico/paciente/\:pacienteId  | Obtener historiales de un paciente | Sí                     | Médico / Admin / Paciente |
| GET    | /api/historial-medico/registro/\:id          | Obtener historial por ID           | Sí                     | Médico / Admin / Paciente |
| GET    | /api/historial-medico/registro/\:id/pdf      | Generar PDF del historial          | Sí                     | Médico / Admin / Paciente |
| POST   | /api/historial-medico                        | Crear nuevo historial              | Sí                     | Médico                    |
| PUT    | /api/historial-medico/\:id                   | Actualizar historial               | Sí                     | Médico                    |
| DELETE | /api/historial-medico/\:id                   | Eliminar historial                 | Sí                     | Médico                    |
| POST   | /api/historial-medico/\:historialId/archivos | Subir archivo al historial         | Sí                     | Médico                    |
| GET    | /api/historial-medico/archivos/\:archivoId   | Descargar archivo del historial    | Sí                     | Médico / Admin / Paciente |


## Notificaciones 🔔 

| Método | Endpoint                       | Descripción              | Requiere Autenticación |
| ------ | ------------------------------ | ------------------------ | ---------------------- |
| GET    | /api/notificaciones            | Obtener notificaciones   | Sí                     |
| PUT    | /api/notificaciones/leer-todas | Marcar todas como leídas | Sí                     |
| PUT    | /api/notificaciones/\:id       | Marcar como leída        | Sí                     |
| DELETE | /api/notificaciones/\:id       | Eliminar notificación    | Sí                     |

## Variables de Entorno

El sistema requiere la configuración de las siguientes variables de entorno para su correcto funcionamiento. Estas variables deben definirse en un archivo `.env` en la raíz del proyecto.

### Configuración del Servidor

| Variable      | Descripción                | Ejemplo                 |
| ------------- | -------------------------- | ----------------------- |
| `PORT`        | Puerto del servidor        | `3000`                  |
| `NODE_ENV`    | Entorno de ejecución       | `development`           |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |


### Configuración de la Base de Datos

| Variable      | Descripción                    | Ejemplo           |
| ------------- | ------------------------------ | ----------------- |
| `DB_HOST`     | Host de la base de datos       | `localhost`       |
| `DB_PORT`     | Puerto de la base de datos     | `3306`            |
| `DB_NAME`     | Nombre de la base de datos     | `hospital_turnos` |
| `DB_USER`     | Usuario de la base de datos    | `root`            |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu_contraseña`   |

### Configuración de JWT

| Variable     | Descripción                              | Ejemplo             |
| ------------ | ---------------------------------------- | ------------------- |
| `JWT_SECRET` | Clave secreta para firmar los JWT tokens | `clave_secreta_jwt` |


### Configuración de Correo Electrónico

| Variable         | Descripción                         | Ejemplo               |
| ---------------- | ----------------------------------- | --------------------- |
| `EMAIL_HOST`     | Servidor SMTP para envío de correos | `smtp.gmail.com`      |
| `EMAIL_PORT`     | Puerto del servidor SMTP            | `587`                 |
| `EMAIL_SECURE`   | Usar conexión segura (SSL/TLS)      | `false`               |
| `EMAIL_USER`     | Dirección de correo electrónico     | `tu_email@gmail.com`  |
| `EMAIL_PASSWORD` | Contraseña o clave de aplicación    | `tu_contraseña_email` |

### Ejemplo de archivo .env

# Configuración del servidor
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hospital_turnos
DB_USER=root
DB_PASSWORD=tu_contraseña

# Configuración de JWT
JWT_SECRET=clave_secreta_jwt

# Configuración de correo electrónico
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_email


### Autor y Contacto
```
👨‍💻 Desarrollador: Franco Catania Dev
🔗 LinkedIn: www.linkedin.com/in/franco-catania-698183283
🐙 GitHub: github.com/FranCa26
📞 Contacto: +54 9 381 3920095 (Argentina)
```
¡Esperamos que esta documentación te haya sido útil! Si te gusta el proyecto, no olvides dejar una estrella ⭐ en GitHub.
