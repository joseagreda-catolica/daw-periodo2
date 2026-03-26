const router = require('express').Router();
const valoracionController = require('../controllers/valoracionController');
const { isAuthenticated, hasRole } = require('../middlewares/auth');

router.get('/', valoracionController.listarEmpresas);
router.get('/:id', valoracionController.verEmpresa);
router.post('/:id', isAuthenticated, hasRole('candidato'), valoracionController.crear);

module.exports = router;
