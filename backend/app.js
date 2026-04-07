const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "daw",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

app.use(flash());

// Variables globales para las vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Rutas
const authRoutes = require('./src/routes/auth');
const homeRoutes = require('./src/routes/home');
const candidatoRoutes = require('./src/routes/candidato');
const empresaRoutes = require('./src/routes/empresa');
const vacanteRoutes = require('./src/routes/vacantes');
const adminRoutes = require('./src/routes/admin');
const recursosRoutes = require('./src/routes/recursos');
const forosRoutes = require('./src/routes/foros');
const valoracionesRoutes = require('./src/routes/valoraciones');
const apiRoutes = require('./src/routes/api');

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/candidato', candidatoRoutes);
app.use('/empresa', empresaRoutes);
app.use('/vacantes', vacanteRoutes);
app.use('/admin', adminRoutes);
app.use('/recursos', recursosRoutes);
app.use('/foros', forosRoutes);
app.use('/valoraciones', valoracionesRoutes);
app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
