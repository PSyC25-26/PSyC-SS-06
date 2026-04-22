# VisualVM Profiling — AutoElite Backend

Este directorio contiene los artefactos del perfilado con **VisualVM** sobre el backend Spring Boot de AutoElite.

## Contenido

| Fichero | Descripción |
|---------|-------------|
| `visualvm-snapshot.nps` | Snapshot de CPU profiling capturado durante una sesión de carga real |
| `generar-carga.ps1` | Script PowerShell para generar tráfico HTTP mientras se perfila |
| `README.md` | Este fichero |

---

## Cómo reproducir el profiling

### Prerrequisitos

- **VisualVM** instalado → [https://visualvm.github.io/](https://visualvm.github.io/)
- Backend Spring Boot arrancado en `localhost:8080`
- Java 17+

### Pasos

#### 1. Arrancar el backend

```powershell
cd BackEnd\maven-basic-project
mvn spring-boot:run
```

Espera a ver el mensaje `Started App in X seconds`.

#### 2. Abrir VisualVM y conectar al proceso

1. Abre VisualVM (`visualvm.exe`)
2. En el panel izquierdo "Applications", verás el proceso Java de Spring Boot (normalmente llamado `maven-basic-project-1.0-SNAPSHOT.jar` o `com.mycompany.app.App`)
3. Haz doble clic sobre él para abrirlo

#### 3. Activar CPU Profiling

1. Ve a la pestaña **"Profiler"**
2. Haz clic en el botón **"CPU"** (para perfilar tiempos de ejecución de métodos)
3. Pulsa **"Start Profiling"** / **"CPU"** → el profiling comienza inmediatamente

#### 4. Generar carga mientras perfilas

En otra terminal PowerShell, ejecuta el script incluido:

```powershell
cd profiling
.\generar-carga.ps1
```

El script hará ~100 peticiones HTTP al backend (logins, listado de coches, detalle de coche) para que VisualVM capture datos reales de ejecución.

#### 5. Tomar el snapshot

1. Espera a que el script termine (unos 30-60 segundos)
2. En VisualVM, haz clic en el botón **"Snapshot"** (icono de cámara) en la pestaña Profiler
3. En el menú File → **"Save Snapshot As..."** → guarda como `profiling/visualvm-snapshot.nps`

#### 6. Subir al repositorio

```bash
git add profiling/visualvm-snapshot.nps
git commit -m "test: add VisualVM profiling snapshot for MVP2 #33"
git push
```

---

## Interpretación del snapshot

Al abrir el `.nps` en VisualVM (File → Load Snapshot), verás:

- **Hot Spots**: los métodos con mayor tiempo de CPU (self time)
- **Call Tree**: árbol de llamadas completo con tiempos acumulados
- **método más llamado**: típicamente los métodos de Spring Security (`JwtAuthenticationFilter.doFilter`) y los repositorios JPA

Los tiempos de interés para el informe:

| Endpoint | Métodos principales |
|----------|---------------------|
| `POST /api/auth/login` | `AuthController.login`, `JwtService.generateToken`, `BCryptPasswordEncoder.matches` |
| `GET /api/coches` | `CocheController.obtenerTodosLosCoches`, `CocheRepository.findAll` |
