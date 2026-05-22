@echo off
set "PROJECT_ROOT=%~dp0"
set "NODE_HOME=%PROJECT_ROOT%.tools\node-v24.16.0-win-x64"
set "JAVA_HOME=%PROJECT_ROOT%.tools\jdk-21.0.11+10"
set "ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "VSCODE_BIN=%USERPROFILE%\AppData\Local\Programs\Microsoft VS Code\bin"
set "PATH=%NODE_HOME%;%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\emulator;%VSCODE_BIN%;%PATH%"

echo Dev environment activated.
echo Node:
node --version
echo npm:
call npm.cmd --version
echo pnpm:
call pnpm.cmd --version
echo Java:
java -version 2>&1
