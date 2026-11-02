const { Schema, model } = require('mongoose');

const CATEGORIAS = ['laptop', 'desktop', 'monitor', 'componente', 'periferico', 'accesorio'];

// Especificaciones técnicas EMBEBIDAS: solo se leen junto con el producto
// y cambian según la categoría, por eso van como subdocumento.
const especificacionesSchema = new Schema(
  {
    procesador: String,
    ramGB: Number,
    almacenamiento: String,
    pantallaPulg: Number
  },
  { _id: false }
);

const productoSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true }, // código de barras / SKU
    nombre: { type: String, required: true, trim: true },
    marca: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIAS },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    especificaciones: especificacionesSchema,
    // REFERENCIA: un proveedor abastece muchos productos.
    proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor', required: true }
  },
  { collection: 'productos', timestamps: true, versionKey: false }
);

productoSchema.index({ categoria: 1, marca: 1 });
productoSchema.index({ nombre: 'text', marca: 'text' });

module.exports = model('Producto', productoSchema);
module.exports.CATEGORIAS = CATEGORIAS;
