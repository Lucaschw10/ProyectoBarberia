const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);