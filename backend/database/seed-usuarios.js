/**
 * Crea usuarios de demo para la presentacion:
 *   admin      → admin@portal.com    / admin123
 *   empresa    → empresa@portal.com  / empresa123
 *   candidato  → candidato@portal.com / candidato123
 *
 * Uso: node database/seed-usuarios.js
 */

const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');

const usuarios = [
  { nombre: 'Admin',     apellido: 'Sistema',  email: 'admin@portal.com',     password: 'admin123',     rol: 'admin'     },
  { nombre: 'TechCorp',  apellido: 'Empresa',  email: 'empresa@portal.com',   password: 'empresa123',   rol: 'empresa'   },
  { nombre: 'Juan',      apellido: 'Candidato',email: 'candidato@portal.com', password: 'candidato123', rol: 'candidato' },
];

async function seed() {
  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);

    // Insertar o actualizar usuario
    const [result] = await pool.execute(
      `INSERT INTO usuario (nombre, apellido, email, password_hash, rol)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), activo = 1`,
      [u.nombre, u.apellido, u.email, hash, u.rol]
    );

    const idUsuario = result.insertId || (await pool.execute(
      'SELECT id_usuario FROM usuario WHERE email = ?', [u.email]
    ))[0][0].id_usuario;

    // Insertar perfil segun rol
    if (u.rol === 'admin') {
      await pool.execute(
        `INSERT INTO admin (id_usuario, nivel_acceso)
         VALUES (?, 'super_admin')
         ON DUPLICATE KEY UPDATE nivel_acceso = 'super_admin'`,
        [idUsuario]
      );
    } else if (u.rol === 'empresa') {
      await pool.execute(
        `INSERT INTO empresa (id_usuario, nombre_empresa, descripcion, sector, ubicacion)
         VALUES (?, 'TechCorp SV', 'Empresa de tecnologia para demo', 'IT', 'San Salvador')
         ON DUPLICATE KEY UPDATE nombre_empresa = 'TechCorp SV'`,
        [idUsuario]
      );
    } else if (u.rol === 'candidato') {
      await pool.execute(
        `INSERT INTO candidato (id_usuario, titulo_profesional, resumen, ubicacion)
         VALUES (?, 'Desarrollador Web', 'Candidato de demo para presentacion', 'San Salvador')
         ON DUPLICATE KEY UPDATE titulo_profesional = 'Desarrollador Web'`,
        [idUsuario]
      );
    }

    console.log(`✓ ${u.rol.padEnd(10)} ${u.email}  /  ${u.password}`);
  }

  console.log('\nUsuarios listos. Puedes iniciar sesion con cualquiera de los anteriores.');
  process.exit(0);
}

seed().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
