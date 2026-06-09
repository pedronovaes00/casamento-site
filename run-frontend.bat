@echo off
cd /d "%~dp0frontend"
set REACT_APP_BACKEND_URL=https://casamento-site-gvh4.onrender.com
yarn start
pause
