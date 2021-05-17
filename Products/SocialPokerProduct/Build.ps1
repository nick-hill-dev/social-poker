$ErrorActionPreference = "Stop"

$serverPath = "$PSScriptRoot\..\..\Application Server\WSRelay\(mono)" 
$websitePath = "$PSScriptRoot\..\..\Games\SocialPoker\(version1)"

Write-Host "WebSocket Relay Server..." -ForegroundColor Cyan

dotnet build "$serverPath"

Write-Host "SocialPoker Website..." -ForegroundColor Cyan

tsc -b "$websitePath"

Write-Host "Assemble artifact..." -ForegroundColor Cyan

If (Test-Path "Built") {
    Remove-Item "Built" -Recurse
}

New-Item -ItemType Directory -Path "Built\Server" | Out-Null
Copy-Item "$serverPath\bin\Debug\*.*" "Built\Server"

New-Item -ItemType Directory -Path "Built\Client" | Out-Null
New-Item -ItemType Directory -Path "Built\Client\images" | Out-Null
New-Item -ItemType Directory -Path "Built\Client\data" | Out-Null
Copy-Item "$websitePath\*.html" "Built\Client"
Copy-Item "$websitePath\*.css" "Built\Client"
Copy-Item "$websitePath\*.js" "Built\Client"
Copy-Item "$websitePath\images\*.*" "Built\Client\images"
Copy-Item "$websitePath\data\*.*" "Built\Client\data"

start "Built"