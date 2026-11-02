const router = require('express').Router();
const Cliente = require('../models/Cliente');
const Venta = require('../models/Venta');

// GET /api/clientes
router.get('/', async (req, res, next) => {
  try {
    res.json(await Cliente.find().sort({ nombre: 1 }));
  } catch (e) { next(e); }
});

// GET /api/clientes/documento/:numero   (DNI o RUC)
router.get('/documento/:numero', async (req, res, next) => {
  try {
    const c = await Cliente.findOne({ numeroDocumento: req.params.numero });
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(c);
  } catch (e) { next(e); }
});

// GET /api/clientes/:id/compras   (historial de compras del cliente)
router.get('/:id/compras', async (req, res, next) => {
  try {
    const ventas = await Venta.find({ cliente: req.params.id })
      .select('tipoComprobante numero fecha items total')
      .sort({ fecha: -1 });
    res.json(ventas);
  } catch (e) { next(e); }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const c = await Cliente.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(c);
  } catch (e) { next(e); }
});

// POST /api/clientes
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Cliente.create(req.body));
  } catch (e) { next(e); }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res, next) => {
  try {
    const c = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(c);
  } catch (e) { next(e); }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const c = await Cliente.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (e) { next(e); }
});

module.exports = router;
