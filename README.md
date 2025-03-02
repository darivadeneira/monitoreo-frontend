# Sistema de Monitoreo - Frontend

Este proyecto es el frontend de la aplicación de monitoreo de recursos desarrollado con React + Vite. EStá diseñado específicamente para visualizar y analizar los recursos de máquinas Linux.

## Requisitos

- Node.js (versión más reciente recomendada)
- npm (versión más reciente recomendada)
- React (versión más reciente)
- Vite (versión más reciente)

## Instalación

1. Clone el repositorio
2. Instale las dependencias:

```bash
npm install
```

3. Configure las variables de entorno copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

4. Edite el archivo `.env` con la configuración correcta para conectarse al backend

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Información adicional

Este proyecto utiliza:

- [React](https://reactjs.org/) - Biblioteca JavaScript para construir interfaces de usuario
- [Vite](https://vitejs.dev/) - Herramienta de compilación que proporciona una experiencia de desarrollo más rápida

Plugins oficiales disponibles:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
