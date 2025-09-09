const mongoose = require('mongoose');

const RutaSchema = new mongoose.Schema({
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true },
  abierta: { type: Boolean, default: true },
  fechaApertura: { type: Date, default: Date.now },
  fechaCierre: { type: Date, default: null },
  cajaInicial: { type: Number, default: 0 },
  carteraInicial: { type: Number, default: 0 },
  recaudoPretendido: { type: Number, default: 0 }
});

module.exports = mongoose.model('Ruta', RutaSchema);