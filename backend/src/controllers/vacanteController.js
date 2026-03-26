const Vacante = require('../models/Vacante');
const Postulacion = require('../models/Postulacion');
const Candidato = require('../models/Candidato');

const vacanteController = {
  async buscar(req, res) {
    try {
      const filtros = req.query;
      const vacantes = await Vacante.buscar(filtros);
      res.render('vacantes/busqueda', { title: 'Buscar Empleos', vacantes, filtros });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error en la búsqueda');
      res.redirect('/');
    }
  },

  async detalle(req, res) {
    try {
      const vacante = await Vacante.buscarPorId(req.params.id);
      if (!vacante) {
        req.flash('error', 'Vacante no encontrada');
        return res.redirect('/vacantes');
      }

      let yaPostulado = false;
      if (req.session.user && req.session.user.rol === 'candidato') {
        const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
        if (candidato) {
          yaPostulado = await Postulacion.yaPostulado(vacante.id_vacante, candidato.id_candidato);
        }
      }

      res.render('vacantes/detalle', { title: vacante.titulo, vacante, yaPostulado });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar vacante');
      res.redirect('/vacantes');
    }
  },

  async postular(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      if (!candidato) {
        req.flash('error', 'Completa tu perfil antes de postularte');
        return res.redirect('/candidato/perfil');
      }

      const yaPostulado = await Postulacion.yaPostulado(req.params.id, candidato.id_candidato);
      if (yaPostulado) {
        req.flash('error', 'Ya te has postulado a esta vacante');
        return res.redirect(`/vacantes/${req.params.id}`);
      }

      await Postulacion.crear({
        id_vacante: req.params.id,
        id_candidato: candidato.id_candidato,
        carta_presentacion: req.body.carta_presentacion
      });

      req.flash('success', 'Postulación enviada exitosamente');
      res.redirect(`/vacantes/${req.params.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al postularte');
      res.redirect(`/vacantes/${req.params.id}`);
    }
  }
};

module.exports = vacanteController;
