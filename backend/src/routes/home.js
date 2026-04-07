const router = require('express').Router();
const homeController = require('../controllers/homeController');

router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/usuario/usuario-login.html');
  switch (req.session.user.rol) {
    case 'admin':    return res.redirect('/admin/admin.html');
    case 'empresa':  return res.redirect('/comunidad_recursos/empresa.html');
    default:         return res.redirect('/usuario/usuario.html');
  }
});

module.exports = router;
