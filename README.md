# 🍃 Sistema de Venta de Computadoras — MongoDB

Base de datos orientada a documentos y API REST para la **facturación de una tienda de computadoras**: registro de proveedores, productos, clientes y ventas (facturas y boletas), con reportes mediante *Aggregation Pipeline*.

## 🛠️ Tecnologías

| Herramienta | Versión |
|---|---|
| MongoDB Server | 7.0 o superior (local o MongoDB Atlas) |
| Mongoose | 8.x |
| Node.js | 18 o superior |
| Express | 4.x |

## 📁 Estructura

```
tienda-computadoras-mongodb/
├── config/db.js                    # Conexión a MongoDB (lee MONGODB_URI)
├── models/                         # Modelos Mongoose (esquemas)
│   ├── Proveedor.js
│   ├── Producto.js                 # especificaciones embebidas + ref a proveedor
│   ├── Cliente.js
│   └── Venta.js                    # ítems embebidos + ref a cliente/producto
├── routes/                         # Endpoints REST
│   ├── proveedores.js
│   ├── productos.js
│   ├── clientes.js
│   ├── ventas.js                   # registra facturas/boletas y descuenta stock
│   └── reportes.js                 # Aggregation Pipelines
├── database/
│   ├── data/*.json                 # Datos de prueba (Extended JSON, para mongoimport)
│   ├── 01_validadores.mongosh.js   # Validadores $jsonSchema
│   ├── 02_importar.sh              # Importación masiva con mongoimport
│   ├── 03_indices.mongosh.js       # Índices
│   ├── 04_agregaciones.mongosh.js  # Reportes en mongosh
│   └── seed.js                     # Seeder con Mongoose (npm run seed)
├── docs/modelo-documentos.md       # Diagrama + justificación embeber/referenciar
├── server.js
├── .env.example
└── .gitignore
```

## 🗃️ Colecciones (solo campos necesarios)

- **proveedores**: `ruc`, `razonSocial`, `telefono`, `email`
- **productos**: `codigo`, `nombre`, `marca`, `categoria`, `precio`, `stock`, `especificaciones` *(embebido)*, `proveedor` *(ObjectId)*
- **clientes**: `tipoDocumento` (DNI/RUC), `numeroDocumento`, `nombre`, `email`, `telefono`
- **ventas**: `tipoComprobante`, `numero`, `fecha`, `cliente` *(ObjectId)*, `items[]` *(embebidos)*, `subtotal`, `igv`, `total`, `metodoPago`

Diagrama y justificación completos en [`docs/modelo-documentos.md`](docs/modelo-documentos.md).

## 🚀 Instalación y conexión

```bash
git clone https://github.com/<tu-usuario>/tienda-computadoras-mongodb.git
cd tienda-computadoras-mongodb
npm install
cp .env.example .env        # en Windows: copy .env.example .env
```

Edita `.env` con tu conexión:

```env
# MongoDB local
MONGODB_URI=mongodb://127.0.0.1:27017/tienda_computadoras

# o MongoDB Atlas
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/tienda_computadoras
```

> ⚠️ El archivo `.env` está en `.gitignore`: la contraseña de Atlas **nunca** se sube al repositorio.

## 🌱 Cargar datos de prueba

**Opción A — Seeder con Mongoose (recomendado):**
```bash
npm run seed
```

**Opción B — Con las herramientas de MongoDB (validadores + mongoimport + índices):**
```bash
mongosh "mongodb://127.0.0.1:27017/tienda_computadoras" database/01_validadores.mongosh.js
bash database/02_importar.sh
mongosh "mongodb://127.0.0.1:27017/tienda_computadoras" database/03_indices.mongosh.js
```
(En MongoDB Compass también puedes usar *Add Data → Import JSON* con los archivos de `database/data`.)

Datos incluidos: 3 proveedores, 11 productos, 5 clientes y 8 ventas (3 facturas y 5 boletas).

## ▶️ Ejecutar la API

```bash
npm start            # http://localhost:3000
```

## 🔗 Endpoints

### Proveedores
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/proveedores` | Listar |
| GET | `/api/proveedores/:id` | Obtener uno |
| POST | `/api/proveedores` | Crear |
| PUT | `/api/proveedores/:id` | Actualizar |
| DELETE | `/api/proveedores/:id` | Eliminar |

### Productos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Listar (filtros `?marca=HP`, `?q=ryzen`) |
| GET | `/api/productos/categoria/:tipo` | Por categoría (`laptop`, `monitor`, ...) |
| GET | `/api/productos/codigo/:codigo` | Por código de barras |
| GET | `/api/productos/:id` | Obtener uno (con proveedor) |
| POST | `/api/productos` | Crear |
| PUT | `/api/productos/:id` | Actualizar |
| DELETE | `/api/productos/:id` | Eliminar |

### Clientes
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes` | Listar |
| GET | `/api/clientes/documento/:numero` | Buscar por DNI/RUC |
| GET | `/api/clientes/:id/compras` | Historial de compras |
| GET | `/api/clientes/:id` | Obtener uno |
| POST | `/api/clientes` | Crear |
| PUT | `/api/clientes/:id` | Actualizar |
| DELETE | `/api/clientes/:id` | Eliminar |

### Ventas (facturación)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/ventas` | Listar comprobantes |
| GET | `/api/ventas/numero/:numero` | Buscar por número (ej. `F001-000001`) |
| GET | `/api/ventas/:id` | Obtener uno |
| POST | `/api/ventas` | Registrar venta (factura o boleta) |

Ejemplo `POST /api/ventas`:
```json
{
  "cliente": "ccc000000000000000000003",
  "metodoPago": "TARJETA",
  "items": [
    { "producto": "bbb000000000000000000001", "cantidad": 1 },
    { "producto": "bbb000000000000000000010", "cantidad": 2 }
  ]
}
```
La API toma los precios de la BD, calcula subtotal, IGV (18 %) y total, emite **FACTURA** si el cliente tiene RUC o **BOLETA** si tiene DNI, asigna el correlativo y descuenta el stock.

### Reportes (Aggregation Pipeline)
| Ruta | Etapas usadas | Descripción |
|---|---|---|
| `GET /api/reportes/mas-vendidos?limite=5` | `$unwind` `$group` `$sort` `$limit` `$lookup` `$project` | Productos más vendidos |
| `GET /api/reportes/ventas-por-mes` | `$group` `$sort` `$project` | Comprobantes, IGV y total por mes |
| `GET /api/reportes/ventas-por-categoria` | `$unwind` `$lookup` `$group` | Ingresos por categoría |
| `GET /api/reportes/stock-critico?minimo=5` | `$match` `$lookup` `$project` | Productos por reabastecer y su proveedor |
| `GET /api/reportes/mejores-clientes` | `$group` `$lookup` `$project` | Clientes que más compran |

Ejemplo de pipeline (productos más vendidos):
```js
db.ventas.aggregate([
  { $unwind: "$items" },
  { $group: { _id: "$items.producto", unidadesVendidas: { $sum: "$items.cantidad" }, ingresos: { $sum: "$items.subtotal" } } },
  { $sort: { unidadesVendidas: -1 } },
  { $limit: 5 },
  { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "producto" } },
  { $unwind: "$producto" },
  { $project: { _id: 0, nombre: "$producto.nombre", marca: "$producto.marca", unidadesVendidas: 1, ingresos: 1 } }
])
```
Todas las agregaciones también están en `database/04_agregaciones.mongosh.js` para ejecutarlas directamente en `mongosh`.

## 📇 Índices

| Colección | Índice | Uso |
|---|---|---|
| productos | `codigo` (único) | Búsqueda por código de barras |
| productos | `categoria + marca` | Filtro por categoría |
| productos | texto `nombre + marca` | Búsqueda `?q=` |
| productos | `stock` | Reporte de stock crítico |
| clientes | `numeroDocumento` (único), `email` (único, sparse) | Búsqueda por DNI/RUC o correo |
| proveedores | `ruc` (único) | |
| ventas | `numero` (único), `fecha`, `cliente + fecha`, `items.producto` | Comprobantes, reportes e historial |
