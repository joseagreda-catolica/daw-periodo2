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

module.exports = { isAuthenticated, hasRole };
