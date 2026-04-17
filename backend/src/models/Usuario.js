const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = {
  async crear(datos) {
    const hash = await bcrypt.hash(datos.password, 10);
    const [result] = await pool.execute(
      'INSERT INTO usuario (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [datos.nombre, datos.apellido, datos.email, hash, datos.rol || 'candidato']
    );
    return result.insertId;
  },

  async buscarPorEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0];
  },

  async buscarPorId(id) {
    const [rows] = await pool.execute('SELECT id_usuario, nombre, apellido, email, rol, activo, fecha_registro FROM usuario WHERE id_usuario = ?', [id]);
    return rows[0];
  },

  async verificarPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  async listarTodos() {
    const [rows] = await pool.execute('SELECT id_usuario, nombre, apellido, email, rol, fecha_registro, activo FROM usuario ORDER BY fecha_registro DESC');
    return rows;
  },

  async actualizarEstado(id, activo) {
    await pool.execute('UPDATE usuario SET activo = ? WHERE id_usuario = ?', [activo, id]);
  },

  async contar() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM usuario');
    return rows[0].total;
  }
};

module.exports = Usuario;
