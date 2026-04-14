const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'daw',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

app.use(flash());

// Rutas
app.use('/auth', require('./src/routes/auth'));
app.use('/api',  require('./src/routes/api'));

// Error handler centralizado
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const status = err.status || 500;
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ ok: false, message: err.message || 'Error interno del servidor' });
  }
  res.status(status).send('<h1>Error del servidor</h1>');
});

// 404
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
  }
  res.status(404).send('<h1>404 - Página no encontrada</h1>');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
