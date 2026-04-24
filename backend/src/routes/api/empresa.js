const router     = require('express').Router();
const { apiAuth, apiRole } = require('../../middlewares/auth');
const Empresa    = require('../../models/Empresa');
const Vacante    = require('../../models/Vacante');
const Postulacion = require('../../models/Postulacion');

// ── Panel de empresa ──────────────────────────────────────────────────────────

router.get('/panel', apiAuth, apiRole('empresa'), async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });

    const vacantes = await Vacante.listarPorEmpresa(empresa.id_empresa);

    let totalPostulaciones = 0;
    for (const v of vacantes) {
      const posts = await Postulacion.buscarPorVacante(v.id_vacante);
      v.total_postulaciones = posts.length;
      totalPostulaciones   += posts.length;
    }

    const vacanteActivas = vacantes.filter(v => v.estado === 'activa').length;
    const val = await Empresa.obtenerPromedioValoracion(empresa.id_empresa);

    res.json({
      ok: true,
      empresa,
      stats: {
        candidatos_activos: totalPostulaciones,
        vacantes_abiertas:  vacanteActivas,
        reputacion: val.promedio ? parseFloat(val.promedio).toFixed(1) : '0.0'
      },
      vacantes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener panel' });
  }
});

// ── Perfil de empresa ─────────────────────────────────────────────────────────

router.put('/perfil', apiAuth, apiRole('empresa'), async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });

    await Empresa.actualizar(empresa.id_empresa, {
      nombre_empresa: req.body.nombre_empresa || empresa.nombre_empresa,
      descripcion:    req.body.descripcion    || null,
      sitio_web:      req.body.sitio_web      || null,
      sector:         req.body.sector         || null,
      ubicacion:      req.body.ubicacion      || null,
      telefono:       req.body.telefono       || null
    });

    res.json({ ok: true, message: 'Perfil de empresa actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al actualizar perfil' });
  }
});

// ── Vacantes de la empresa ────────────────────────────────────────────────────

router.post('/vacantes', apiAuth, apiRole('empresa'), async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });
    if (!req.body.titulo) return res.status(400).json({ ok: false, message: 'El título es requerido' });
    if (!req.body.descripcion) return res.status(400).json({ ok: false, message: 'La descripción es requerida' });

    // Validar salarios si ambos están presentes
    const salarioMin = req.body.salario_min ? parseFloat(req.body.salario_min) : null;
    const salarioMax = req.body.salario_max ? parseFloat(req.body.salario_max) : null;

    if ((salarioMin || salarioMax) && salarioMin && salarioMax && salarioMin > salarioMax) {
      return res.status(400).json({ ok: false, message: 'El salario mínimo no puede ser mayor que el máximo' });
    }

    const id = await Vacante.crear({
      id_empresa:        empresa.id_empresa,
      titulo:            req.body.titulo,
      descripcion:       req.body.descripcion       || null,
      ubicacion:         req.body.ubicacion          || null,
      tipo_contrato:     req.body.tipo_contrato      || 'tiempo_completo',
      salario_min:       salarioMin,
      salario_max:       salarioMax,
      nivel_experiencia: req.body.nivel_experiencia  || 'junior',
      fecha_cierre:      req.body.fecha_cierre       || null
    });

    res.status(201).json({ ok: true, id_vacante: id, message: 'Vacante publicada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al crear vacante' });
  }
});

router.put('/vacantes/:id', apiAuth, apiRole('empresa'), async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });

    const vacante = await Vacante.buscarPorId(req.params.id);
    if (!vacante) return res.status(404).json({ ok: false, message: 'Vacante no encontrada' });
    if (vacante.id_empresa !== empresa.id_empresa)
      return res.status(403).json({ ok: false, message: 'Sin permisos para editar esta vacante' });

    // Validar salarios si se están actualizando
    const salarioMin = req.body.salario_min != null ? parseFloat(req.body.salario_min) : vacante.salario_min;
    const salarioMax = req.body.salario_max != null ? parseFloat(req.body.salario_max) : vacante.salario_max;

    if ((salarioMin || salarioMax) && salarioMin && salarioMax && salarioMin > salarioMax) {
      return res.status(400).json({ ok: false, message: 'El salario mínimo no puede ser mayor que el máximo' });
    }

    await Vacante.actualizar(req.params.id, {
      titulo:            req.body.titulo             || vacante.titulo,
      descripcion:       req.body.descripcion         || vacante.descripcion,
      ubicacion:         req.body.ubicacion           || vacante.ubicacion,
      tipo_contrato:     req.body.tipo_contrato       || vacante.tipo_contrato,
      salario_min:       salarioMin,
      salario_max:       salarioMax,
      nivel_experiencia: req.body.nivel_experiencia   || vacante.nivel_experiencia,
      estado:            req.body.estado              || vacante.estado,
      fecha_cierre:      req.body.fecha_cierre        || vacante.fecha_cierre
    });

    res.json({ ok: true, message: 'Vacante actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al actualizar vacante' });
  }
});

// ── Postulaciones ─────────────────────────────────────────────────────────────

router.get('/vacantes/:id/postulaciones', apiAuth, apiRole('empresa'), async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });

    const vacante = await Vacante.buscarPorId(req.params.id);
    if (!vacante) return res.status(404).json({ ok: false, message: 'Vacante no encontrada' });
    if (vacante.id_empresa !== empresa.id_empresa)
      return res.status(403).json({ ok: false, message: 'Sin permisos' });

    const postulaciones = await Postulacion.buscarPorVacante(req.params.id);
    res.json({ ok: true, postulaciones, vacante });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener postulaciones' });
  }
});

router.put('/postulaciones/:id', apiAuth, apiRole('empresa'), async (req, res) => {
  try {
    const estadosValidos = ['enviada', 'en_revision', 'entrevista', 'contratado', 'rechazada'];
    if (!estadosValidos.includes(req.body.estado)) {
      return res.status(400).json({ ok: false, message: 'Estado no válido' });
    }

    // Verificar que la postulación pertenece a una vacante de esta empresa
    const postulacion = await Postulacion.buscarPorId(req.params.id);
    if (!postulacion) {
      return res.status(404).json({ ok: false, message: 'Postulación no encontrada' });
    }

    const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
    if (!empresa || postulacion.id_empresa !== empresa.id_empresa) {
      return res.status(403).json({ ok: false, message: 'Sin permisos para esta acción' });
    }

    await Postulacion.actualizarEstado(req.params.id, req.body.estado);
    res.json({ ok: true, message: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al actualizar estado' });
  }
});

module.exports = router;
