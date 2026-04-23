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

## Tests y calidad

### Tests automatizados

Ejecutar toda la suite de tests (unitarios + integracion):

```bash
cd BackEnd/maven-basic-project
mvn test
```

Actualmente hay **70 tests** que cubren:

- **Unitarios**: controladores, servicios, repositorios, filtros JWT
- **Integracion**: flujo end-to-end de autenticacion con `@SpringBootTest` + `MockMvc`

### Cobertura de codigo (JaCoCo)

JaCoCo mide qué porcentaje del código fuente se ejecuta durante los
tests. El plugin esta integrado en el `pom.xml` y se ejecuta
automaticamente al lanzar `mvn test`.

#### Generar y ver el reporte

```bash
cd BackEnd/maven-basic-project
mvn test
open target/site/jacoco/index.html   # macOS
# xdg-open target/site/jacoco/index.html   # Linux
# start target/site/jacoco/index.html      # Windows
```

#### Cobertura actual

| Tipo                | Cubierto | Total |  %  |
|---------------------|----------|-------|-----|
| Instrucciones       | 1.180    | 1.237 | 95% |
| Ramas (branches)    | 48       | 62    | 77% |
| Lineas              | 295      | 307   | 96% |
| Metodos             | 92       | 98    | 93% |
| Clases              | 15       | 15    | 100% |

#### Como interpretar el reporte

- **Verde**: linea cubierta por algun test
- **Amarillo**: linea parcialmente cubierta (algunas ramas si, otras no)
- **Rojo**: linea sin cubrir

El reporte permite navegar paquete → clase → metodo, viendo el codigo
fuente coloreado y sabiendo exactamente que falta por testear.

#### Notas

- El reporte se regenera cada vez que se ejecuta `mvn test`.
- No hay umbral minimo configurado (no rompe el build), solo informa.
- Los archivos de reporte estan en `target/`, que esta ignorado por git.

### Pruebas de rendimiento (JMeter)

Requiere tener el backend arrancado en `localhost:8080`. En otra terminal:

```bash
cd BackEnd/maven-basic-project
mvn -Pjmeter verify
```

Resultados:
- CSV crudo: `target/jmeter/results/`
- Reporte HTML: `target/jmeter/reports/autoelite-performance/index.html`

El plan ejecuta 4 escenarios:
- TG1: carga de logins exitosos
- TG2: carga de logins con credenciales incorrectas
- TG3: flujo completo login + GET coches con JWT
- TG4: throughput de GET coches durante 30 segundos

### Profiling con VisualVM

El proyecto incluye un snapshot de profiling en `profiling/visualvm-snapshot.jfr` y un script de generacion de carga en `profiling/generar-carga.ps1` (Windows).
