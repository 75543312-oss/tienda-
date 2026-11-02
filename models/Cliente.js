const { Schema, model } = require('mongoose');

// Cliente: DNI (8 dígitos) para boleta o RUC (11 dígitos) para factura.
const clienteSchema = new Schema(
  {
    tipoDocumento: { type: String, required: true, enum: ['DNI', 'RUC'] },
    numeroDocumento: { type: String, required: true, unique: true, match: /^(\d{8}|\d{11})$/ },
    nombre: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    telefono: { type: String, trim: true }
  },
  { collection: 'clientes', timestamps: true, versionKey: false }
);

module.exports = model('Cliente', clienteSchema);
