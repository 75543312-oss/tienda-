const { Schema, model } = require('mongoose');

// Proveedor: solo lo necesario para identificarlo y contactarlo.
const proveedorSchema = new Schema(
  {
    ruc: { type: String, required: true, unique: true, match: /^\d{11}$/ },
    razonSocial: { type: String, required: true, trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true }
  },
  { collection: 'proveedores', timestamps: true, versionKey: false }
);

module.exports = model('Proveedor', proveedorSchema);
