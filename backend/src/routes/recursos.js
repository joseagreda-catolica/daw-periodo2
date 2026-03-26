const router = require('express').Router();
const recursosController = require('../controllers/recursosController');

router.get('/', recursosController.listar);

module.exports = router;
