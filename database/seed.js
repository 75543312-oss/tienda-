/**
 * Seeder con Mongoose: borra y vuelve a cargar las 4 colecciones
 * desde los archivos JSON de /database/data y crea los índices.
 *
 * Uso:  npm run seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const conectarDB = require('../config/db');

const Proveedor = require('../models/Proveedor');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Venta = require('../models/Venta');

const { EJSON } = mongoose.mongo.BSON;

// Lee el JSON en formato Extended JSON ($oid, $date) -> ObjectId / Date
const leer = (archivo) =>
  EJSON.parse(fs.readFileSync(path.join(__dirname, 'data', archivo), 'utf8'));

async function seed() {
  await conectarDB();

  const colecciones = [
    [Proveedor, 'proveedores.json'],
    [Producto, 'productos.json'],
    [Cliente, 'clientes.json'],
    [Venta, 'ventas.json']
  ];

  for (const [Modelo, archivo] of colecciones) {
    await Modelo.deleteMany({});
    const docs = await Modelo.insertMany(leer(archivo));
    await Modelo.syncIndexes(); // crea los índices definidos en el modelo
    console.log(`${Modelo.collection.name}: ${docs.length} documentos insertados`);
  }

  await mongoose.disconnect();
  console.log('Seeding completado.');
}

seed().catch(async (err) => {
  console.error('Error en el seeding:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
