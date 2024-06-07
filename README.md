# Login con Node.js, JWT y MySQL

Este proyecto es una aplicación de autenticación construida con Node.js, JWT (JSON Web Tokens) y MySQL. Permite a los usuarios registrarse, iniciar sesión y mantener una sesión activa mediante cookies.

## Características
Registro de usuarios: Los usuarios pueden registrarse con un correo electrónico, nombre de usuario y contraseña.
Inicio de sesión: Los usuarios pueden iniciar sesión y obtener un token JWT.
Autenticación de sesiones: Las sesiones de usuario se manejan mediante cookies que almacenan el token JWT.
Despliegue de base de datos: Uso de MariaDB para la base de datos con docker-compose.
Interfaz de usuario: Plantillas HTML sencillas para las páginas de inicio de sesión y registro.
Requisitos
Node.js v14 o superior
Docker
Docker Compose

## Instalación
Clona el repositorio:

git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
Instala las dependencias del proyecto:

npm install
Configura y despliega los servicios de base de datos:

docker-compose up -d

## Uso
Ejecuta la aplicación:

npm start

Abre tu navegador y accede a http://localhost:3000 para ver la aplicación en funcionamiento.

## Notas

Asegúrate de que Docker y Docker Compose están instalados y en funcionamiento.
Para gestionar la base de datos, puedes utilizar Adminer accediendo a http://localhost:8080.
Usar el contenido del archivo "comandos_tablas.sql" para crear la tabla en el Adminer.