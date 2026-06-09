@echo off
cd /d "%~dp0frontend"
set REACT_APP_BACKEND_URL=https://casamento-presentes-1.preview.emergentagent.com
yarn start
pause
