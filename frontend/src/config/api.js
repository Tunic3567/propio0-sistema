const API_BASE_URL = import.meta.env.PROD 
  ? 'https://sistema-cobranza-backend.onrender.com'
  : 'http://localhost:4000';

export default API_BASE_URL;