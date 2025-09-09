const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  cc: { type: String, required: true },
  apodo: { type: String },
  celular: { type: String, required: true },
  direccion: { type: String, required: true },
  direccion_residencial: { type: String, required: true },
  valor: { type: Number, required: true },
  dias: { type: Number, required: true },
  fecha: { type: String, required: true },
  total: { type: Number, required: true },
  parcela: { type: Number, required: true },
  saldo_inicial: { type: Number, required: true },
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true },
  renovado: { type: Boolean, default: false },
  cancelado: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema); 