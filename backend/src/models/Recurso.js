const pool = require('../config/database');

const Recurso = {
  async crear(datos) {
    const [result] = await pool.execute(
      'INSERT INTO recurso (titulo, descripcion, url_contenido, tipo) VALUES (?, ?, ?, ?)',
      [datos.titulo, datos.descripcion || null, datos.url_contenido || null, datos.tipo || 'articulo']
    );
    return result.insertId;
  },

  async listar(tipo = null) {
    let sql = 'SELECT * FROM recurso';
    const params = [];
    if (tipo) {
      sql += ' WHERE tipo = ?';
      params.push(tipo);
    }
    sql += ' ORDER BY fecha_publicacion DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.execute('SELECT * FROM recurso WHERE id_recurso = ?', [id]);
    return rows[0];
  },

  async actualizar(id, datos) {
    await pool.execute(
      'UPDATE recurso SET titulo = ?, descripcion = ?, url_contenido = ?, tipo = ? WHERE id_recurso = ?',
      [datos.titulo, datos.descripcion, datos.url_contenido, datos.tipo, id]
    );
  },

  async eliminar(id) {
    await pool.execute('DELETE FROM recurso WHERE id_recurso = ?', [id]);
  }
};

module.exports = Recurso;
