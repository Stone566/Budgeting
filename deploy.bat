@echo off
chcp 65001 >nul
echo ==========================================
echo     Budgeting PWA 部署工具
echo ==========================================
echo.

REM 检查是否安装了npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到npm，请先安装Node.js
    pause
    exit /b 1
)

echo [1/4] 正在清理旧构建...
if exist dist rmdir /s /q dist

echo [2/4] 正在安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo [3/4] 正在构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
)

echo [4/4] 构建完成！
echo.
echo ==========================================
echo     构建成功！
echo ==========================================
echo.
echo 输出目录: dist\
echo.
echo 部署选项：
echo 1. 手动部署到Netlify：
echo    - 登录 https://www.netlify.com/
echo    - 拖放 dist 文件夹到部署区域
echo.
echo 2. 使用Netlify CLI部署：
echo    - npm install -g netlify-cli
echo    - netlify deploy --prod --dir=dist
echo.
echo 3. 连接到Git仓库自动部署
echo.
echo 按任意键退出...
pause >nul
