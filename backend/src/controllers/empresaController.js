const Empresa = require('../models/Empresa');
const Vacante = require('../models/Vacante');
const Postulacion = require('../models/Postulacion');

const empresaController = {
  async panel(req, res) {
    try {
      const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
      const vacantes = empresa ? await Vacante.listarPorEmpresa(empresa.id_empresa) : [];
      const valoracion = empresa ? await Empresa.obtenerPromedioValoracion(empresa.id_empresa) : { promedio: 0, total: 0 };

      res.render('empresa/panel', {
        title: 'Panel Empresarial',
        empresa,
        vacantes,
        valoracion
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar panel');
      res.redirect('/');
    }
  },

  async editarPerfil(req, res) {
    try {
      const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
      await Empresa.actualizar(empresa.id_empresa, req.body);
      req.flash('success', 'Datos de empresa actualizados');
      res.redirect('/empresa/panel');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar datos');
      res.redirect('/empresa/panel');
    }
  },

  async nuevaVacante(req, res) {
    res.render('empresa/nueva-vacante', { title: 'Publicar Vacante' });
  },

  async crearVacante(req, res) {
    try {
      const empresa = await Empresa.buscarPorUsuario(req.session.user.id);
      await Vacante.crear({ id_empresa: empresa.id_empresa, ...req.body });
      req.flash('success', 'Vacante publicada exitosamente');
      res.redirect('/empresa/panel');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al publicar vacante');
      res.redirect('/empresa/nueva-vacante');
    }
  },

  async editarVacante(req, res) {
    try {
      const vacante = await Vacante.buscarPorId(req.params.id);
      res.render('empresa/editar-vacante', { title: 'Editar Vacante', vacante });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar vacante');
      res.redirect('/empresa/panel');
    }
  },

  async actualizarVacante(req, res) {
    try {
      await Vacante.actualizar(req.params.id, req.body);
      req.flash('success', 'Vacante actualizada');
      res.redirect('/empresa/panel');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar vacante');
      res.redirect('/empresa/panel');
    }
  },

  async postulaciones(req, res) {
    try {
      const postulaciones = await Postulacion.buscarPorVacante(req.params.id);
      const vacante = await Vacante.buscarPorId(req.params.id);
      res.render('empresa/postulaciones', {
        title: 'Postulaciones',
        postulaciones,
        vacante
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar postulaciones');
      res.redirect('/empresa/panel');
    }
  },

  async actualizarPostulacion(req, res) {
    try {
      await Postulacion.actualizarEstado(req.params.id, req.body.estado);
      req.flash('success', 'Estado de postulación actualizado');
      res.redirect('back');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar postulación');
      res.redirect('/empresa/panel');
    }
  }
};

module.exports = empresaController;
