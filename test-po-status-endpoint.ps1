$headers = @{
    'Authorization' = 'Bearer test-token'
    'Content-Type' = 'application/json'
}

$body = @{
    status = 'sent'
    notes = 'Testing endpoint'
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/procurement/pos/1/status' `
        -Method PUT `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response.StatusCode)"
}