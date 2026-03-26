const Valoracion = require('../models/Valoracion');
const Empresa = require('../models/Empresa');
const Candidato = require('../models/Candidato');

const valoracionController = {
  async listarEmpresas(req, res) {
    try {
      const empresas = await Empresa.listarTodas();
      // Agregar promedio de valoración a cada empresa
      for (const emp of empresas) {
        const val = await Empresa.obtenerPromedioValoracion(emp.id_empresa);
        emp.promedio = val.promedio || 0;
        emp.totalValoraciones = val.total;
      }
      res.render('valoraciones/index', { title: 'Valoraciones de Empresas', empresas });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar valoraciones');
      res.redirect('/');
    }
  },

  async verEmpresa(req, res) {
    try {
      const empresa = await Empresa.buscarPorId(req.params.id);
      if (!empresa) {
        req.flash('error', 'Empresa no encontrada');
        return res.redirect('/valoraciones');
      }
      const valoraciones = await Valoracion.listarPorEmpresa(req.params.id);
      const promedio = await Empresa.obtenerPromedioValoracion(req.params.id);

      res.render('valoraciones/empresa', {
        title: `Valoraciones - ${empresa.nombre_empresa}`,
        empresa,
        valoraciones,
        promedio
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar valoraciones');
      res.redirect('/valoraciones');
    }
  },

  async crear(req, res) {
    try {
      const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
      if (!candidato) {
        req.flash('error', 'Debes completar tu perfil');
        return res.redirect('/candidato/perfil');
      }

      await Valoracion.crear({
        id_empresa: req.params.id,
        id_candidato: candidato.id_candidato,
        puntuacion: req.body.puntuacion,
        comentario: req.body.comentario
      });

      req.flash('success', 'Valoración enviada. Será revisada por un administrador');
      res.redirect(`/valoraciones/${req.params.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al enviar valoración');
      res.redirect(`/valoraciones/${req.params.id}`);
    }
  }
};

module.exports = valoracionController;
