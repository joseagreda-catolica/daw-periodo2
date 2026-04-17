const pool = require('../config/database');

const Valoracion = {
  async existeValoracion(idEmpresa, idCandidato) {
    const [rows] = await pool.execute(
      'SELECT id_valoracion FROM valoracion WHERE id_empresa = ? AND id_candidato = ?',
      [idEmpresa, idCandidato]
    );
    return rows.length > 0;
  },

  async crear(datos) {
    const [result] = await pool.execute(
      'INSERT INTO valoracion (id_empresa, id_candidato, puntuacion, comentario) VALUES (?, ?, ?, ?)',
      [datos.id_empresa, datos.id_candidato, datos.puntuacion, datos.comentario || null]
    );
    return result.insertId;
  },

  async listarPorEmpresa(idEmpresa) {
    const [rows] = await pool.execute(
      `SELECT v.*, u.nombre, u.apellido
       FROM valoracion v
       JOIN candidato c ON v.id_candidato = c.id_candidato
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE v.id_empresa = ? AND v.aprobada = 1 ORDER BY v.fecha DESC`,
      [idEmpresa]
    );
    return rows;
  },

  async listarPendientes() {
    const [rows] = await pool.execute(
      `SELECT v.*, e.nombre_empresa, u.nombre, u.apellido
       FROM valoracion v
       JOIN empresa e ON v.id_empresa = e.id_empresa
       JOIN candidato c ON v.id_candidato = c.id_candidato
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE v.aprobada = 0 ORDER BY v.fecha DESC`
    );
    return rows;
  },

  async aprobar(idValoracion) {
    await pool.execute('UPDATE valoracion SET aprobada = 1 WHERE id_valoracion = ?', [idValoracion]);
  },

  async eliminar(idValoracion) {
    await pool.execute('DELETE FROM valoracion WHERE id_valoracion = ?', [idValoracion]);
  }
};

module.exports = Valoracion;
