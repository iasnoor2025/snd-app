# PowerShell script to generate a quotation for rental ID 4
# Prompts for CSRF token and (optionally) cookies

param(
    [string]$RentalId = "4",
    [string]$BaseUrl = "https://snd-app.test",
    [string]$CsrfToken
)

if (-not $CsrfToken) {
    $CsrfToken = Read-Host "Enter your X-CSRF-TOKEN (from browser dev tools)"
}

# Optionally, prompt for cookies (copy from browser if needed)
$Cookies = Read-Host "Paste your session cookies (optional, press Enter to skip)"

$headers = @{
    "X-Requested-With" = "XMLHttpRequest"
    "X-CSRF-TOKEN" = $CsrfToken
}

if ($Cookies) {
    $headers["Cookie"] = $Cookies
}

$url = "$BaseUrl/rentals/$RentalId/generate-quotation"

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Headers $headers -UseBasicParsing
    Write-Host "Response status code: $($response.StatusCode)"
    Write-Host "Response body: $($response.Content)"
} catch {
    Write-Host "Request failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Error response: $body"
    }
}
