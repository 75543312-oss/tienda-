const router = require('express').Router();
const Producto = require('../models/Producto');

// GET /api/productos  (filtros opcionales: ?marca=Lenovo&q=ryzen)
router.get('/', async (req, res, next) => {
  try {
    const filtro = {};
    if (req.query.marca) filtro.marca = req.query.marca;
    if (req.query.q) filtro.$text = { $search: req.query.q };
    const productos = await Producto.find(filtro)
      .populate('proveedor', 'razonSocial ruc')
      .sort({ nombre: 1 });
    res.json(productos);
  } catch (e) { next(e); }
});

// GET /api/productos/categoria/:tipo   (laptop, desktop, monitor, ...)
router.get('/categoria/:tipo', async (req, res, next) => {
  try {
    const productos = await Producto.find({ categoria: req.params.tipo }).sort({ precio: 1 });
    res.json(productos);
  } catch (e) { next(e); }
});

// GET /api/productos/codigo/:codigo   (búsqueda por código de barras)
router.get('/codigo/:codigo', async (req, res, next) => {
  try {
    const p = await Producto.findOne({ codigo: req.params.codigo });
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(p);
  } catch (e) { next(e); }
});

// GET /api/productos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Producto.findById(req.params.id).populate('proveedor', 'razonSocial ruc');
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(p);
  } catch (e) { next(e); }
});

// POST /api/productos
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Producto.create(req.body));
  } catch (e) { next(e); }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const p = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(p);
  } catch (e) { next(e); }
});

// DELETE /api/productos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const p = await Producto.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (e) { next(e); }
});

module.exports = router;
