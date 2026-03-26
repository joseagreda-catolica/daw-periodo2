const router = require('express').Router();
const vacanteController = require('../controllers/vacanteController');
const { isAuthenticated, hasRole } = require('../middlewares/auth');

router.get('/', vacanteController.buscar);
router.get('/:id', vacanteController.detalle);
router.post('/:id/postular', isAuthenticated, hasRole('candidato'), vacanteController.postular);

module.exports = router;
