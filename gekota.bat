@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe" gekota.js %1
) ELSE (
  node gekota.js %1
)