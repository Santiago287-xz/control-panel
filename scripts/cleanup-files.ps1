# scripts/cleanup-files.ps1
Write-Host "🧹 Limpiando archivos innecesarios..." -ForegroundColor Yellow

# Eliminar carpetas completas
$foldersToDelete = @(
    "app\(root)\org\[orgSlug]\booking",
    "app\(root)\org\[orgSlug]\module",
    "app\api\org\[orgId]\booking"
)

foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        Write-Host "✅ Eliminado: $folder" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No existe: $folder" -ForegroundColor Yellow
    }
}

# Eliminar archivos específicos
$filesToDelete = @(
    "lib\hooks\useModuleAccess.ts",
    "components\modules\ModuleDataTable.tsx",
    "components\modules\ModuleDataForm.tsx", 
    "components\modules\ModuleDashboard.tsx",
    "components\ProtectedModule.tsx",
    "scripts\assign-modules.ts",
    "scripts\debug.ts",
    "lib\modules\schemas.ts",
    "lib\services\users.ts",
    "lib\auth\tokens.ts"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item -Force $file
        Write-Host "✅ Eliminado: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No existe: $file" -ForegroundColor Yellow
    }
}

# Crear carpetas necesarias
$foldersToCreate = @(
    "components\modules\booking",
    "components\modules\pos", 
    "components\modules\users",
    "components\modules\analytics"
)

foreach ($folder in $foldersToCreate) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "✅ Creado: $folder" -ForegroundColor Green
    }
}

Write-Host "🎉 Limpieza completada!" -ForegroundColor Green