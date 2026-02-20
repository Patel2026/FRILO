$phpIniPath = "C:\xampp\php\php.ini"

if (Test-Path $phpIniPath) {
    $content = Get-Content $phpIniPath
    $newContent = $content -replace ';extension=intl', 'extension=intl'
    Set-Content $phpIniPath $newContent
    Write-Host "L'extension intl a été activée dans $phpIniPath."
    Write-Host "Veuillez redémarrer votre serveur Apache/PHP pour que les modifications prennent effet."
} else {
    Write-Host "Fichier php.ini introuvable à $phpIniPath."
}
