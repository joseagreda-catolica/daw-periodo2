const pool = require('../config/database');

const Empresa = {
  async crear(idUsuario, datos) {
    const [result] = await pool.execute(
      'INSERT INTO empresa (id_usuario, nombre_empresa, descripcion, sitio_web, sector, ubicacion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [idUsuario, datos.nombre_empresa, datos.descripcion || null, datos.sitio_web || null, datos.sector || null, datos.ubicacion || null, datos.telefono || null]
    );
    return result.insertId;
  },

  async buscarPorUsuario(idUsuario) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.nombre, u.apellido, u.email
       FROM empresa e JOIN usuario u ON e.id_usuario = u.id_usuario
       WHERE e.id_usuario = ?`,
      [idUsuario]
    );
    return rows[0];
  },

  async buscarPorId(idEmpresa) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email
       FROM empresa e JOIN usuario u ON e.id_usuario = u.id_usuario
       WHERE e.id_empresa = ?`,
      [idEmpresa]
    );
    return rows[0];
  },

  async actualizar(idEmpresa, datos) {
    await pool.execute(
      `UPDATE empresa SET nombre_empresa = ?, descripcion = ?, sitio_web = ?,
       sector = ?, ubicacion = ?, telefono = ? WHERE id_empresa = ?`,
      [datos.nombre_empresa, datos.descripcion, datos.sitio_web, datos.sector, datos.ubicacion, datos.telefono, idEmpresa]
    );
  },

  async actualizarLogo(idEmpresa, logoUrl) {
    await pool.execute('UPDATE empresa SET logo_url = ? WHERE id_empresa = ?', [logoUrl, idEmpresa]);
  },

  async listarTodas() {
    const [rows] = await pool.execute(`
      SELECT e.*, u.activo, u.id_usuario, u.email
      FROM empresa e
      JOIN usuario u ON u.id_usuario = e.id_usuario
      ORDER BY e.nombre_empresa
    `);
    return rows;
  },

  async contar() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM empresa');
    return rows[0].total;
  },

  async obtenerPromedioValoracion(idEmpresa) {
    const [rows] = await pool.execute(
      'SELECT AVG(puntuacion) as promedio, COUNT(*) as total FROM valoracion WHERE id_empresa = ? AND aprobada = 1',
      [idEmpresa]
    );
    return rows[0];
  }
};

module.exports = Empresa;
