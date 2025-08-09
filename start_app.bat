@echo off
echo Starting BlackReaper Application...
echo.
echo Starting Python Backend...
start cmd /k "cd backend && python app.py"
echo.
echo Opening application in your default browser...
timeout /t 3 > nul
start http://localhost:5000
echo.
echo BlackReaper is now running!
echo Press any key to exit this window. The application will continue running.
pause > nul
