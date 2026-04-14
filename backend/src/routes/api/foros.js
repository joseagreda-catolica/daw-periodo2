const router = require('express').Router();
const { apiAuth } = require('../../middlewares/auth');
const Foro = require('../../models/Foro');

// Listar temas (con filtro opcional por categoría)
router.get('/temas', apiAuth, async (req, res) => {
  try {
    const temas = await Foro.listarTemas(req.query.categoria || null);
    res.json({ ok: true, temas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener temas' });
  }
});

// Detalle de un tema con sus respuestas
router.get('/temas/:id', apiAuth, async (req, res) => {
  try {
    const tema = await Foro.buscarTema(req.params.id);
    if (!tema) return res.status(404).json({ ok: false, message: 'Tema no encontrado' });
    const respuestas = await Foro.listarRespuestas(req.params.id);
    res.json({ ok: true, tema, respuestas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener tema' });
  }
});

// Crear un nuevo tema
router.post('/temas', apiAuth, async (req, res) => {
  try {
    if (!req.body.titulo) return res.status(400).json({ ok: false, message: 'El título es requerido' });
    await Foro.crearTema({
      id_usuario: req.session.user.id,
      titulo:     req.body.titulo,
      categoria:  req.body.categoria || null
    });
    res.status(201).json({ ok: true, message: 'Debate creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al crear tema' });
  }
});

// Responder a un tema
router.post('/temas/:id/responder', apiAuth, async (req, res) => {
  try {
    if (!req.body.contenido) return res.status(400).json({ ok: false, message: 'El contenido es requerido' });
    await Foro.crearRespuesta({
      id_tema:    req.params.id,
      id_usuario: req.session.user.id,
      contenido:  req.body.contenido
    });
    res.status(201).json({ ok: true, message: 'Respuesta enviada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al responder' });
  }
});

module.exports = router;
