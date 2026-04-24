const router     = require('express').Router();
const { apiAuth, apiRole } = require('../../middlewares/auth');
const pool = require('../../config/database');
const Usuario    = require('../../models/Usuario');
const Empresa    = require('../../models/Empresa');
const Vacante    = require('../../models/Vacante');
const Postulacion = require('../../models/Postulacion');
const Valoracion = require('../../models/Valoracion');
const Recurso    = require('../../models/Recurso');

const adminAuth = [apiAuth, apiRole('admin')];

// ── Estadísticas ──────────────────────────────────────────────────────────────

router.get('/stats', ...adminAuth, async (req, res) => {
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

// ── Usuarios ──────────────────────────────────────────────────────────────────

router.get('/usuarios', ...adminAuth, async (req, res) => {
  try {
    const usuarios = await Usuario.listarTodos();
    res.json({ ok: true, usuarios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener usuarios' });
  }
});

router.put('/usuarios/:id/toggle', ...adminAuth, async (req, res) => {
  try {
    // No permitir que un admin se desactive a sí mismo
    if (parseInt(req.params.id) === req.session.user.id) {
      return res.status(400).json({ ok: false, message: 'No puedes desactivar tu propia cuenta' });
    }

    const usuario = await Usuario.buscarPorId(req.params.id);
    if (!usuario) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    await Usuario.actualizarEstado(req.params.id, usuario.activo ? 0 : 1);
    res.json({ ok: true, activo: !usuario.activo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al cambiar estado' });
  }
});

// ── Empresas ──────────────────────────────────────────────────────────────────

router.get('/empresas', ...adminAuth, async (req, res) => {
  try {
    const empresas = await Empresa.listarTodas();
    res.json({ ok: true, empresas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener empresas' });
  }
});

// ── Vacantes ──────────────────────────────────────────────────────────────────

router.get('/vacantes', ...adminAuth, async (req, res) => {
  try {
    const [vacantes] = await pool.query(
      'SELECT v.*, e.nombre_empresa FROM vacante v JOIN empresa e ON v.id_empresa = e.id_empresa ORDER BY v.fecha_publicacion DESC'
    );
    res.json({ ok: true, vacantes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener vacantes' });
  }
});

router.delete('/vacantes/:id', ...adminAuth, async (req, res) => {
  try {
    await Vacante.eliminar(req.params.id);
    res.json({ ok: true, message: 'Vacante eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al eliminar vacante' });
  }
});

// ── Moderación de valoraciones ────────────────────────────────────────────────

router.get('/moderacion', ...adminAuth, async (req, res) => {
  try {
    const pendientes = await Valoracion.listarPendientes();
    res.json({ ok: true, pendientes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener moderación' });
  }
});

router.put('/valoraciones/:id/aprobar', ...adminAuth, async (req, res) => {
  try {
    await Valoracion.aprobar(req.params.id);
    res.json({ ok: true, message: 'Valoración aprobada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al aprobar valoración' });
  }
});

router.delete('/valoraciones/:id', ...adminAuth, async (req, res) => {
  try {
    await Valoracion.eliminar(req.params.id);
    res.json({ ok: true, message: 'Valoración eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al eliminar valoración' });
  }
});

// ── Recursos ──────────────────────────────────────────────────────────────────

router.get('/recursos', ...adminAuth, async (req, res) => {
  try {
    const recursos = await Recurso.listar();
    res.json({ ok: true, recursos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener recursos' });
  }
});

router.post('/recursos', ...adminAuth, async (req, res) => {
  try {
    if (!req.body.titulo) return res.status(400).json({ ok: false, message: 'El título es requerido' });
    await Recurso.crear({
      titulo:        req.body.titulo,
      descripcion:   req.body.descripcion   || null,
      url_contenido: req.body.url_contenido || null,
      tipo:          req.body.tipo          || 'articulo'
    });
    res.status(201).json({ ok: true, message: 'Recurso creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al crear recurso' });
  }
});

router.delete('/recursos/:id', ...adminAuth, async (req, res) => {
  try {
    await Recurso.eliminar(req.params.id);
    res.json({ ok: true, message: 'Recurso eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al eliminar recurso' });
  }
});

module.exports = router;
