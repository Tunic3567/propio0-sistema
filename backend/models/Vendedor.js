const mongoose = require('mongoose');

const VendedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true }, // Guardar hash, no texto plano
  pais: { type: String },
  ciudad: { type: String },
  fechaAperturaRuta: { type: Date, default: null }, // Nueva propiedad para la fecha de apertura de la ruta
  codigoVinculacion: { type: String, required: true }
  // En el futuro: clientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' }]
}, { timestamps: true });

module.exports = mongoose.model('Vendedor', VendedorSchema); 