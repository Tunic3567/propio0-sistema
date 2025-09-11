// Configuración correcta para Vite
const API_BASE_URL = import.meta.env.PROD 
  ? '' // En producción, usar rutas relativas
  : 'http://localhost:4000'; // En desarrollo, usar la URL completa

export default API_BASE_URL;
