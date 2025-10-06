# PowerShell script to kill any process using port 5000
$port = 5000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }

if ($connections) {
    foreach ($conn in $connections) {
        $processId = $conn.OwningProcess
        Write-Host "Found process $processId using port $port. Killing..."
        try {
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "Process $processId killed successfully."
        } catch {
            Write-Host "Failed to kill process $processId : $($_.Exception.Message)"
        }
    }
    # Wait a moment for the port to be freed
    Start-Sleep -Seconds 2
} else {
    Write-Host "No process found using port $port."
}