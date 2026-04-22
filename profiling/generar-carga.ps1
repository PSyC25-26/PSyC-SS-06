# Script PowerShell para generar carga en el backend de AutoElite
# Usar este script mientras VisualVM está haciendo profiling para capturar datos reales
# Ejecutar desde la carpeta raiz del proyecto con: .\profiling\generar-carga.ps1

param(
    [string]$Host = "localhost",
    [int]$Port = 8080,
    [int]$Repeticiones = 20
)

$BaseUrl = "http://${Host}:${Port}"
$ErrorActionPreference = "Continue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AutoElite - Generador de Carga para VisualVM" -ForegroundColor Cyan
Write-Host "  Backend: $BaseUrl" -ForegroundColor Cyan
Write-Host "  Repeticiones por endpoint: $Repeticiones" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el backend está arriba
try {
    $ping = Invoke-WebRequest -Uri "$BaseUrl/api/coches" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend disponible en $BaseUrl" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: El backend no está disponible en $BaseUrl" -ForegroundColor Red
    Write-Host "  Asegúrate de que está arrancado con: mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ---- LOGIN EXITOSO ----
Write-Host "[1/4] Generando carga: Login exitoso ($Repeticiones peticiones)..." -ForegroundColor Yellow
$loginBody = '{"email":"admin@autoelite.com","password":"1234"}'
$loginOk = 0
$loginFail = 0
$jwtToken = $null

for ($i = 1; $i -le $Repeticiones; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $loginBody `
            -ErrorAction Stop
        $loginOk++
        if ($null -eq $jwtToken -and $response.token) {
            $jwtToken = $response.token
        }
    } catch {
        $loginFail++
    }
    Write-Progress -Activity "Login exitoso" -Status "$i/$Repeticiones" -PercentComplete (($i / $Repeticiones) * 100)
}
Write-Host "   → OK: $loginOk | Errores: $loginFail" -ForegroundColor $(if ($loginFail -eq 0) { "Green" } else { "Yellow" })

# ---- LOGIN FALLIDO ----
Write-Host "[2/4] Generando carga: Login fallido (10 peticiones)..." -ForegroundColor Yellow
$loginBodyFail = '{"email":"noexiste@test.com","password":"wrongpassword"}'
$loginFailOk = 0

for ($i = 1; $i -le 10; $i++) {
    try {
        Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $loginBodyFail `
            -ErrorAction Stop
    } catch {
        # 403/401 esperado
        $loginFailOk++
    }
    Write-Progress -Activity "Login fallido" -Status "$i/10" -PercentComplete (($i / 10) * 100)
}
Write-Host "   → Respuestas 403/401 (esperado): $loginFailOk" -ForegroundColor Green

# ---- GET COCHES (público) ----
Write-Host "[3/4] Generando carga: GET /api/coches ($Repeticiones peticiones)..." -ForegroundColor Yellow
$cochesOk = 0

for ($i = 1; $i -le $Repeticiones; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/coches" -Method GET -ErrorAction Stop
        $cochesOk++
    } catch {
        # ignorar
    }
    Write-Progress -Activity "GET coches" -Status "$i/$Repeticiones" -PercentComplete (($i / $Repeticiones) * 100)
}
Write-Host "   → OK: $cochesOk" -ForegroundColor Green

# ---- GET COCHES CON JWT ----
Write-Host "[4/4] Generando carga: GET /api/coches con JWT ($Repeticiones peticiones)..." -ForegroundColor Yellow
$cochesJwtOk = 0

if ($jwtToken) {
    $headers = @{ "Authorization" = "Bearer $jwtToken" }
    for ($i = 1; $i -le $Repeticiones; $i++) {
        try {
            $response = Invoke-RestMethod -Uri "$BaseUrl/api/coches" -Method GET -Headers $headers -ErrorAction Stop
            $cochesJwtOk++
        } catch {
            # ignorar
        }
        Write-Progress -Activity "GET coches JWT" -Status "$i/$Repeticiones" -PercentComplete (($i / $Repeticiones) * 100)
    }
    Write-Host "   → OK con JWT: $cochesJwtOk" -ForegroundColor Green
} else {
    Write-Host "   → No se obtuvo JWT, saltando este paso" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Carga completada. Ahora en VisualVM:" -ForegroundColor Cyan
Write-Host "  1. Pulsa el boton 'Snapshot'" -ForegroundColor White
Write-Host "  2. File -> Save Snapshot As..." -ForegroundColor White
Write-Host "  3. Guarda como: profiling\visualvm-snapshot.nps" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
