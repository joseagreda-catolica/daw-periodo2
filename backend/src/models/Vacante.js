const pool = require('../config/database');

const Vacante = {
  async crear(datos) {
    const [result] = await pool.execute(
      `INSERT INTO vacante (id_empresa, titulo, descripcion, ubicacion, tipo_contrato,
       salario_min, salario_max, nivel_experiencia, fecha_cierre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [datos.id_empresa, datos.titulo, datos.descripcion, datos.ubicacion,
       datos.tipo_contrato, datos.salario_min || null, datos.salario_max || null,
       datos.nivel_experiencia, datos.fecha_cierre || null]
    );
    return result.insertId;
  },

  async buscarPorId(id) {
    const [rows] = await pool.execute(
      `SELECT v.*, e.nombre_empresa, e.logo_url, e.id_empresa
       FROM vacante v JOIN empresa e ON v.id_empresa = e.id_empresa
       WHERE v.id_vacante = ?`,
      [id]
    );
    return rows[0];
  },

  async buscar(filtros = {}) {
    let sql = `SELECT v.*, e.nombre_empresa, e.logo_url
               FROM vacante v JOIN empresa e ON v.id_empresa = e.id_empresa
               WHERE v.estado = 'activa'`;
    const params = [];

    if (filtros.palabra_clave) {
      sql += ' AND (v.titulo LIKE ? OR v.descripcion LIKE ?)';
      const kw = `%${filtros.palabra_clave}%`;
      params.push(kw, kw);
    }
    if (filtros.ubicacion) {
      sql += ' AND v.ubicacion LIKE ?';
      params.push(`%${filtros.ubicacion}%`);
    }
    if (filtros.tipo_contrato) {
      sql += ' AND v.tipo_contrato = ?';
      params.push(filtros.tipo_contrato);
    }
    if (filtros.nivel_experiencia) {
      sql += ' AND v.nivel_experiencia = ?';
      params.push(filtros.nivel_experiencia);
    }
    if (filtros.salario_min) {
      sql += ' AND v.salario_max >= ?';
      params.push(filtros.salario_min);
    }

    sql += ' ORDER BY v.fecha_publicacion DESC';

    if (filtros.limite) {
      sql += ' LIMIT ?';
      params.push(parseInt(filtros.limite));
    }

    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async listarPorEmpresa(idEmpresa) {
    const [rows] = await pool.execute(
      'SELECT * FROM vacante WHERE id_empresa = ? ORDER BY fecha_publicacion DESC',
      [idEmpresa]
    );
    return rows;
  },

  async actualizar(id, datos) {
    await pool.execute(
      `UPDATE vacante SET titulo = ?, descripcion = ?, ubicacion = ?, tipo_contrato = ?,
       salario_min = ?, salario_max = ?, nivel_experiencia = ?, estado = ?, fecha_cierre = ?
       WHERE id_vacante = ?`,
      [datos.titulo, datos.descripcion, datos.ubicacion, datos.tipo_contrato,
       datos.salario_min, datos.salario_max, datos.nivel_experiencia, datos.estado,
       datos.fecha_cierre, id]
    );
  },

  async eliminar(id) {
    await pool.execute('DELETE FROM vacante WHERE id_vacante = ?', [id]);
  },

  async contar() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM vacante');
    return rows[0].total;
  },

  async recientes(limite = 5) {
    const [rows] = await pool.execute(
      `SELECT v.*, e.nombre_empresa, e.logo_url
       FROM vacante v JOIN empresa e ON v.id_empresa = e.id_empresa
       WHERE v.estado = 'activa' ORDER BY v.fecha_publicacion DESC LIMIT ?`,
      [limite]
    );
    return rows;
  }
};

module.exports = Vacante;
