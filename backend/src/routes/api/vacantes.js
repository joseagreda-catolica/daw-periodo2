const router    = require('express').Router();
const { apiAuth, apiRole } = require('../../middlewares/auth');
const Vacante    = require('../../models/Vacante');
const Candidato  = require('../../models/Candidato');
const Postulacion = require('../../models/Postulacion');

// Buscar vacantes con filtros (público)
router.get('/', async (req, res) => {
  try {
    const filtros = {
      palabra_clave:     req.query.search || req.query.palabra_clave,
      ubicacion:         req.query.ubicacion,
      tipo_contrato:     req.query.tipo   || req.query.tipo_contrato,
      nivel_experiencia: req.query.nivel  || req.query.nivel_experiencia,
      salario_min:       req.query.salario_min,
      limite:            req.query.limite
    };
    const vacantes = await Vacante.buscar(filtros);
    res.json({ ok: true, vacantes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener vacantes' });
  }
});

// Detalle de vacante (público)
router.get('/:id', async (req, res) => {
  try {
    const vacante = await Vacante.buscarPorId(req.params.id);
    if (!vacante) return res.status(404).json({ ok: false, message: 'Vacante no encontrada' });

    let yaPostulado = false;
    if (req.session.user && req.session.user.rol === 'candidato') {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      if (candidato) {
        yaPostulado = await Postulacion.yaPostulado(vacante.id_vacante, candidato.id_candidato);
      }
    }

    res.json({ ok: true, vacante, yaPostulado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener vacante' });
  }
});

// Postularse a una vacante (candidato)
router.post('/:id/postular', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(400).json({ ok: false, message: 'Perfil de candidato no encontrado' });

    const yaPostulado = await Postulacion.yaPostulado(req.params.id, candidato.id_candidato);
    if (yaPostulado) return res.status(400).json({ ok: false, message: 'Ya te postulaste a esta vacante' });

    await Postulacion.crear({
      id_vacante:         req.params.id,
      id_candidato:       candidato.id_candidato,
      carta_presentacion: req.body.carta_presentacion
    });

    res.json({ ok: true, message: 'Postulación enviada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al postular' });
  }
});

module.exports = router;
