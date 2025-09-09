const fs = require('fs');
const path = require('path');

// Archivos a actualizar
const files = [
  'frontend/src/views/AdminDashboard.vue',
  'frontend/src/views/VendedorDashboard.vue',
  'frontend/src/views/CrearCliente.vue',
  'frontend/src/views/Pagos.vue',
  'frontend/src/views/Registros.vue',
  'frontend/src/views/PagosAdmin.vue',
  'frontend/src/views/Egresos.vue',
  'frontend/src/views/EgresosAdmin.vue',
  'frontend/src/views/Ingresos.vue',
  'frontend/src/views/IngresosAdmin.vue'
];

// Función para actualizar un archivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Agregar import si no existe
    if (!content.includes("import API_BASE_URL from '../config/api.js'") && !content.includes("import API_BASE_URL from './config/api.js'")) {
      const importLine = "import API_BASE_URL from '../config/api.js'";
      const scriptIndex = content.indexOf('<script setup>');
      if (scriptIndex !== -1) {
        content = content.slice(0, scriptIndex + 15) + '\n' + importLine + '\n' + content.slice(scriptIndex + 15);
      }
    }
    
    // Reemplazar URLs hardcodeadas
    content = content.replace(/http:\/\/localhost:4000/g, '${API_BASE_URL}');
    content = content.replace(/'http:\/\/localhost:4000/g, '`${API_BASE_URL}');
    content = content.replace(/"http:\/\/localhost:4000/g, '`${API_BASE_URL}');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Actualizado: ${filePath}`);
  } catch (error) {
    console.log(`❌ Error en ${filePath}:`, error.message);
  }
}

// Actualizar todos los archivos
console.log('🔄 Actualizando URLs de API...');
files.forEach(updateFile);
console.log('✅ Actualización completada!');
