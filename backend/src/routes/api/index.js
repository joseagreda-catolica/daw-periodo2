const router = require('express').Router();

router.use('/auth',         require('./auth'));
router.use('/vacantes',     require('./vacantes'));
router.use('/candidato',    require('./candidato'));
router.use('/empresas',     require('./empresas'));
router.use('/empresa',      require('./empresa'));
router.use('/recursos',     require('./recursos'));
router.use('/foros',        require('./foros'));
router.use('/valoraciones', require('./valoraciones'));
router.use('/admin',        require('./admin'));

module.exports = router;
