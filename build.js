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
  // 1. Instalar dependencias del frontend
  console.log('📦 Instalando dependencias del frontend...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  // 2. Construir frontend
  console.log('🔨 Construyendo frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  // 3. Verificar que el directorio dist existe
  const distDir = path.join(__dirname, 'frontend', 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('El directorio dist no se creó correctamente');
  }
  
  // 4. Crear directorio public si no existe
  const publicDir = path.join(__dirname, 'backend', 'public');
  if (fs.existsSync(publicDir)) {
    console.log('🗑️ Limpiando directorio public existente...');
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });
  
  // 5. Copiar archivos del frontend al backend
  console.log('📋 Copiando archivos del frontend...');
  copyDir(distDir, publicDir);
  
  // 6. Verificar que los archivos se copiaron
  const files = fs.readdirSync(publicDir);
  console.log('📁 Archivos copiados:', files);
  
  if (files.length === 0) {
    throw new Error('No se copiaron archivos al directorio public');
  }
  
  console.log('✅ Build completado exitosamente!');
  console.log('📁 Archivos copiados a:', publicDir);
  
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
