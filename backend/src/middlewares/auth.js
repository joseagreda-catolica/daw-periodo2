// Verifica que el usuario esté autenticado
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/usuario/usuario-login.html');
}

// Verifica que el usuario tenga un rol específico
function hasRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/usuario/usuario-login.html');
    }
    if (roles.includes(req.session.user.rol)) return next();
    req.flash('error', 'No tienes permisos para acceder a esta sección');
    res.redirect('/');
  };
}

// API helpers: responden JSON en lugar de redirigir
function apiAuth(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ ok: false, message: 'No autenticado' });
}

function apiRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user)
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    if (roles.includes(req.session.user.rol)) return next();
    res.status(403).json({ ok: false, message: 'Sin permisos' });
  };
}

module.exports = { isAuthenticated, hasRole, apiAuth, apiRole };
