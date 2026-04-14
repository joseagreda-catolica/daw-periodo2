const router     = require('express').Router();
const { apiAuth, apiRole } = require('../../middlewares/auth');
const Valoracion = require('../../models/Valoracion');
const Empresa    = require('../../models/Empresa');
const Candidato  = require('../../models/Candidato');

// Obtener valoraciones de una empresa (público)
router.get('/:id_empresa', async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorId(req.params.id_empresa);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });
    const valoraciones = await Valoracion.listarPorEmpresa(req.params.id_empresa);
    const promedio     = await Empresa.obtenerPromedioValoracion(req.params.id_empresa);
    res.json({ ok: true, empresa, valoraciones, promedio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener valoraciones' });
  }
});

// Enviar valoración (candidato)
router.post('/:id_empresa', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(400).json({ ok: false, message: 'Completa tu perfil de candidato primero' });

    const puntuacion = parseInt(req.body.puntuacion);
    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ ok: false, message: 'La puntuación debe ser entre 1 y 5' });
    }

    await Valoracion.crear({
      id_empresa:   req.params.id_empresa,
      id_candidato: candidato.id_candidato,
      puntuacion,
      comentario:   req.body.comentario || null
    });

    res.status(201).json({ ok: true, message: 'Valoración enviada. Será revisada antes de publicarse.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al enviar valoración' });
  }
});

module.exports = router;
