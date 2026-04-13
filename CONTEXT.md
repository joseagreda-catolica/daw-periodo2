# TrabajoSV — Contexto del Proyecto

Portal de empleo desarrollado como proyecto universitario (DAW Período 2). Permite a candidatos buscar vacantes y postularse, a empresas publicar ofertas, y a administradores gestionar usuarios.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js v25 + Express.js |
| Base de datos | MySQL 8.4 + mysql2/promise |
| Vistas | HTML estático (frontend/) — EJS en desuso |
| Frontend | Bootstrap 5.3.8 + Bootstrap Icons 1.13.1 |
| Auth | express-session (cookie de 24h) |
| Otros | express-flash, method-override, dotenv |

---

## Estructura de Carpetas

```
daw-periodo2/
├── backend/
│   ├── app.js                  # Entry point, registra rutas y middlewares
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Pool MySQL (usa variables .env)
│   │   ├── controllers/        # authController, empresaController, etc.
│   │   ├── middlewares/
│   │   │   └── auth.js         # isAuthenticated, hasRole — redirigen a /usuario/usuario-login.html
│   │   ├── models/             # Usuario, Candidato, Empresa, Vacante, Postulacion, Recurso, Foro, Valoracion, Alerta
│   │   └── routes/
│   │       ├── api.js          # Todos los endpoints JSON /api/*
│   │       ├── auth.js         # POST /auth/login, /auth/register, GET /auth/logout
│   │       ├── home.js         # GET / → redirige según sesión
│   │       └── ...             # candidato, empresa, vacantes, admin, recursos, foros, valoraciones
│   └── views/                  # EJS (legado, en desuso — no agregar vistas nuevas aquí)
├── frontend/                   # Servido como estático por Express
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js              # Carga navbar/footer y actualiza área de auth según sesión
│   │   ├── empleos.js          # Lógica de la página de empleos (cards + detalle)
│   │   ├── recursos-page.js    # Fetch y render de recursos
│   │   ├── usuario.js          # Perfil del candidato
│   │   ├── empresa-panel.js    # Panel de empresa
│   │   └── admin.js            # Dashboard admin
│   ├── templates/
│   │   ├── navbar.html         # Navbar compartido (inyectado por app.js en #nav-website)
│   │   ├── footer.html         # Footer compartido (inyectado en #footer-website)
│   │   └── card-empleo.html    # Template de card con 6 {{}} en orden: titulo, ubicacion, salario, tipoEmpleo, id-btn, id-data
│   ├── website/
│   │   ├── empleos.html        # Página pública de empleos
│   │   └── recursos.html       # Página pública de recursos
│   ├── usuario/
│   │   ├── usuario-login.html  # Login (form POST /auth/login)
│   │   ├── crear-cuenta.html   # Registro (form POST /auth/register)
│   │   ├── usuario.html        # Perfil candidato (requiere sesión)
│   │   ├── postulaciones.html  # Historial de postulaciones (requiere sesión candidato)
│   │   └── alertas-vacantes.html # Alertas de empleo (requiere sesión, datos en localStorage)
│   ├── admin/
│   │   └── admin.html          # Dashboard admin (requiere sesión admin)
│   └── comunidad_recursos/
│       └── empresa.html        # Panel empresa (requiere sesión empresa)
└── .env                        # Variables de entorno (NO commitear)
```

---

## Variables de Entorno (.env)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=portal_trabajo
DB_PORT=3306

SESSION_SECRET=portal_trabajo_secret_key_change_me
PORT=3000
```

> Si la BD está en Railway u otro servicio cloud, reemplazar DB_* con las credenciales del proveedor.

---

## API Endpoints (`/api/*`)

Todos responden JSON. Errores de auth devuelven `401`/`403`, nunca redirigen.

### Públicos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/auth/check-session` | `{ logged, user: {id, nombre, rol} }` |
| GET | `/api/vacantes` | Lista vacantes. Query params: `search`, `ubicacion`, `tipo`, `nivel`, `salario_min`, `limite` |
| GET | `/api/vacantes/:id` | Detalle de vacante + `yaPostulado` si hay sesión candidato |
| GET | `/api/recursos` | Lista recursos. Query param: `tipo` (guia/video/articulo) |

### Candidato (requiere sesión rol=candidato)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/candidato/perfil` | `{ candidato, postulaciones[] }` |
| POST | `/api/vacantes/:id/postular` | Body: `{ carta_presentacion }` |

### Empresa (requiere sesión rol=empresa)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/empresa/panel` | `{ empresa, stats, vacantes[] }` |

### Admin (requiere sesión rol=admin)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/stats` | `{ totalUsuarios, totalEmpresas, totalVacantes, totalPostulaciones }` |
| GET | `/api/admin/usuarios` | Lista todos los usuarios |
| PUT | `/api/admin/usuarios/:id/toggle` | Activa/desactiva usuario |

---

## Auth Flow

1. Login: `POST /auth/login` con `email` + `password`
2. Éxito → redirige según `rol`:
   - `candidato` → `/usuario/usuario.html`
   - `empresa` → `/comunidad_recursos/empresa.html`
   - `admin` → `/admin/admin.html`
3. Fallo → redirige a `/usuario/usuario-login.html`
4. Logout: `GET /auth/logout` → destruye sesión → redirige a `/usuario/usuario-login.html`
5. Middleware `isAuthenticated` y `hasRole` redirigen a `/usuario/usuario-login.html` si no hay sesión válida

---

## Patrón de Páginas HTML

Todas las páginas siguen este patrón:

```html
<nav id="nav-website" class="navbar navbar-expand-lg sticky-top"></nav>

<!-- contenido -->

<footer id="footer-website" class="py-3 mt-4"></footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" ...></script>
<script src="/js/app.js"></script>  <!-- carga navbar, footer y actualiza auth area -->
```

`app.js` inyecta automáticamente el navbar y footer, y actualiza `#nav-auth-area` según sesión.

---

## Paleta de Colores

| Variable/Clase | Hex | Uso |
|---|---|---|
| `.bg-azul-oscuro` | `#2e3266` | Navbar, bordes de énfasis, headers |
| `.bg-beige-suave` | `#E8E5D9` | Fondos de sección, badges tipo |
| `.bg-beige-encendido` | `#D2B68A` | Badges salario, accent cálido |
| `.bg-beige-apagado` | `#b7b7b7` | Gris neutro |
| `btn-warning` | Amarillo Bootstrap | CTA principal en todo el sitio |
| Fondo general | `#f0f2f8` | `body` en páginas internas |

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| Candidato | `candidato@portal.com` | `candidato123` |
| Empresa | `empresa@portal.com` | `empresa123` |
| Admin | `admin@portal.com` | `admin123` |

---

## Cómo Ejecutar Localmente

```bash
# 1. Iniciar MySQL (sin servicio de Windows)
powershell.exe -Command "Start-Process 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe' -ArgumentList '--datadir=C:\Users\JoséAgreda\mysql-data'"

# 2. Verificar que MySQL esté corriendo
tasklist | findstr mysqld

# 3. Iniciar el servidor Node
cd daw-periodo2/backend
node app.js
# → Servidor corriendo en http://localhost:3000
```

---

## Reglas para Modificar el Proyecto

- **No crear vistas EJS nuevas** — todo nuevo UI va en `frontend/` como HTML estático
- **No romper IDs que usa el JS**:
  - `#nav-website`, `#footer-website` — en todas las páginas
  - `#container-card-empleos`, `#container-filter` — en `empleos.html`
  - `#container-recursos` — en `recursos.html`
  - `#perfil-nombre`, `#perfil-resumen`, `#perfil-habilidades`, `#perfil-postulaciones` — en `usuario.html`
  - `#tabla-usuarios` — en `admin.html`
- **`card-empleo.html`** tiene exactamente 6 `{{}}` en orden fijo: titulo, ubicacion, salario, tipoEmpleo, id-btn, id-data-attr — no alterar el orden
- **Bootstrap Icons** — usar clases `bi bi-*`, no SVGs externos
- **Autenticación en páginas protegidas** — verificar sesión con `/api/auth/check-session` y redirigir a `/usuario/usuario-login.html` si `logged === false`