const pool = require('../config/database');

const Candidato = {
  async crear(idUsuario) {
    const [result] = await pool.execute(
      'INSERT INTO candidato (id_usuario) VALUES (?)',
      [idUsuario]
    );
    return result.insertId;
  },

  async buscarPorUsuario(idUsuario) {
    const [rows] = await pool.execute(
      `SELECT c.*, u.nombre, u.apellido, u.email
       FROM candidato c JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_usuario = ?`,
      [idUsuario]
    );
    return rows[0];
  },

  async buscarPorId(idCandidato) {
    const [rows] = await pool.execute(
      `SELECT c.*, u.nombre, u.apellido, u.email
       FROM candidato c JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_candidato = ?`,
      [idCandidato]
    );
    return rows[0];
  },

  async actualizar(idCandidato, datos) {
    await pool.execute(
      `UPDATE candidato SET telefono = ?, ubicacion = ?, titulo_profesional = ?,
       resumen = ?, fecha_nacimiento = ? WHERE id_candidato = ?`,
      [datos.telefono, datos.ubicacion, datos.titulo_profesional, datos.resumen, datos.fecha_nacimiento, idCandidato]
    );
  },

  async actualizarCV(idCandidato, cvUrl) {
    await pool.execute('UPDATE candidato SET cv_url = ? WHERE id_candidato = ?', [cvUrl, idCandidato]);
  },

  async contarPostulaciones(idCandidato) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as total FROM postulacion WHERE id_candidato = ?',
      [idCandidato]
    );
    return rows[0].total;
  }
};

module.exports = Candidato;
