-- =============================================
-- Portal de Trabajo - Schema de Base de Datos
-- =============================================

CREATE DATABASE IF NOT EXISTS portal_trabajo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portal_trabajo;

-- -----------------------------------------------
-- Tabla: USUARIO (Autenticación)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('candidato', 'empresa', 'admin') NOT NULL DEFAULT 'candidato',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT(1) DEFAULT 1
);

-- -----------------------------------------------
-- Tabla: ADMIN
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  nivel_acceso VARCHAR(50) DEFAULT 'general',
  ultimo_acceso DATETIME,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: CANDIDATO
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS candidato (
  id_candidato INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  telefono VARCHAR(20),
  ubicacion VARCHAR(150),
  titulo_profesional VARCHAR(150),
  resumen TEXT,
  cv_url VARCHAR(255),
  fecha_nacimiento DATE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: EMPRESA
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS empresa (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  nombre_empresa VARCHAR(200) NOT NULL,
  descripcion TEXT,
  sitio_web VARCHAR(255),
  logo_url VARCHAR(255),
  sector VARCHAR(100),
  ubicacion VARCHAR(150),
  telefono VARCHAR(20),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: VACANTE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS vacante (
  id_vacante INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  ubicacion VARCHAR(150),
  tipo_contrato ENUM('tiempo_completo', 'medio_tiempo', 'freelance', 'temporal', 'practicas') DEFAULT 'tiempo_completo',
  salario_min DECIMAL(10,2),
  salario_max DECIMAL(10,2),
  nivel_experiencia ENUM('sin_experiencia', 'junior', 'mid', 'senior', 'directivo') DEFAULT 'sin_experiencia',
  estado ENUM('activa', 'cerrada', 'pausada') DEFAULT 'activa',
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre DATE,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: POSTULACION
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS postulacion (
  id_postulacion INT AUTO_INCREMENT PRIMARY KEY,
  id_vacante INT NOT NULL,
  id_candidato INT NOT NULL,
  estado ENUM('enviada', 'en_revision', 'entrevista', 'rechazada', 'contratado') DEFAULT 'enviada',
  fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  carta_presentacion TEXT,
  FOREIGN KEY (id_vacante) REFERENCES vacante(id_vacante) ON DELETE CASCADE,
  FOREIGN KEY (id_candidato) REFERENCES candidato(id_candidato) ON DELETE CASCADE,
  UNIQUE KEY unique_postulacion (id_vacante, id_candidato)
);

-- -----------------------------------------------
-- Tabla: ALERTA
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS alerta (
  id_alerta INT AUTO_INCREMENT PRIMARY KEY,
  id_candidato INT NOT NULL,
  palabra_clave VARCHAR(150),
  ubicacion VARCHAR(150),
  tipo_trabajo ENUM('tiempo_completo', 'medio_tiempo', 'freelance', 'temporal', 'practicas'),
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (id_candidato) REFERENCES candidato(id_candidato) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: VALORACION
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS valoracion (
  id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  id_candidato INT NOT NULL,
  puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  aprobada TINYINT(1) DEFAULT 0,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE,
  FOREIGN KEY (id_candidato) REFERENCES candidato(id_candidato) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: FORO_TEMA
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS foro_tema (
  id_tema INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  categoria VARCHAR(100),
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: FORO_RESPUESTA
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS foro_respuesta (
  id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_tema INT NOT NULL,
  id_usuario INT NOT NULL,
  contenido TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tema) REFERENCES foro_tema(id_tema) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- -----------------------------------------------
-- Tabla: RECURSO
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS recurso (
  id_recurso INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  url_contenido VARCHAR(255),
  tipo ENUM('articulo', 'video', 'guia') DEFAULT 'articulo',
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Datos iniciales: Admin por defecto
-- password: admin123 (bcrypt hash)
-- -----------------------------------------------
INSERT INTO usuario (nombre, apellido, email, password_hash, rol) VALUES
('Admin', 'Sistema', 'admin@portal.com', '$2a$10$8K1p/a0dR1xqM8x5t3FVOeWQV2O4m8kC1ZJh5qV9Q5vDy3UxFqO.e', 'admin');

INSERT INTO admin (id_usuario, nivel_acceso) VALUES (1, 'super_admin');
