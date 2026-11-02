const router = require('express').Router();
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

const IGV = 0.18;
const redondear = (n) => Math.round(n * 100) / 100;

// Genera el siguiente correlativo: F001-000001 (factura) o B001-000001 (boleta)
async function siguienteNumero(tipo) {
  const serie = tipo === 'FACTURA' ? 'F001' : 'B001';
  const ultima = await Venta.findOne({ numero: new RegExp(`^${serie}-`) }).sort({ numero: -1 });
  const n = ultima ? parseInt(ultima.numero.split('-')[1], 10) + 1 : 1;
  return `${serie}-${String(n).padStart(6, '0')}`;
}

// GET /api/ventas
router.get('/', async (req, res, next) => {
  try {
    const ventas = await Venta.find()
      .populate('cliente', 'nombre tipoDocumento numeroDocumento')
      .sort({ fecha: -1 });
    res.json(ventas);
  } catch (e) { next(e); }
});

// GET /api/ventas/numero/:numero   (buscar comprobante, ej. F001-000001)
router.get('/numero/:numero', async (req, res, next) => {
  try {
    const v = await Venta.findOne({ numero: req.params.numero }).populate('cliente');
    if (!v) return res.status(404).json({ error: 'Comprobante no encontrado' });
    res.json(v);
  } catch (e) { next(e); }
});

// GET /api/ventas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const v = await Venta.findById(req.params.id).populate('cliente');
    if (!v) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(v);
  } catch (e) { next(e); }
});

/*
 POST /api/ventas  -> registra la factura/boleta
 Body:
 {
   "cliente": "<ObjectId>",
   "metodoPago": "TARJETA",
   "items": [ { "producto": "<ObjectId>", "cantidad": 1 } ]
 }
 - El precio se toma de la BD (no del cliente).
 - Si el cliente tiene RUC se emite FACTURA, si tiene DNI, BOLETA.
 - Se descuenta stock; si algún producto no alcanza, se revierte.
*/
router.post('/', async (req, res, next) => {
  const descontados = [];
  try {
    const { cliente: clienteId, metodoPago, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener al menos un ítem' });
    }

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const detalle = [];
    for (const it of items) {
      const cantidad = Number(it.cantidad);
      if (!Number.isInteger(cantidad) || cantidad < 1) {
        throw Object.assign(new Error('Cantidad inválida'), { status: 400 });
      }
      // Descuento atómico: solo actualiza si hay stock suficiente
      const prod = await Producto.findOneAndUpdate(
        { _id: it.producto, stock: { $gte: cantidad } },
        { $inc: { stock: -cantidad } },
        { new: true }
      );
      if (!prod) {
        throw Object.assign(new Error(`Producto ${it.producto} inexistente o sin stock suficiente`), { status: 400 });
      }
      descontados.push({ id: prod._id, cantidad });
      detalle.push({
        producto: prod._id,
        nombre: prod.nombre,
        precioUnitario: prod.precio,
        cantidad,
        subtotal: redondear(prod.precio * cantidad)
      });
    }

    // Precios de venta incluyen IGV: se desglosa base imponible e impuesto
    const total = redondear(detalle.reduce((s, d) => s + d.subtotal, 0));
    const subtotal = redondear(total / (1 + IGV));
    const igv = redondear(total - subtotal);
    const tipoComprobante = cliente.tipoDocumento === 'RUC' ? 'FACTURA' : 'BOLETA';

    const venta = await Venta.create({
      tipoComprobante,
      numero: await siguienteNumero(tipoComprobante),
      cliente: cliente._id,
      items: detalle,
      subtotal,
      igv,
      total,
      metodoPago
    });
    res.status(201).json(venta);
  } catch (e) {
    // Revertir stock si algo falló
    for (const d of descontados) {
      await Producto.updateOne({ _id: d.id }, { $inc: { stock: d.cantidad } });
    }
    next(e);
  }
});

module.exports = router;
