// Configuración para producción separada
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://sistema-cobranza-backend.onrender.com' // URL del backend en Render
  : 'http://localhost:4000'; // URL local para desarrollo

export default API_BASE_URL;
