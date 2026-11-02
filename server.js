require('dotenv').config();
const express = require('express');
const conectarDB = require('./config/db');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ api: 'Tienda de Computadoras - Facturación', estado: 'ok' });
});

app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/reportes', require('./routes/reportes'));

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Registro duplicado', campo: err.keyValue });
  }
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 3000;

conectarDB()
  .then(() => app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
