const Recurso = require('../models/Recurso');

const recursosController = {
  async listar(req, res) {
    try {
      const tipo = req.query.tipo || null;
      const recursos = await Recurso.listar(tipo);
      res.render('recursos/index', { title: 'Recursos', recursos, tipoActual: tipo });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar recursos');
      res.redirect('/');
    }
  }
};

module.exports = recursosController;
