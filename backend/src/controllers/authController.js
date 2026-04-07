const Usuario = require('../models/Usuario');
const Candidato = require('../models/Candidato');
const Empresa = require('../models/Empresa');

const authController = {
  loginForm(req, res) {
    res.redirect('/usuario/usuario-login.html');
  },

  registerForm(req, res) {
    res.redirect('/usuario/crear-cuenta.html');
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const usuario = await Usuario.buscarPorEmail(email);

      if (!usuario) {
        req.flash('error', 'Email o contraseña incorrectos');
        return res.redirect('/usuario/usuario-login.html');
      }

      if (!usuario.activo) {
        req.flash('error', 'Tu cuenta está desactivada. Contacta al administrador');
        return res.redirect('/usuario/usuario-login.html');
      }

      const valid = await Usuario.verificarPassword(password, usuario.password_hash);
      if (!valid) {
        req.flash('error', 'Email o contraseña incorrectos');
        return res.redirect('/usuario/usuario-login.html');
      }

      req.session.user = {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      };

      req.flash('success', `Bienvenido, ${usuario.nombre}`);

      switch (usuario.rol) {
        case 'admin':    return res.redirect('/admin/admin.html');
        case 'empresa':  return res.redirect('/comunidad_recursos/empresa.html');
        default:         return res.redirect('/usuario/usuario.html');
      }
    } catch (err) {
      console.error('Error en login:', err);
      req.flash('error', 'Error del servidor');
      res.redirect('/usuario/usuario-login.html');
    }
  },

  async register(req, res) {
    try {
      const { nombre, apellido, email, password, password2, rol, nombre_empresa } = req.body;

      if (password !== password2) {
        req.flash('error', 'Las contraseñas no coinciden');
        return res.redirect('/usuario/crear-cuenta.html');
      }

      const existe = await Usuario.buscarPorEmail(email);
      if (existe) {
        req.flash('error', 'El email ya está registrado');
        return res.redirect('/usuario/crear-cuenta.html');
      }

      const idUsuario = await Usuario.crear({ nombre, apellido, email, password, rol: rol || 'candidato' });

      if (rol === 'empresa') {
        await Empresa.crear(idUsuario, { nombre_empresa: nombre_empresa || `${nombre} ${apellido}` });
      } else {
        await Candidato.crear(idUsuario);
      }

      req.flash('success', 'Cuenta creada exitosamente. Inicia sesión');
      res.redirect('/usuario/usuario-login.html');
    } catch (err) {
      console.error('Error en registro:', err);
      req.flash('error', 'Error al crear la cuenta');
      res.redirect('/usuario/crear-cuenta.html');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/usuario/usuario-login.html');
    });
  }
};

module.exports = authController;
