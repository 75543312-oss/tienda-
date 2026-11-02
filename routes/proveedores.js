const router = require('express').Router();
const Proveedor = require('../models/Proveedor');

// GET /api/proveedores
router.get('/', async (req, res, next) => {
  try {
    res.json(await Proveedor.find().sort({ razonSocial: 1 }));
  } catch (e) { next(e); }
});

// GET /api/proveedores/:id
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Proveedor.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(p);
  } catch (e) { next(e); }
});

// POST /api/proveedores
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Proveedor.create(req.body));
  } catch (e) { next(e); }
});

// PUT /api/proveedores/:id
router.put('/:id', async (req, res, next) => {
  try {
    const p = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(p);
  } catch (e) { next(e); }
});

// DELETE /api/proveedores/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const p = await Proveedor.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (e) { next(e); }
});

module.exports = router;
