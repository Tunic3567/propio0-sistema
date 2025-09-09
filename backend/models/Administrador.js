const mongoose = require('mongoose');

const AdministradorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, default: 'admin' },
  codigoVinculacion: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Administrador', AdministradorSchema); 