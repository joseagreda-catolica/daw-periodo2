const Vacante = require('../models/Vacante');
const Empresa = require('../models/Empresa');
const Usuario = require('../models/Usuario');
const Postulacion = require('../models/Postulacion');

const homeController = {
  async index(req, res) {
    try {
      const vacantesRecientes = await Vacante.recientes(6);
      const totalEmpresas = await Empresa.contar();
      const totalUsuarios = await Usuario.contar();
      const totalVacantes = await Vacante.contar();
      const totalPostulaciones = await Postulacion.contar();

      res.render('home', {
        title: 'Portal de Trabajo - Inicio',
        vacantesRecientes,
        metricas: { totalEmpresas, totalUsuarios, totalVacantes, totalPostulaciones }
      });
    } catch (err) {
      console.error('Error en home:', err);
      res.render('home', {
        title: 'Portal de Trabajo - Inicio',
        vacantesRecientes: [],
        metricas: { totalEmpresas: 0, totalUsuarios: 0, totalVacantes: 0, totalPostulaciones: 0 }
      });
    }
  }
};

module.exports = homeController;
