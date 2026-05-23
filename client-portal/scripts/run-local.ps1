$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker compose up -d mongo
Set-Location "src/ConstructionClientPortal.Api"
dotnet restore
dotnet run
