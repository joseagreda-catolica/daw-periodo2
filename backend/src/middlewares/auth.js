// Verifica que el usuario esté autenticado
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  req.flash('error', 'Debes iniciar sesión para acceder');
  res.redirect('/auth/login');
}

// Verifica que el usuario tenga un rol específico
function hasRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Debes iniciar sesión');
      return res.redirect('/auth/login');
    }
    if (roles.includes(req.session.user.rol)) return next();
    req.flash('error', 'No tienes permisos para acceder a esta sección');
    res.redirect('/');
  };
}

module.exports = { isAuthenticated, hasRole };
