// Configuración de la API
// En producción, la API estará en el mismo servidor
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // En producción, usar rutas relativas
  : 'http://localhost:4000'; // En desarrollo, usar la URL completa

export default API_BASE_URL;
