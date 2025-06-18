$directories = @(
    "Actions",
    "Domain",
    "Http",
    "Jobs",
    "Observers",
    "Providers",
    "Queries",
    "Repositories",
    "Services"
)

foreach ($dir in $directories) {
    $path = "D:\Apps\snd_rentalreact_app\Modules\ProjectManagement\$dir"
    if (Test-Path $path) {
        Write-Host "Processing $dir..."
        $files = Get-ChildItem -Path $path -Recurse -Filter "*.php"
        foreach ($file in $files) {
            Write-Host "  Updating $($file.FullName)"
            $content = Get-Content -Path $file.FullName
            $updatedContent = $content -replace 'Modules\\\\ProjectManagementManagement', 'Modules\\ProjectManagement'
            $updatedContent = $updatedContent -replace 'Modules\\\\ProjectManagement', 'Modules\ProjectManagement'
            Set-Content -Path $file.FullName -Value $updatedContent
        }
    }
}
