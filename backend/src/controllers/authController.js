const Usuario = require('../models/Usuario');
const Candidato = require('../models/Candidato');
const Empresa = require('../models/Empresa');

const authController = {
  loginForm(req, res) {
    res.render('auth/login', { title: 'Iniciar Sesión' });
  },

  registerForm(req, res) {
    res.render('auth/register', { title: 'Registrarse' });
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const usuario = await Usuario.buscarPorEmail(email);

      if (!usuario) {
        req.flash('error', 'Email o contraseña incorrectos');
        return res.redirect('/auth/login');
      }

      if (!usuario.activo) {
        req.flash('error', 'Tu cuenta está desactivada. Contacta al administrador');
        return res.redirect('/auth/login');
      }

      const valid = await Usuario.verificarPassword(password, usuario.password_hash);
      if (!valid) {
        req.flash('error', 'Email o contraseña incorrectos');
        return res.redirect('/auth/login');
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
        case 'admin': return res.redirect('/admin');
        case 'empresa': return res.redirect('/empresa/panel');
        default: return res.redirect('/candidato/perfil');
      }
    } catch (err) {
      console.error('Error en login:', err);
      req.flash('error', 'Error del servidor');
      res.redirect('/auth/login');
    }
  },

  async register(req, res) {
    try {
      const { nombre, apellido, email, password, password2, rol, nombre_empresa } = req.body;

      if (password !== password2) {
        req.flash('error', 'Las contraseñas no coinciden');
        return res.redirect('/auth/register');
      }

      const existe = await Usuario.buscarPorEmail(email);
      if (existe) {
        req.flash('error', 'El email ya está registrado');
        return res.redirect('/auth/register');
      }

      const idUsuario = await Usuario.crear({ nombre, apellido, email, password, rol: rol || 'candidato' });

      if (rol === 'empresa') {
        await Empresa.crear(idUsuario, { nombre_empresa: nombre_empresa || `${nombre} ${apellido}` });
      } else {
        await Candidato.crear(idUsuario);
      }

      req.flash('success', 'Cuenta creada exitosamente. Inicia sesión');
      res.redirect('/auth/login');
    } catch (err) {
      console.error('Error en registro:', err);
      req.flash('error', 'Error al crear la cuenta');
      res.redirect('/auth/register');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  }
};

module.exports = authController;
