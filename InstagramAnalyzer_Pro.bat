@echo off
setlocal enabledelayedexpansion
title Instagram Influencer Analyzer Pro v1.0
color 0A

echo ================================================================
echo          Instagram Influencer Analyzer Pro v1.0
echo ================================================================
echo.

REM 임시 파일 설정
set "API_PID_FILE=%TEMP%\instagram_analyzer_api.pid"
set "WEB_PID_FILE=%TEMP%\instagram_analyzer_web.pid"

REM 종료 시 정리
if "%1"=="cleanup" goto :cleanup

REM Python 설치 확인
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python이 설치되어 있지 않습니다!
    echo         https://www.python.org 에서 Python을 설치해주세요.
    echo.
    pause
    exit /b 1
)

REM Node.js 설치 확인
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js가 설치되어 있지 않습니다!
    echo         https://nodejs.org 에서 Node.js를 설치해주세요.
    echo.
    pause
    exit /b 1
)

REM config.json 확인
if not exist config.json (
    echo [WARNING] config.json 파일이 없습니다.
    echo.
    echo Instagram 로그인 정보를 입력해주세요:
    set /p IG_USER="Instagram ID: "
    set /p IG_PASS="Instagram Password: "
    
    echo { > config.json
    echo   "instagram": { >> config.json
    echo     "username": "!IG_USER!", >> config.json
    echo     "password": "!IG_PASS!" >> config.json
    echo   } >> config.json
    echo } >> config.json
    
    echo.
    echo config.json 파일이 생성되었습니다.
    echo.
)

REM 포트 확인
netstat -an | find "LISTENING" | find ":8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] 포트 8000이 이미 사용 중입니다.
    echo           기존 서버를 종료합니다...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

netstat -an | find "LISTENING" | find ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] 포트 3000이 이미 사용 중입니다.
    echo           기존 서버를 종료합니다...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo [1/4] 필요한 패키지를 확인합니다...

REM Python 패키지 확인
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo       FastAPI 설치 중...
    pip install fastapi uvicorn selenium instaloader pandas numpy
)

REM Node 패키지 확인
if not exist dashboard\node_modules (
    echo       Node.js 패키지 설치 중...
    cd dashboard
    npm install
    cd ..
)

echo [2/4] API 서버를 시작합니다...
start /b cmd /c "cd dashboard\api && python crawl_realtime.py 2>&1"
timeout /t 3 /nobreak >nul

echo [3/4] 웹 서버를 시작합니다...
start /b cmd /c "cd dashboard && npm run dev 2>&1"
timeout /t 5 /nobreak >nul

echo [4/4] 브라우저를 엽니다...
timeout /t 2 /nobreak >nul
start http://localhost:3000

cls
echo ================================================================
echo          Instagram Influencer Analyzer Pro v1.0
echo ================================================================
echo.
echo   [STATUS] 서버가 성공적으로 시작되었습니다!
echo.
echo   웹 인터페이스: http://localhost:3000
echo   API 서버:      http://localhost:8000
echo.
echo   [명령어]
echo   R - 서버 재시작
echo   S - 서버 상태 확인
echo   Q - 종료
echo.
echo ================================================================
echo.

:menu
set /p choice="명령을 입력하세요 (R/S/Q): "

if /i "%choice%"=="R" goto :restart
if /i "%choice%"=="S" goto :status
if /i "%choice%"=="Q" goto :cleanup
goto :menu

:restart
echo.
echo 서버를 재시작합니다...
goto :cleanup_silent
start InstagramAnalyzer_Pro.bat
exit

:status
echo.
echo [서버 상태 확인]
netstat -an | find "LISTENING" | find ":8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo   API 서버: 실행 중 [OK]
) else (
    echo   API 서버: 중지됨 [ERROR]
)

netstat -an | find "LISTENING" | find ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo   웹 서버: 실행 중 [OK]
) else (
    echo   웹 서버: 중지됨 [ERROR]
)
echo.
goto :menu

:cleanup
echo.
echo 서버를 종료합니다...

:cleanup_silent
REM 포트 8000 프로세스 종료
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM 포트 3000 프로세스 종료
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Python 프로세스 종료
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *crawl_realtime*" >nul 2>&1

REM Node 프로세스 종료
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *npm*" >nul 2>&1

if "%1"=="cleanup" (
    echo 정리 완료!
) else (
    echo.
    echo 프로그램을 종료합니다. 감사합니다!
    timeout /t 2 /nobreak >nul
)
exit /b 0