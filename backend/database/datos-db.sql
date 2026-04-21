USE portal_trabajo;

-- USUARIOS
-- -----------------------------------------------
INSERT INTO usuario (nombre, apellido, email, password_hash, rol) VALUES
('Juan','Perez','juan1@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Ana','Lopez','ana2@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Carlos','Gomez','carlos3@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Maria','Diaz','maria4@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Luis','Martinez','luis5@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Elena','Torres','elena6@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Pedro','Ramirez','pedro7@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Sofia','Herrera','sofia8@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Diego','Castro','diego9@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),
('Lucia','Vega','lucia10@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','candidato'),

('Empresa','Tech','empresa1@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Solutions','empresa2@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Global','empresa3@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Digital','empresa4@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Soft','empresa5@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Cloud','empresa6@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Net','empresa7@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Data','empresa8@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','AI','empresa9@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa'),
('Empresa','Dev','empresa10@mail.com','$2a$10$wqJ7s8PzR6Yk3FhG9LmN0uVbXcD1E2f3G4h5I6j7K8l9M0nOpQrS','empresa');

-- -----------------------------------------------
-- ADMIN
-- (asumiendo IDs 2–11 para simplificar en entorno limpio)
-- -----------------------------------------------
INSERT INTO admin (id_usuario, nivel_acceso) VALUES
(2,'moderador'),
(3,'moderador'),
(4,'general'),
(5,'general'),
(6,'general'),
(7,'general'),
(8,'general'),
(9,'general'),
(10,'general'),
(11,'general');

-- -----------------------------------------------
-- CANDIDATOS
-- -----------------------------------------------
INSERT INTO candidato (id_usuario, telefono, ubicacion, titulo_profesional, resumen, cv_url, fecha_nacimiento) VALUES
(2,'70000001','El Salvador','Ingeniero Sistemas','Backend','cv1.pdf','1995-01-01'),
(3,'70000002','El Salvador','Diseñador UX','UI','cv2.pdf','1994-02-02'),
(4,'70000003','El Salvador','QA Tester','Testing','cv3.pdf','1993-03-03'),
(5,'70000004','El Salvador','DevOps','AWS','cv4.pdf','1992-04-04'),
(6,'70000005','El Salvador','Frontend','React','cv5.pdf','1991-05-05'),
(7,'70000006','El Salvador','Backend','Node','cv6.pdf','1990-06-06'),
(8,'70000007','El Salvador','Data','Python','cv7.pdf','1989-07-07'),
(9,'70000008','El Salvador','PM','Scrum','cv8.pdf','1988-08-08'),
(10,'70000009','El Salvador','Soporte','Helpdesk','cv9.pdf','1996-09-09'),
(11,'70000010','El Salvador','Mobile','Flutter','cv10.pdf','1997-10-10');

-- -----------------------------------------------
-- EMPRESAS
-- -----------------------------------------------
INSERT INTO empresa (id_usuario, nombre_empresa, descripcion, sitio_web, logo_url, sector, ubicacion, telefono) VALUES
(12,'TechCorp','Tech','web','logo','IT','SV','6001'),
(13,'SoftInc','Software','web','logo','IT','SV','6002'),
(14,'DataSys','Datos','web','logo','Data','SV','6003'),
(15,'CloudNet','Cloud','web','logo','Cloud','SV','6004'),
(16,'DevHouse','Dev','web','logo','Software','SV','6005'),
(17,'AIWorks','IA','web','logo','AI','SV','6006'),
(18,'NetGlobal','Redes','web','logo','Networking','SV','6007'),
(19,'CyberSec','Seguridad','web','logo','Security','SV','6008'),
(20,'WebStudio','Web','web','logo','Design','SV','6009'),
(21,'AppFactory','Apps','web','logo','Mobile','SV','6010');

-- -----------------------------------------------
-- VACANTES
-- -----------------------------------------------
INSERT INTO vacante (id_empresa, titulo, descripcion, ubicacion, tipo_contrato, salario_min, salario_max, nivel_experiencia) VALUES
(1,'Backend','API','SV','tiempo_completo',800,1200,'junior'),
(2,'Frontend','React','SV','tiempo_completo',700,1100,'junior'),
(3,'QA','Testing','SV','temporal',500,800,'sin_experiencia'),
(4,'DevOps','CI/CD','SV','tiempo_completo',1000,1500,'mid'),
(5,'Fullstack','Node','SV','tiempo_completo',900,1400,'mid'),
(6,'Data','BI','SV','tiempo_completo',850,1300,'junior'),
(7,'Scrum','Agile','SV','tiempo_completo',1200,1800,'senior'),
(8,'Soporte','Helpdesk','SV','medio_tiempo',400,700,'sin_experiencia'),
(9,'Mobile','Flutter','SV','freelance',600,1000,'junior'),
(10,'Security','Cyber','SV','tiempo_completo',1100,1600,'senior');

-- -----------------------------------------------
-- POSTULACIONES
-- -----------------------------------------------
INSERT INTO postulacion (id_vacante, id_candidato, estado, carta_presentacion) VALUES
(1,1,'enviada','OK'),
(2,2,'en_revision','OK'),
(3,3,'entrevista','OK'),
(4,4,'rechazada','OK'),
(5,5,'contratado','OK'),
(6,6,'enviada','OK'),
(7,7,'en_revision','OK'),
(8,8,'entrevista','OK'),
(9,9,'rechazada','OK'),
(10,10,'contratado','OK');

-- -----------------------------------------------
-- ALERTAS
-- -----------------------------------------------
INSERT INTO alerta (id_candidato, palabra_clave, ubicacion, tipo_trabajo) VALUES
(1,'Backend','SV','tiempo_completo'),
(2,'Frontend','SV','tiempo_completo'),
(3,'QA','SV','temporal'),
(4,'DevOps','SV','tiempo_completo'),
(5,'Fullstack','SV','tiempo_completo'),
(6,'Data','SV','tiempo_completo'),
(7,'Scrum','SV','tiempo_completo'),
(8,'Soporte','SV','medio_tiempo'),
(9,'Mobile','SV','freelance'),
(10,'Security','SV','tiempo_completo');

-- -----------------------------------------------
-- VALORACIONES
-- -----------------------------------------------
INSERT INTO valoracion (id_empresa, id_candidato, puntuacion, comentario, aprobada) VALUES
(1,1,5,'Excelente',1),
(2,2,4,'Bueno',1),
(3,3,3,'Regular',1),
(4,4,5,'Top',1),
(5,5,2,'Mejorar',1),
(6,6,4,'Bien',1),
(7,7,5,'Perfecto',1),
(8,8,3,'Normal',1),
(9,9,4,'Bien',1),
(10,10,5,'Excelente',1);

-- -----------------------------------------------
-- FORO_TEMA
-- -----------------------------------------------
INSERT INTO foro_tema (id_usuario, titulo, categoria) VALUES
(2,'Tema1','General'),
(3,'Tema2','Tech'),
(4,'Tema3','RRHH'),
(5,'Tema4','CV'),
(6,'Tema5','Freelance'),
(7,'Tema6','Remoto'),
(8,'Tema7','Salario'),
(9,'Tema8','Cursos'),
(10,'Tema9','Portafolio'),
(11,'Tema10','Networking');

-- -----------------------------------------------
-- FORO_RESPUESTA
-- -----------------------------------------------
INSERT INTO foro_respuesta (id_tema, id_usuario, contenido) VALUES
(1,2,'Resp'),
(2,3,'Resp'),
(3,4,'Resp'),
(4,5,'Resp'),
(5,6,'Resp'),
(6,7,'Resp'),
(7,8,'Resp'),
(8,9,'Resp'),
(9,10,'Resp'),
(10,11,'Resp');

-- RECURSOS
-- -----

INSERT INTO recurso (titulo, descripcion, url_contenido, tipo) VALUES
('Guía para crear CV','Aprende a crear un CV profesional','https://learning.linkedin.com/certifications-and-credentials','guia'),
('Curso de JavaScript','Curso básico de JS','https://learning.linkedin.com/certifications-and-credentials','video'),
('Artículo sobre SQL','Optimización de consultas','https://learning.linkedin.com/certifications-and-credentials','articulo'),
('Curso de React','Introducción a React','https://learning.linkedin.com/certifications-and-credentials','video'),
('Guía de entrevistas','Consejos para entrevistas','https://learning.linkedin.com/certifications-and-credentials','guia'),
('Artículo de UX','Mejores prácticas UX','https://learning.linkedin.com/certifications-and-credentials','articulo'),
('Curso de Node.js','Backend con Node','https://learning.linkedin.com/certifications-and-credentials','video'),
('Guía freelance','Cómo trabajar freelance','https://learning.linkedin.com/certifications-and-credentials','guia'),
('Artículo de Cloud','Introducción a cloud','https://learning.linkedin.com/certifications-and-credentials','articulo'),
('Curso DevOps','CI/CD básico','https://learning.linkedin.com/certifications-and-credentials','video');

-- -----------------------------------------------
-- USUARIOS INACTIVOS (para probar filtro "Suspendidos")
-- -----------------------------------------------
UPDATE usuario SET activo = 0 WHERE email IN ('pedro7@mail.com', 'empresa5@mail.com');

-- -----------------------------------------------
-- VALORACIONES PENDIENTES (para que moderación tenga contenido real)
-- -----------------------------------------------
INSERT INTO valoracion (id_empresa, id_candidato, puntuacion, comentario, aprobada) VALUES
(1, 2, 2, 'No cumplieron lo prometido en la entrevista', 0),
(3, 4, 1, 'Pésima organización interna', 0),
(5, 6, 3, 'Ambiente de trabajo mejorable', 0),
(2, 8, 4, 'Buenos beneficios pero salario bajo', 0);