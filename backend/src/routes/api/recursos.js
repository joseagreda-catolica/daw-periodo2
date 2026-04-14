const router  = require('express').Router();
const Recurso = require('../../models/Recurso');

// Listar recursos con filtro opcional por tipo (público)
router.get('/', async (req, res) => {
  try {
    const recursos = await Recurso.listar(req.query.tipo || null);
    res.json({ ok: true, recursos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener recursos' });
  }
});

module.exports = router;
