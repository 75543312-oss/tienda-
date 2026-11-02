/**
 * Aggregation Pipelines de reportes (mismas consultas que /api/reportes).
 *
 * Uso:  mongosh "mongodb://127.0.0.1:27017/tienda_computadoras" database/04_agregaciones.mongosh.js
 */

print('\n=== 1. Productos más vendidos ($unwind, $group, $sort, $lookup, $project) ===');
printjson(db.ventas.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.producto', unidadesVendidas: { $sum: '$items.cantidad' }, ingresos: { $sum: '$items.subtotal' } } },
  { $sort: { unidadesVendidas: -1 } },
  { $limit: 5 },
  { $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'producto' } },
  { $unwind: '$producto' },
  { $project: { _id: 0, nombre: '$producto.nombre', marca: '$producto.marca', unidadesVendidas: 1, ingresos: 1 } }
]).toArray());

print('\n=== 2. Ventas por mes ($group por fecha) ===');
printjson(db.ventas.aggregate([
  { $group: {
      _id: { anio: { $year: '$fecha' }, mes: { $month: '$fecha' } },
      comprobantes: { $sum: 1 },
      igv: { $sum: '$igv' },
      totalVendido: { $sum: '$total' } } },
  { $sort: { '_id.anio': 1, '_id.mes': 1 } },
  { $project: { _id: 0, anio: '$_id.anio', mes: '$_id.mes', comprobantes: 1,
      igv: { $round: ['$igv', 2] }, totalVendido: { $round: ['$totalVendido', 2] } } }
]).toArray());

print('\n=== 3. Ingresos por categoría ($unwind, $lookup, $group) ===');
printjson(db.ventas.aggregate([
  { $unwind: '$items' },
  { $lookup: { from: 'productos', localField: 'items.producto', foreignField: '_id', as: 'prod' } },
  { $unwind: '$prod' },
  { $group: { _id: '$prod.categoria', unidades: { $sum: '$items.cantidad' }, ingresos: { $sum: '$items.subtotal' } } },
  { $sort: { ingresos: -1 } }
]).toArray());

print('\n=== 4. Stock crítico (<= 5) con su proveedor ($match, $lookup, $project) ===');
printjson(db.productos.aggregate([
  { $match: { stock: { $lte: 5 } } },
  { $lookup: { from: 'proveedores', localField: 'proveedor', foreignField: '_id', as: 'prov' } },
  { $unwind: '$prov' },
  { $sort: { stock: 1 } },
  { $project: { _id: 0, codigo: 1, nombre: 1, stock: 1, proveedor: '$prov.razonSocial', telefono: '$prov.telefono' } }
]).toArray());

print('\n=== 5. Mejores clientes ($group, $lookup) ===');
printjson(db.ventas.aggregate([
  { $group: { _id: '$cliente', compras: { $sum: 1 }, totalGastado: { $sum: '$total' } } },
  { $sort: { totalGastado: -1 } },
  { $limit: 5 },
  { $lookup: { from: 'clientes', localField: '_id', foreignField: '_id', as: 'cli' } },
  { $unwind: '$cli' },
  { $project: { _id: 0, cliente: '$cli.nombre', documento: '$cli.numeroDocumento', compras: 1, totalGastado: 1 } }
]).toArray());

print('\n=== 6. Comprobante completo (factura) con datos del cliente ($match, $lookup) ===');
printjson(db.ventas.aggregate([
  { $match: { numero: 'F001-000001' } },
  { $lookup: { from: 'clientes', localField: 'cliente', foreignField: '_id', as: 'cliente' } },
  { $unwind: '$cliente' },
  { $project: { _id: 0, numero: 1, fecha: 1, 'cliente.nombre': 1, 'cliente.numeroDocumento': 1,
      items: 1, subtotal: 1, igv: 1, total: 1 } }
]).toArray());
