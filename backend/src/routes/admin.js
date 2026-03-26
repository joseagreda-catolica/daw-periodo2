const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, hasRole } = require('../middlewares/auth');

router.use(isAuthenticated, hasRole('admin'));

router.get('/', adminController.dashboard);
router.get('/usuarios', adminController.usuarios);
router.put('/usuarios/:id/toggle', adminController.toggleUsuario);
router.get('/empresas', adminController.empresas);
router.get('/vacantes', adminController.vacantes);
router.get('/moderacion', adminController.moderacion);
router.put('/valoraciones/:id/aprobar', adminController.aprobarValoracion);
router.delete('/valoraciones/:id', adminController.rechazarValoracion);
router.get('/recursos', adminController.recursos);
router.post('/recursos', adminController.crearRecurso);
router.delete('/recursos/:id', adminController.eliminarRecurso);

module.exports = router;
