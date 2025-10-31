$uri = 'http://localhost:5000/api/inventory/allocations/projects-overview'

try {
    $response = Invoke-WebRequest -Uri $uri `
        -Headers @{'Authorization' = 'Bearer test'} `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "✅ Status Code: $($response.StatusCode)"
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ Projects found: $($json.data.Count)"
    Write-Host "✅ Sample data:"
    $json.data | Select-Object -First 1 | ConvertTo-Json
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    if ($_.Exception.Response.StatusCode -eq 'Forbidden') {
        Write-Host "✅ Endpoint exists (403 = auth required)"
    } else {
        Write-Host "Error: $($_.Exception.Message)"
    }
}