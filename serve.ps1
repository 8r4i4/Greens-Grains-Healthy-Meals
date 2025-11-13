param(
  [int]$Port = 5173
)

$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host "Failed to start server: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "If access is denied, try a different port (e.g., 8080)."
  exit 1
}

Write-Host "Server running at $prefix" -ForegroundColor Green

$root = (Get-Location).Path

function Get-ContentType($path) {
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  switch ($ext) {
    ".html" { return "text/html; charset=utf-8" }
    ".css"  { return "text/css" }
    ".js"   { return "text/javascript" }
    ".png"  { return "image/png" }
    ".jpg"  { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".svg"  { return "image/svg+xml" }
    default  { return "application/octet-stream" }
  }
}

while ($true) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrEmpty($path)) { $path = "index.html" }
    $filePath = Join-Path $root $path

    if (-not (Test-Path $filePath)) {
      $response.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $response.ContentType = Get-ContentType $filePath
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
  } catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}