const router  = require('express').Router();
const Empresa = require('../../models/Empresa');

// Listar todas las empresas (público)
router.get('/', async (req, res) => {
  try {
    const empresas = await Empresa.listarTodas();
    res.json({ ok: true, empresas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener empresas' });
  }
});

module.exports = router;
