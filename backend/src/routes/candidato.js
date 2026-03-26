const router = require('express').Router();
const candidatoController = require('../controllers/candidatoController');
const { isAuthenticated, hasRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(isAuthenticated, hasRole('candidato'));

router.get('/perfil', candidatoController.perfil);
router.post('/perfil', candidatoController.actualizarPerfil);
router.post('/cv', upload.single('cv'), candidatoController.subirCV);
router.get('/solicitudes', candidatoController.solicitudes);
router.get('/alertas', candidatoController.alertas);
router.post('/alertas', candidatoController.crearAlerta);
router.delete('/alertas/:id', candidatoController.eliminarAlerta);

module.exports = router;
