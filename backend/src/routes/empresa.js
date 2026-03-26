const router = require('express').Router();
const empresaController = require('../controllers/empresaController');
const { isAuthenticated, hasRole } = require('../middlewares/auth');

router.use(isAuthenticated, hasRole('empresa'));

router.get('/panel', empresaController.panel);
router.post('/perfil', empresaController.editarPerfil);
router.get('/nueva-vacante', empresaController.nuevaVacante);
router.post('/vacantes', empresaController.crearVacante);
router.get('/vacantes/:id/editar', empresaController.editarVacante);
router.put('/vacantes/:id', empresaController.actualizarVacante);
router.get('/vacantes/:id/postulaciones', empresaController.postulaciones);
router.put('/postulaciones/:id', empresaController.actualizarPostulacion);

module.exports = router;
