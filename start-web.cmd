@echo off
cd /d "%~dp0"
call dev-env.cmd
call pnpm.cmd dev
