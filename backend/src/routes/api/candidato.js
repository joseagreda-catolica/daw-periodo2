const router     = require('express').Router();
const { apiAuth, apiRole } = require('../../middlewares/auth');
const Candidato  = require('../../models/Candidato');
const Postulacion = require('../../models/Postulacion');
const Alerta     = require('../../models/Alerta');
const upload     = require('../../middlewares/upload');

// ── Perfil ────────────────────────────────────────────────────────────────────

router.get('/perfil', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato    = await Candidato.buscarPorUsuario(req.session.user.id);
    const postulaciones = candidato
      ? await Postulacion.buscarPorCandidato(candidato.id_candidato)
      : [];
    res.json({ ok: true, candidato, postulaciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener perfil' });
  }
});

router.put('/perfil', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(404).json({ ok: false, message: 'Perfil no encontrado' });

    await Candidato.actualizar(candidato.id_candidato, {
      telefono:           req.body.telefono            || null,
      ubicacion:          req.body.ubicacion            || null,
      titulo_profesional: req.body.titulo_profesional  || null,
      resumen:            req.body.resumen              || null,
      fecha_nacimiento:   req.body.fecha_nacimiento     || null
    });

    res.json({ ok: true, message: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al actualizar perfil' });
  }
});

// ── CV ────────────────────────────────────────────────────────────────────────

router.post('/cv', apiAuth, apiRole('candidato'), upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'Selecciona un archivo válido' });

    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(404).json({ ok: false, message: 'Perfil no encontrado' });

    const cvUrl = '/uploads/cv/' + req.file.filename;
    await Candidato.actualizarCV(candidato.id_candidato, cvUrl);

    res.json({ ok: true, message: 'CV subido correctamente', cv_url: cvUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al subir CV' });
  }
});

// ── Alertas ───────────────────────────────────────────────────────────────────

router.get('/alertas', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    const alertas   = candidato
      ? await Alerta.listarPorCandidato(candidato.id_candidato)
      : [];
    res.json({ ok: true, alertas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener alertas' });
  }
});

router.post('/alertas', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(404).json({ ok: false, message: 'Perfil no encontrado' });
    if (!req.body.palabra_clave) return res.status(400).json({ ok: false, message: 'La palabra clave es requerida' });

    const id = await Alerta.crear({
      id_candidato:  candidato.id_candidato,
      palabra_clave: req.body.palabra_clave,
      ubicacion:     req.body.ubicacion    || null,
      tipo_trabajo:  req.body.tipo_trabajo || null
    });

    res.status(201).json({ ok: true, id_alerta: id, message: 'Alerta creada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al crear alerta' });
  }
});

router.delete('/alertas/:id', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(404).json({ ok: false, message: 'Perfil no encontrado' });

    await Alerta.eliminar(req.params.id, candidato.id_candidato);
    res.json({ ok: true, message: 'Alerta eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al eliminar alerta' });
  }
});

router.put('/alertas/:id/toggle', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    await Alerta.toggleActivo(req.params.id);
    res.json({ ok: true, message: 'Estado de alerta actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al cambiar estado' });
  }
});

module.exports = router;
