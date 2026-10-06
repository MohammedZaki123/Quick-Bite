# PowerShell script to generate file structure excluding .gitignore entries
$basePath = "C:\Users\Lenovo\IdeaProjects\Quick-Bite\Core-Service"
$gitignorePath = Join-Path $basePath ".gitignore"

# Read gitignore patterns
$gitignorePatterns = @()
if (Test-Path $gitignorePath) {
    $gitignorePatterns = @(Get-Content $gitignorePath | Where-Object { $_ -and -not $_.StartsWith("#") } | ForEach-Object { $_.Trim() })
}

function ShouldIgnore($relativePath) {
    foreach ($pattern in $gitignorePatterns) {
        # Handle leading slash (root level)
        $pattern = $pattern.TrimStart('/')

        # Handle trailing slash (directory only)
        if ($pattern.EndsWith('/')) {
            $pattern = $pattern.TrimEnd('/')
            if ($relativePath -match "^$([regex]::Escape($pattern))(/|$)") {
                return $true
            }
        }
        # Handle wildcards
        elseif ($pattern.Contains('*')) {
            $regexPattern = $pattern -replace '\*', '.*' -replace '\.', '\.'
            if ($relativePath -match $regexPattern) {
                return $true
            }
        }
        # Exact match
        else {
            if ($relativePath -eq $pattern -or $relativePath -match "^$([regex]::Escape($pattern))(/|$)") {
                return $true
            }
        }
    }
    return $false
}

# Get all items recursively
$items = @()
Get-ChildItem -Path $basePath -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
    $fullPath = $_.FullName
    $relativePath = $fullPath.Replace("$basePath\", "").Replace("$basePath", "")

    if (-not (ShouldIgnore $relativePath)) {
        $items += @{
            FullPath = $fullPath
            RelativePath = $relativePath
            IsDirectory = $_.PSIsContainer
            Name = $_.Name
        }
    }
}

# Build tree structure
$output = @()
$output += "# Quick-Bite Core Service - Project Structure"
$output += ""
$output += "## Navigation Tree"
$output += ""

# Sort items and build tree
$sorted = $items | Sort-Object { $_.RelativePath }

foreach ($item in $sorted) {
    $depth = ($item.RelativePath -split '\\').Count - 1
    $indent = "  " * $depth
    $icon = if ($item.IsDirectory) { "📁" } else { "📄" }
    $output += "$indent$icon $($item.Name)"
}

# Write to file
$outputFile = Join-Path $basePath "PROJECT_STRUCTURE.md"
$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✓ Project structure generated: $outputFile"
Write-Host "Total items: $($items.Count)"

