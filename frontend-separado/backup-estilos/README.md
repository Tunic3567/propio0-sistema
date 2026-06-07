# Copia de seguridad – estilos anteriores

Esta carpeta contiene una **copia de seguridad** de los archivos del proyecto antes de aplicar el estilo ejecutivo (paleta slate + teal).

## Contenido

- **src/** – Código fuente completo (vistas, componentes, estilos, i18n, etc.)
- **tailwind.config.cjs** – Configuración de Tailwind anterior
- **index.html** – HTML de entrada
- **postcss.config.cjs** – Configuración de PostCSS

## Cómo restaurar

Para volver al estado anterior:

1. Sustituir la carpeta `src` del proyecto por `backup-estilos/src`.
2. Copiar `tailwind.config.cjs` e `index.html` desde `backup-estilos/` a la raíz del proyecto.
3. Reinstalar dependencias si hace falta: `npm install`

## Fecha del backup

Generado antes de aplicar el rediseño con paleta ejecutiva (slate + teal, tipografía Inter, sombras y bordes unificados).
