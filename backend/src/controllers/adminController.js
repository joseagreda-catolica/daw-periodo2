const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const Vacante = require('../models/Vacante');
const Postulacion = require('../models/Postulacion');
const Valoracion = require('../models/Valoracion');
const Recurso = require('../models/Recurso');
const Foro = require('../models/Foro');

const adminController = {
  async dashboard(req, res) {
    try {
      const totalUsuarios = await Usuario.contar();
      const totalEmpresas = await Empresa.contar();
      const totalVacantes = await Vacante.contar();
      const totalPostulaciones = await Postulacion.contar();

      res.render('admin/dashboard', {
        title: 'Panel Administrativo',
        stats: { totalUsuarios, totalEmpresas, totalVacantes, totalPostulaciones }
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar dashboard');
      res.redirect('/');
    }
  },

  async usuarios(req, res) {
    try {
      const usuarios = await Usuario.listarTodos();
      res.render('admin/usuarios', { title: 'Gestión de Usuarios', usuarios });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar usuarios');
      res.redirect('/admin');
    }
  },

  async toggleUsuario(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.params.id);
      await Usuario.actualizarEstado(req.params.id, usuario.activo ? 0 : 1);
      req.flash('success', `Usuario ${usuario.activo ? 'desactivado' : 'activado'}`);
      res.redirect('/admin/usuarios');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al modificar usuario');
      res.redirect('/admin/usuarios');
    }
  },

  async empresas(req, res) {
    try {
      const empresas = await Empresa.listarTodas();
      res.render('admin/empresas', { title: 'Gestión de Empresas', empresas });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar empresas');
      res.redirect('/admin');
    }
  },

  async vacantes(req, res) {
    try {
      const vacantes = await Vacante.buscar({});
      res.render('admin/vacantes', { title: 'Gestión de Vacantes', vacantes });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar vacantes');
      res.redirect('/admin');
    }
  },

  async moderacion(req, res) {
    try {
      const valoracionesPendientes = await Valoracion.listarPendientes();
      res.render('admin/moderacion', { title: 'Moderación de Contenido', valoracionesPendientes });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar moderación');
      res.redirect('/admin');
    }
  },

  async aprobarValoracion(req, res) {
    try {
      await Valoracion.aprobar(req.params.id);
      req.flash('success', 'Valoración aprobada');
      res.redirect('/admin/moderacion');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al aprobar valoración');
      res.redirect('/admin/moderacion');
    }
  },

  async rechazarValoracion(req, res) {
    try {
      await Valoracion.eliminar(req.params.id);
      req.flash('success', 'Valoración rechazada');
      res.redirect('/admin/moderacion');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al rechazar valoración');
      res.redirect('/admin/moderacion');
    }
  },

  async recursos(req, res) {
    try {
      const recursos = await Recurso.listar();
      res.render('admin/recursos', { title: 'Gestión de Recursos', recursos });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar recursos');
      res.redirect('/admin');
    }
  },

  async crearRecurso(req, res) {
    try {
      await Recurso.crear(req.body);
      req.flash('success', 'Recurso creado');
      res.redirect('/admin/recursos');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al crear recurso');
      res.redirect('/admin/recursos');
    }
  },

  async eliminarRecurso(req, res) {
    try {
      await Recurso.eliminar(req.params.id);
      req.flash('success', 'Recurso eliminado');
      res.redirect('/admin/recursos');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al eliminar recurso');
      res.redirect('/admin/recursos');
    }
  }
};

module.exports = adminController;
