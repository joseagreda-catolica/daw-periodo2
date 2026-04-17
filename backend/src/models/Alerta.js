const pool = require('../config/database');

const Alerta = {
  async crear(datos) {
    const [result] = await pool.execute(
      'INSERT INTO alerta (id_candidato, palabra_clave, ubicacion, tipo_trabajo) VALUES (?, ?, ?, ?)',
      [datos.id_candidato, datos.palabra_clave, datos.ubicacion || null, datos.tipo_trabajo || null]
    );
    return result.insertId;
  },

  async listarPorCandidato(idCandidato) {
    const [rows] = await pool.execute(
      'SELECT * FROM alerta WHERE id_candidato = ? ORDER BY id_alerta DESC',
      [idCandidato]
    );
    return rows;
  },

  async eliminar(idAlerta, idCandidato) {
    await pool.execute('DELETE FROM alerta WHERE id_alerta = ? AND id_candidato = ?', [idAlerta, idCandidato]);
  },

  async toggleActivo(idAlerta, idCandidato) {
    await pool.execute('UPDATE alerta SET activo = NOT activo WHERE id_alerta = ? AND id_candidato = ?', [idAlerta, idCandidato]);
  }
};

module.exports = Alerta;
