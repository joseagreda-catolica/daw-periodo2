const router = require('express').Router();
const foroController = require('../controllers/foroController');
const { isAuthenticated } = require('../middlewares/auth');

router.get('/', foroController.listar);
router.get('/:id', foroController.verTema);
router.post('/', isAuthenticated, foroController.crearTema);
router.post('/:id/responder', isAuthenticated, foroController.responder);

module.exports = router;
