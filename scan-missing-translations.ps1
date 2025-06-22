# Scan for Missing Translation Keys
# This script scans all TypeScript/JavaScript files for translation keys and generates missing translations

Write-Host "Scanning for missing translation keys..." -ForegroundColor Green

# Get all TypeScript and JavaScript files
$files = Get-ChildItem -Path "Modules" -Recurse -Include "*.tsx", "*.ts", "*.jsx", "*.js" | 
    Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "build" }

$translationKeys = @{}
$moduleKeys = @{}

# Extract translation keys from files
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Find t('key') and t("key") patterns
    $matches = [regex]::Matches($content, "t\(['\`"]([^'\`"]+)['\`"]\)")
    
    foreach ($match in $matches) {
        $key = $match.Groups[1].Value
        
        # Skip keys that contain variables or complex expressions
        if ($key -notmatch '\$\{' -and $key -notmatch '\+' -and $key -notmatch 'undefined' -and $key.Length -lt 100) {
            # Determine module from file path
            if ($file.FullName -match "Modules\\([^\\]+)") {
                $module = $matches.Groups[1].Value
                
                if (-not $moduleKeys.ContainsKey($module)) {
                    $moduleKeys[$module] = @{}
                }
                
                # Determine namespace (assume first part before . or whole key)
                if ($key -match '^([^:]+):(.+)$') {
                    # Handle namespace:key format
                    $namespace = $matches.Groups[1].Value
                    $actualKey = $matches.Groups[2].Value
                } elseif ($key -match '^([^.]+)\.') {
                    # Handle namespace.key format
                    $namespace = $matches.Groups[1].Value
                    $actualKey = $key
                } else {
                    # Default namespace based on module
                    switch ($module) {
                        "TimesheetManagement" { $namespace = "timesheet" }
                        "EmployeeManagement" { $namespace = "employee" }
                        "ProjectManagement" { $namespace = "project" }
                        "RentalManagement" { $namespace = "rental" }
                        "CustomerManagement" { $namespace = "customer" }
                        "Core" { $namespace = "common" }
                        default { $namespace = $module.ToLower() }
                    }
                    $actualKey = $key
                }
                
                if (-not $moduleKeys[$module].ContainsKey($namespace)) {
                    $moduleKeys[$module][$namespace] = @{}
                }
                
                $moduleKeys[$module][$namespace][$actualKey] = $actualKey
            }
        }
    }
}

# Generate translation files
foreach ($module in $moduleKeys.Keys) {
    foreach ($namespace in $moduleKeys[$module].Keys) {
        $translationFile = "Modules/$module/resources/lang/en/$namespace.json"
        
        Write-Host "Processing $translationFile" -ForegroundColor Yellow
        
        # Load existing translations
        $existing = @{}
        if (Test-Path $translationFile) {
            try {
                $existingContent = Get-Content $translationFile -Raw | ConvertFrom-Json
                if ($existingContent -is [PSCustomObject]) {
                    $existingContent.PSObject.Properties | ForEach-Object {
                        $existing[$_.Name] = $_.Value
                    }
                }
            } catch {
                Write-Host "Warning: Could not parse existing $translationFile" -ForegroundColor Red
            }
        }
        
        # Add missing keys
        $updated = $false
        foreach ($key in $moduleKeys[$module][$namespace].Keys) {
            if (-not $existing.ContainsKey($key)) {
                # Generate human-readable translation
                $translation = $key -replace '_', ' ' -replace '([a-z])([A-Z])', '$1 $2'
                $translation = (Get-Culture).TextInfo.ToTitleCase($translation.ToLower())
                
                # Handle specific prefixes
                if ($key -match '^lbl_') {
                    $translation = $key -replace '^lbl_', '' -replace '_', ' '
                    $translation = (Get-Culture).TextInfo.ToTitleCase($translation.ToLower())
                } elseif ($key -match '^ph_') {
                    $translation = $key -replace '^ph_', '' -replace '_', ' '
                    $translation = (Get-Culture).TextInfo.ToTitleCase($translation.ToLower())
                } elseif ($key -match '^btn_') {
                    $translation = $key -replace '^btn_', '' -replace '_', ' '
                    $translation = (Get-Culture).TextInfo.ToTitleCase($translation.ToLower())
                } elseif ($key -match '^msg_') {
                    $translation = $key -replace '^msg_', '' -replace '_', ' '
                    $translation = (Get-Culture).TextInfo.ToTitleCase($translation.ToLower())
                } elseif ($key -match '^ttl_') {
                    $translation = $key -replace '^ttl_', '' -replace '_', ' '
                    $translation = (Get-Culture).TextInfo.ToTitleCase($translation.ToLower())
                }
                
                $existing[$key] = $translation
                $updated = $true
                Write-Host "  + Added: $key = $translation" -ForegroundColor Green
            }
        }
        
        # Save updated translations
        if ($updated) {
            # Ensure directory exists
            $dir = Split-Path $translationFile -Parent
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
            }
            
            # Convert to JSON and save
            $existing | ConvertTo-Json -Depth 10 | Set-Content $translationFile -Encoding UTF8
            Write-Host "  Updated $translationFile" -ForegroundColor Cyan
        }
    }
}

Write-Host "Translation scan completed!" -ForegroundColor Green 