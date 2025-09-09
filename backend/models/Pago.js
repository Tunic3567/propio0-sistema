const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  tipo: { type: String, enum: ['Parcela', 'Abono', 'No pago'], required: true },
  producto: { type: String },
  valor: { type: Number, required: true },
  numParcelas: { type: Number },
  observaciones: { type: String },
  saldo_antes: { type: Number },
  saldo_despues: { type: Number },
  fecha: { type: Date, default: Date.now },
  cubierto: { type: Boolean, default: false },
  ruta: { type: mongoose.Schema.Types.ObjectId, ref: 'Ruta', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Pago', PagoSchema); 