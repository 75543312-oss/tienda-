const { Schema, model } = require('mongoose');

// Ítem de la factura EMBEBIDO: guarda una "foto" del producto al momento
// de la venta (nombre y precio), así la factura no cambia si luego
// se modifica el precio del producto. También guarda la REFERENCIA
// al producto para poder hacer $lookup en los reportes.
const itemSchema = new Schema(
  {
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
    nombre: { type: String, required: true },
    precioUnitario: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const ventaSchema = new Schema(
  {
    tipoComprobante: { type: String, required: true, enum: ['FACTURA', 'BOLETA'] },
    numero: { type: String, required: true, unique: true }, // F001-000001 / B001-000001
    fecha: { type: Date, required: true, default: Date.now },
    // REFERENCIA al cliente (historial de compras se obtiene consultando ventas).
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    igv: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    metodoPago: { type: String, required: true, enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE'] }
  },
  { collection: 'ventas', timestamps: true, versionKey: false }
);

ventaSchema.index({ fecha: -1 });
ventaSchema.index({ cliente: 1, fecha: -1 });

module.exports = model('Venta', ventaSchema);
