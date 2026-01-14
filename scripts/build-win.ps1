param(
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

Write-Host "Instalando dependências..."
npm ci

if (-not (Get-Command pkg -ErrorAction SilentlyContinue)) {
  Write-Host "O utilitário pkg não foi encontrado. Instale com: npm i -g pkg"
  exit 1
}

Write-Host "Gerando executável Windows..."
npm run build:win

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$zipPath = Join-Path $OutputDir "ClickPro-win.zip"
if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

Write-Host "Compactando artefatos..."
Compress-Archive -Path "$OutputDir/ClickPro.exe" -DestinationPath $zipPath

Write-Host "Build concluído: $zipPath"
