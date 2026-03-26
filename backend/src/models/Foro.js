const pool = require('../config/database');

const Foro = {
  async crearTema(datos) {
    const [result] = await pool.execute(
      'INSERT INTO foro_tema (id_usuario, titulo, categoria) VALUES (?, ?, ?)',
      [datos.id_usuario, datos.titulo, datos.categoria || null]
    );
    return result.insertId;
  },

  async listarTemas(categoria = null) {
    let sql = `SELECT ft.*, u.nombre, u.apellido,
               (SELECT COUNT(*) FROM foro_respuesta fr WHERE fr.id_tema = ft.id_tema) as total_respuestas
               FROM foro_tema ft JOIN usuario u ON ft.id_usuario = u.id_usuario
               WHERE ft.activo = 1`;
    const params = [];

    if (categoria) {
      sql += ' AND ft.categoria = ?';
      params.push(categoria);
    }

    sql += ' ORDER BY ft.fecha_creacion DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async buscarTema(idTema) {
    const [rows] = await pool.execute(
      `SELECT ft.*, u.nombre, u.apellido
       FROM foro_tema ft JOIN usuario u ON ft.id_usuario = u.id_usuario
       WHERE ft.id_tema = ?`,
      [idTema]
    );
    return rows[0];
  },

  async crearRespuesta(datos) {
    const [result] = await pool.execute(
      'INSERT INTO foro_respuesta (id_tema, id_usuario, contenido) VALUES (?, ?, ?)',
      [datos.id_tema, datos.id_usuario, datos.contenido]
    );
    return result.insertId;
  },

  async listarRespuestas(idTema) {
    const [rows] = await pool.execute(
      `SELECT fr.*, u.nombre, u.apellido
       FROM foro_respuesta fr JOIN usuario u ON fr.id_usuario = u.id_usuario
       WHERE fr.id_tema = ? ORDER BY fr.fecha ASC`,
      [idTema]
    );
    return rows;
  },

  async eliminarTema(idTema) {
    await pool.execute('UPDATE foro_tema SET activo = 0 WHERE id_tema = ?', [idTema]);
  }
};

module.exports = Foro;
