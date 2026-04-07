const router = require('express').Router();
const { isAuthenticated, hasRole } = require('../middlewares/auth');

const Usuario    = require('../models/Usuario');
const Candidato  = require('../models/Candidato');
const Empresa    = require('../models/Empresa');
const Vacante    = require('../models/Vacante');
const Postulacion = require('../models/Postulacion');
const Recurso    = require('../models/Recurso');

// Helper: send JSON 401 for API routes instead of redirect
function apiAuth(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ ok: false, message: 'No autenticado' });
}

function apiRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ ok: false, message: 'No autenticado' });
    if (roles.includes(req.session.user.rol)) return next();
    res.status(403).json({ ok: false, message: 'Sin permisos' });
  };
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
router.get('/auth/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ logged: true, user: req.session.user });
  } else {
    res.json({ logged: false, user: null });
  }
});

// ── VACANTES (public) ─────────────────────────────────────────────────────────
router.get('/vacantes', async (req, res) => {
  try {
    const filtros = {
      palabra_clave:    req.query.search || req.query.palabra_clave,
      ubicacion:        req.query.ubicacion,
      tipo_contrato:    req.query.tipo || req.query.tipo_contrato,
      nivel_experiencia: req.query.nivel || req.query.nivel_experiencia,
      salario_min:      req.query.salario_min,
      limite:           req.query.limite
    };
    const vacantes = await Vacante.buscar(filtros);
    res.json({ ok: true, vacantes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener vacantes' });
  }
});

router.get('/vacantes/:id', async (req, res) => {
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

router.post('/vacantes/:id/postular', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(400).json({ ok: false, message: 'Perfil de candidato no encontrado' });

    const yaPostulado = await Postulacion.yaPostulado(req.params.id, candidato.id_candidato);
    if (yaPostulado) return res.status(400).json({ ok: false, message: 'Ya te postulaste a esta vacante' });

    await Postulacion.crear({
      id_vacante: req.params.id,
      id_candidato: candidato.id_candidato,
      carta_presentacion: req.body.carta_presentacion
    });

    res.json({ ok: true, message: 'Postulación enviada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al postular' });
  }
});

// ── CANDIDATO ─────────────────────────────────────────────────────────────────
router.get('/candidato/perfil', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    const postulaciones = candidato
      ? await Postulacion.buscarPorCandidato(candidato.id_candidato)
      : [];
    res.json({ ok: true, candidato, postulaciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener perfil' });
  }
});

// ── EMPRESA ───────────────────────────────────────────────────────────────────
router.get('/empresa/panel', apiAuth, apiRole('empresa'), async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });

    const vacantes = await Vacante.listarPorEmpresa(empresa.id_empresa);

    // Count total postulaciones across all vacantes
    let totalPostulaciones = 0;
    for (const v of vacantes) {
      const posts = await Postulacion.buscarPorVacante(v.id_vacante);
      v.total_postulaciones = posts.length;
      totalPostulaciones += posts.length;
    }

    const vacanteActivas = vacantes.filter(v => v.estado === 'activa').length;
    const val = await Empresa.obtenerPromedioValoracion(empresa.id_empresa);

    res.json({
      ok: true,
      empresa,
      stats: {
        candidatos_activos: totalPostulaciones,
        vacantes_abiertas: vacanteActivas,
        reputacion: val.promedio ? parseFloat(val.promedio).toFixed(1) : '0.0'
      },
      vacantes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener panel' });
  }
});

// ── RECURSOS (public) ─────────────────────────────────────────────────────────
router.get('/recursos', async (req, res) => {
  try {
    const recursos = await Recurso.listar(req.query.tipo || null);
    res.json({ ok: true, recursos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener recursos' });
  }
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────
router.get('/admin/stats', apiAuth, apiRole('admin'), async (req, res) => {
  try {
    const [totalUsuarios, totalEmpresas, totalVacantes, totalPostulaciones] = await Promise.all([
      Usuario.contar(),
      Empresa.contar(),
      Vacante.contar(),
      Postulacion.contar()
    ]);
    res.json({ ok: true, stats: { totalUsuarios, totalEmpresas, totalVacantes, totalPostulaciones } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener stats' });
  }
});

router.get('/admin/usuarios', apiAuth, apiRole('admin'), async (req, res) => {
  try {
    const usuarios = await Usuario.listarTodos();
    res.json({ ok: true, usuarios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener usuarios' });
  }
});

router.put('/admin/usuarios/:id/toggle', apiAuth, apiRole('admin'), async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.params.id);
    if (!usuario) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    await Usuario.actualizarEstado(req.params.id, usuario.activo ? 0 : 1);
    res.json({ ok: true, activo: !usuario.activo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al cambiar estado' });
  }
});

module.exports = router;
