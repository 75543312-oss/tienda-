/**
 * Índices clave para optimizar las búsquedas más frecuentes.
 *
 * Uso:  mongosh "mongodb://127.0.0.1:27017/tienda_computadoras" database/03_indices.mongosh.js
 */

// PRODUCTOS
db.productos.createIndex({ codigo: 1 }, { unique: true, name: 'ux_codigo_barras' });
db.productos.createIndex({ categoria: 1, marca: 1 }, { name: 'ix_categoria_marca' });
db.productos.createIndex({ nombre: 'text', marca: 'text' }, { name: 'tx_nombre_marca' });
db.productos.createIndex({ stock: 1 }, { name: 'ix_stock' }); // reporte de stock crítico

// CLIENTES
db.clientes.createIndex({ numeroDocumento: 1 }, { unique: true, name: 'ux_documento' });
db.clientes.createIndex({ email: 1 }, { unique: true, sparse: true, name: 'ux_email' });

// PROVEEDORES
db.proveedores.createIndex({ ruc: 1 }, { unique: true, name: 'ux_ruc' });

// VENTAS
db.ventas.createIndex({ numero: 1 }, { unique: true, name: 'ux_numero_comprobante' });
db.ventas.createIndex({ fecha: -1 }, { name: 'ix_fecha' });
db.ventas.createIndex({ cliente: 1, fecha: -1 }, { name: 'ix_cliente_fecha' }); // historial de compras
db.ventas.createIndex({ 'items.producto': 1 }, { name: 'ix_items_producto' });

['productos', 'clientes', 'proveedores', 'ventas'].forEach((c) => {
  print(`\n${c}:`);
  db.getCollection(c).getIndexes().forEach((i) => print(`  - ${i.name}`));
});
