const mongoose = require('mongoose');

const ingresoSchema = new mongoose.Schema({
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true },
  ruta: { type: mongoose.Schema.Types.ObjectId, ref: 'Ruta', required: true },
  tipo: { type: String, enum: ['Base', 'Otros ingresos'], required: true },
  valor: { type: Number, required: true },
  descripcion: { type: String },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ingreso', ingresoSchema); 