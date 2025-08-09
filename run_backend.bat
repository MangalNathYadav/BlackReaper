@echo off
echo Starting BlackReaper Flask Backend...

REM Navigate to the backend directory
cd backend

REM Check for Python virtual environment
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    
    echo Installing requirements...
    pip install flask flask-cors
)

REM Run the Flask application
echo Starting Flask application...
python app.py

pause
