const mongoose = require('mongoose');

const EgresoSchema = new mongoose.Schema({
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true },
  ruta: { type: mongoose.Schema.Types.ObjectId, ref: 'Ruta', required: true },
  tipo: { type: String, enum: ['Retiro de caja', 'Comisiones', 'Gastos varios'], required: true },
  valor: { type: Number, required: true },
  descripcion: { type: String }, // Solo para "Gastos varios"
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Egreso', EgresoSchema); 