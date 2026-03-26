# PSyC-SS-06 - AutoElite

Concesionario de coches con frontend en Next.js y backend en Spring Boot.

## Requisitos

- **Java 17** o superior
- **Maven** 3.8+
- **Node.js** 18+ y npm

## Estructura del proyecto

```
PSyC-SS-06/
├── BackEnd/maven-basic-project/   # API REST con Spring Boot
├── FrontEnd/                      # Aplicacion web con Next.js
└── README.md
```

## Backend (Spring Boot)

### Ejecutar

```bash
cd BackEnd/maven-basic-project
mvn spring-boot:run
```

El servidor arranca en [http://localhost:8080](http://localhost:8080).

### Base de datos

Usa H2 (base de datos embebida en fichero). Se crea automaticamente al arrancar. La consola H2 esta disponible en [http://localhost:8080/h2-console](http://localhost:8080/h2-console) con estos datos:

- JDBC URL: `jdbc:h2:file:./autoelite_db`
- User: `sa`
- Password: *(vacio)*

### Datos iniciales

Al arrancar se insertan automaticamente:
- 2 marcas: Toyota, Ford
- 2 coches: Toyota Corolla, Ford Mustang
- 1 usuario admin: `admin@autoelite.com` / `1234`

### Endpoints principales

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| POST | `/api/auth/login` | Iniciar sesion (devuelve JWT) | Publico |
| POST | `/api/usuarios/register` | Registrar usuario | Publico |
| GET | `/api/coches` | Listar coches | Publico |
| GET | `/api/coches/{id}` | Detalle de un coche | Publico |
| POST | `/api/coches` | Crear coche | Admin (JWT) |
| GET | `/api/marcas` | Listar marcas | Publico |
| GET | `/api/usuarios` | Listar usuarios | Publico |

## Frontend (Next.js)

### Instalar dependencias

En Windows puede ser necesario habilitar la ejecucion de scripts:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Instalar:

```bash
cd FrontEnd
npm install
```

### Ejecutar

```bash
npm run dev
```

La aplicacion arranca en [http://localhost:3000](http://localhost:3000).

### Paginas

| Ruta             | Descripcion                         |
|------------------|-------------------------------------|
| `/`              | Landing page con catalogo de coches |
| `/login`         | Inicio de sesion y registro         |
| `/coches/{id}`   | Detalle de un coche                 |
| `/admin`         | Panel de administracion (usuarios)  |
| `/admin/coches`  | Formulario para anadir coches       |

## Como probarlo

1. Arrancar el backend: `cd BackEnd/maven-basic-project && mvn spring-boot:run`
2. Arrancar el frontend: `cd FrontEnd && npm run dev`
3. Abrir [http://localhost:3000](http://localhost:3000)
4. Para acceder al panel admin, iniciar sesion con `admin@autoelite.com` / `1234`
