const router = require('express').Router();
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// GET /api/reportes/mas-vendidos?limite=5
// $unwind + $group + $sort + $lookup + $project
router.get('/mas-vendidos', async (req, res, next) => {
  try {
    const limite = parseInt(req.query.limite, 10) || 5;
    const data = await Venta.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.producto',
          unidadesVendidas: { $sum: '$items.cantidad' },
          ingresos: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { unidadesVendidas: -1 } },
      { $limit: limite },
      { $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'producto' } },
      { $unwind: '$producto' },
      {
        $project: {
          _id: 0,
          codigo: '$producto.codigo',
          nombre: '$producto.nombre',
          marca: '$producto.marca',
          categoria: '$producto.categoria',
          unidadesVendidas: 1,
          ingresos: { $round: ['$ingresos', 2] }
        }
      }
    ]);
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/reportes/ventas-por-mes
// $group por año/mes: cantidad de comprobantes, IGV y total facturado
router.get('/ventas-por-mes', async (req, res, next) => {
  try {
    const data = await Venta.aggregate([
      {
        $group: {
          _id: { anio: { $year: '$fecha' }, mes: { $month: '$fecha' } },
          comprobantes: { $sum: 1 },
          igv: { $sum: '$igv' },
          totalVendido: { $sum: '$total' }
        }
      },
      { $sort: { '_id.anio': 1, '_id.mes': 1 } },
      {
        $project: {
          _id: 0,
          anio: '$_id.anio',
          mes: '$_id.mes',
          comprobantes: 1,
          igv: { $round: ['$igv', 2] },
          totalVendido: { $round: ['$totalVendido', 2] }
        }
      }
    ]);
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/reportes/ventas-por-categoria
// $unwind + $lookup a productos + $group por categoría
router.get('/ventas-por-categoria', async (req, res, next) => {
  try {
    const data = await Venta.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'productos', localField: 'items.producto', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      {
        $group: {
          _id: '$prod.categoria',
          unidades: { $sum: '$items.cantidad' },
          ingresos: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { ingresos: -1 } },
      { $project: { _id: 0, categoria: '$_id', unidades: 1, ingresos: { $round: ['$ingresos', 2] } } }
    ]);
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/reportes/stock-critico?minimo=5
// $match + $lookup a proveedores (para saber a quién reabastecer)
router.get('/stock-critico', async (req, res, next) => {
  try {
    const minimo = parseInt(req.query.minimo, 10) || 5;
    const data = await Producto.aggregate([
      { $match: { stock: { $lte: minimo } } },
      { $lookup: { from: 'proveedores', localField: 'proveedor', foreignField: '_id', as: 'prov' } },
      { $unwind: '$prov' },
      { $sort: { stock: 1 } },
      {
        $project: {
          _id: 0,
          codigo: 1,
          nombre: 1,
          marca: 1,
          stock: 1,
          proveedor: '$prov.razonSocial',
          telefonoProveedor: '$prov.telefono'
        }
      }
    ]);
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/reportes/mejores-clientes
// $group por cliente + $lookup a clientes
router.get('/mejores-clientes', async (req, res, next) => {
  try {
    const data = await Venta.aggregate([
      { $group: { _id: '$cliente', compras: { $sum: 1 }, totalGastado: { $sum: '$total' } } },
      { $sort: { totalGastado: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'clientes', localField: '_id', foreignField: '_id', as: 'cli' } },
      { $unwind: '$cli' },
      {
        $project: {
          _id: 0,
          cliente: '$cli.nombre',
          documento: '$cli.numeroDocumento',
          compras: 1,
          totalGastado: { $round: ['$totalGastado', 2] }
        }
      }
    ]);
    res.json(data);
  } catch (e) { next(e); }
});

module.exports = router;
