const Foro = require('../models/Foro');

const foroController = {
  async listar(req, res) {
    try {
      const categoria = req.query.categoria || null;
      const temas = await Foro.listarTemas(categoria);
      res.render('foros/index', { title: 'Foros de Discusión', temas, categoriaActual: categoria });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar foros');
      res.redirect('/');
    }
  },

  async verTema(req, res) {
    try {
      const tema = await Foro.buscarTema(req.params.id);
      if (!tema) {
        req.flash('error', 'Tema no encontrado');
        return res.redirect('/foros');
      }
      const respuestas = await Foro.listarRespuestas(req.params.id);
      res.render('foros/tema', { title: tema.titulo, tema, respuestas });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar tema');
      res.redirect('/foros');
    }
  },

  async crearTema(req, res) {
    try {
      await Foro.crearTema({ id_usuario: req.session.user.id, ...req.body });
      req.flash('success', 'Tema creado');
      res.redirect('/foros');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al crear tema');
      res.redirect('/foros');
    }
  },

  async responder(req, res) {
    try {
      await Foro.crearRespuesta({
        id_tema: req.params.id,
        id_usuario: req.session.user.id,
        contenido: req.body.contenido
      });
      req.flash('success', 'Respuesta publicada');
      res.redirect(`/foros/${req.params.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al responder');
      res.redirect(`/foros/${req.params.id}`);
    }
  }
};

module.exports = foroController;
