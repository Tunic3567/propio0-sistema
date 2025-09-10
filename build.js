const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando build para producción...');

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // 1. Construir frontend
  console.log('📦 Construyendo frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  // 2. Crear directorio public si no existe
  const publicDir = path.join(__dirname, 'backend', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // 3. Copiar archivos del frontend al backend
  console.log('📋 Copiando archivos del frontend...');
  const distDir = path.join(__dirname, 'frontend', 'dist');
  copyDir(distDir, publicDir);
  
  console.log('✅ Build completado exitosamente!');
  console.log('📁 Archivos copiados a:', publicDir);
  
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}
