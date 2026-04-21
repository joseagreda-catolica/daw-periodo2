require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const path = require('path');

const app = express();

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// Validar que SESSION_SECRET esté definido
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET no está definida en .env');
}

// Sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
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

app.get('/', (req, res) => {
  res.redirect('/website/home-website.html');
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


