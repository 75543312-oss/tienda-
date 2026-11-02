/**
 * Validadores JSON Schema a nivel de servidor MongoDB.
 * Crean las colecciones con reglas de validación $jsonSchema.
 *
 * Uso:  mongosh "mongodb://127.0.0.1:27017/tienda_computadoras" database/01_validadores.mongosh.js
 *  (para Atlas usa tu cadena mongodb+srv://... sin subirla al repositorio)
 */

const colecciones = ['proveedores', 'productos', 'clientes', 'ventas'];
colecciones.forEach((c) => db.getCollection(c).drop());

db.createCollection('proveedores', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['ruc', 'razonSocial'],
      properties: {
        ruc: { bsonType: 'string', pattern: '^[0-9]{11}$', description: 'RUC de 11 dígitos' },
        razonSocial: { bsonType: 'string' },
        telefono: { bsonType: 'string' },
        email: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('productos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['codigo', 'nombre', 'marca', 'categoria', 'precio', 'stock', 'proveedor'],
      properties: {
        codigo: { bsonType: 'string', description: 'Código de barras / SKU' },
        nombre: { bsonType: 'string' },
        marca: { bsonType: 'string' },
        categoria: { enum: ['laptop', 'desktop', 'monitor', 'componente', 'periferico', 'accesorio'] },
        precio: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
        stock: { bsonType: 'int', minimum: 0 },
        especificaciones: {
          bsonType: 'object',
          properties: {
            procesador: { bsonType: 'string' },
            ramGB: { bsonType: 'int' },
            almacenamiento: { bsonType: 'string' },
            pantallaPulg: { bsonType: ['double', 'int'] }
          }
        },
        proveedor: { bsonType: 'objectId', description: 'Referencia a proveedores._id' }
      }
    }
  }
});

db.createCollection('clientes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tipoDocumento', 'numeroDocumento', 'nombre'],
      properties: {
        tipoDocumento: { enum: ['DNI', 'RUC'] },
        numeroDocumento: { bsonType: 'string', pattern: '^([0-9]{8}|[0-9]{11})$' },
        nombre: { bsonType: 'string' },
        email: { bsonType: 'string' },
        telefono: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('ventas', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tipoComprobante', 'numero', 'fecha', 'cliente', 'items', 'subtotal', 'igv', 'total', 'metodoPago'],
      properties: {
        tipoComprobante: { enum: ['FACTURA', 'BOLETA'] },
        numero: { bsonType: 'string', pattern: '^[FB]001-[0-9]{6}$' },
        fecha: { bsonType: 'date' },
        cliente: { bsonType: 'objectId', description: 'Referencia a clientes._id' },
        items: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'object',
            required: ['producto', 'nombre', 'precioUnitario', 'cantidad', 'subtotal'],
            properties: {
              producto: { bsonType: 'objectId' },
              nombre: { bsonType: 'string' },
              precioUnitario: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
              cantidad: { bsonType: 'int', minimum: 1 },
              subtotal: { bsonType: ['double', 'int', 'decimal'], minimum: 0 }
            }
          }
        },
        subtotal: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
        igv: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
        total: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
        metodoPago: { enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE'] }
      }
    }
  }
});

print('Colecciones con validadores creadas: ' + db.getCollectionNames().join(', '));
