@echo off
echo ======================================================
echo   Installation du Telegram PDF Transfer Bot
echo ======================================================

:: 1. Vérification du fichier .env
if not exist .env (
    echo [1/3] Creation du fichier .env depuis l'exemple...
    copy .env.example .env
    echo MERCI DE MODIFIER LE FICHIER .env AVEC VOS ACCES POSTGRESQL !
    pause
) else (
    echo [1/3] Fichier .env deja present.
)

:: 2. Initialisation de la base de données
echo [2/3] Initialisation de la base de donnees...
:: On utilise le script d'initialisation direct au lieu de drizzle-kit push qui pose problème sur Windows
call npx tsx scripts/init-db.ts
if %errorlevel% neq 0 (
    echo ERREUR : Impossible d'initialiser la base de donnees. 
    echo Verifiez que PostgreSQL est lance et que DATABASE_URL dans .env est correct.
    pause
    exit /b %errorlevel%
)

:: 3. Lancement de l'application
echo [3/3] Lancement de l'application...
echo L'application sera accessible sur http://localhost:5000
start "" "telegram-bot.exe"

echo Installation terminee !
pause
