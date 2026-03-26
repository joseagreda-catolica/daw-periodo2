const pool = require('../config/database');

const Postulacion = {
  async crear(datos) {
    const [result] = await pool.execute(
      'INSERT INTO postulacion (id_vacante, id_candidato, carta_presentacion) VALUES (?, ?, ?)',
      [datos.id_vacante, datos.id_candidato, datos.carta_presentacion || null]
    );
    return result.insertId;
  },

  async buscarPorCandidato(idCandidato) {
    const [rows] = await pool.execute(
      `SELECT p.*, v.titulo, v.ubicacion, e.nombre_empresa
       FROM postulacion p
       JOIN vacante v ON p.id_vacante = v.id_vacante
       JOIN empresa e ON v.id_empresa = e.id_empresa
       WHERE p.id_candidato = ? ORDER BY p.fecha_postulacion DESC`,
      [idCandidato]
    );
    return rows;
  },

  async buscarPorVacante(idVacante) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.telefono, c.titulo_profesional, c.cv_url, u.nombre, u.apellido, u.email
       FROM postulacion p
       JOIN candidato c ON p.id_candidato = c.id_candidato
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE p.id_vacante = ? ORDER BY p.fecha_postulacion DESC`,
      [idVacante]
    );
    return rows;
  },

  async yaPostulado(idVacante, idCandidato) {
    const [rows] = await pool.execute(
      'SELECT id_postulacion FROM postulacion WHERE id_vacante = ? AND id_candidato = ?',
      [idVacante, idCandidato]
    );
    return rows.length > 0;
  },

  async actualizarEstado(idPostulacion, estado) {
    await pool.execute('UPDATE postulacion SET estado = ? WHERE id_postulacion = ?', [estado, idPostulacion]);
  },

  async contar() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM postulacion');
    return rows[0].total;
  }
};

module.exports = Postulacion;
