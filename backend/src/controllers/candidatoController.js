const Candidato = require('../models/Candidato');
const Postulacion = require('../models/Postulacion');
const Alerta = require('../models/Alerta');

const candidatoController = {
  async perfil(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      const totalPostulaciones = candidato ? await Candidato.contarPostulaciones(candidato.id_candidato) : 0;

      res.render('candidato/perfil', {
        title: 'Mi Perfil',
        candidato,
        totalPostulaciones
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar perfil');
      res.redirect('/');
    }
  },

  async actualizarPerfil(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      await Candidato.actualizar(candidato.id_candidato, req.body);
      req.flash('success', 'Perfil actualizado');
      res.redirect('/candidato/perfil');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar perfil');
      res.redirect('/candidato/perfil');
    }
  },

  async subirCV(req, res) {
    try {
      if (!req.file) {
        req.flash('error', 'Selecciona un archivo');
        return res.redirect('/candidato/perfil');
      }
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      await Candidato.actualizarCV(candidato.id_candidato, `/uploads/cv/${req.file.filename}`);
      req.flash('success', 'CV subido correctamente');
      res.redirect('/candidato/perfil');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al subir CV');
      res.redirect('/candidato/perfil');
    }
  },

  async solicitudes(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      const postulaciones = candidato ? await Postulacion.buscarPorCandidato(candidato.id_candidato) : [];
      res.render('candidato/solicitudes', { title: 'Mis Solicitudes', postulaciones });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar solicitudes');
      res.redirect('/candidato/perfil');
    }
  },

  async alertas(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      const alertas = candidato ? await Alerta.listarPorCandidato(candidato.id_candidato) : [];
      res.render('candidato/alertas', { title: 'Mis Alertas', alertas });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar alertas');
      res.redirect('/candidato/perfil');
    }
  },

  async crearAlerta(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      await Alerta.crear({ id_candidato: candidato.id_candidato, ...req.body });
      req.flash('success', 'Alerta creada');
      res.redirect('/candidato/alertas');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al crear alerta');
      res.redirect('/candidato/alertas');
    }
  },

  async eliminarAlerta(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      await Alerta.eliminar(req.params.id, candidato.id_candidato);
      req.flash('success', 'Alerta eliminada');
      res.redirect('/candidato/alertas');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al eliminar alerta');
      res.redirect('/candidato/alertas');
    }
  }
};

module.exports = candidatoController;
