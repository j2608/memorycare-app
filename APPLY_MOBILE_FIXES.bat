@echo off
REM ============================================
REM MOBILE APK FIX - QUICK APPLY SCRIPT
REM Run this to apply all mobile fixes and rebuild APK
REM ============================================

echo.
echo ========================================
echo MOBILE APK FIX - AUTO APPLY
echo ========================================
echo.

echo Step 1: Copying updated files to www folder...
copy /Y caregiver.html www\caregiver.html
copy /Y caregiver.js www\caregiver.js
copy /Y patient.html www\patient.html
copy /Y patient.js www\patient.js
copy /Y styles.css www\styles.css
copy /Y role-selection.html www\role-selection.html
copy /Y index.html www\index.html

echo.
echo Step 2: Syncing with Capacitor...
call npx cap sync android

echo.
echo Step 3: Cleaning Android build...
cd android
call gradlew clean
cd ..

echo.
echo Step 4: Building APK...
cd android
call gradlew assembleDebug
cd ..

echo.
echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Your APK is ready at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next steps:
echo 1. Transfer APK to your phone
echo 2. Install the APK
echo 3. Test all features:
echo    - Caregiver: Create session and navigate dashboard
echo    - Patient: Login and test all buttons
echo.
pause
