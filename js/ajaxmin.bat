:: AjaxMinifier > minify all js or css files in a folder and subfolders
::---------------------------------------------
:: mohammadhasan.behzadi@gmail.com
:: 
::---------------------------------------------
::               steps
:: --------------------------------------------
:: 1- downoad and install ajaxminifier from http://ajaxmin.codeplex.com/
:: 2- put this file in your js or css folder or root of your website for all files
:: 3- run bat file and enjoy it ;)
::---------------------------------------------
:: [notic]:[all the file in that folder and subfolders with .js or .css extenten will be minified in sepreate file]

@ECHO OFF 
SETLOCAL
SETLOCAL ENABLEDELAYEDEXPANSION
if exist "C:\Program Files\Microsoft\Microsoft Ajax Minifier\AjaxMin.exe" (
 set PPATH="C:\Program Files\Microsoft\Microsoft Ajax Minifier\AjaxMin.exe"
) else (
 set PPATH="C:\Program Files (x86)\Microsoft\Microsoft Ajax Minifier\AjaxMin.exe"
) 

if exist  "C:\Program Files(x86)\Microsoft\Microsoft Ajax Minifier\AjaxMin.exe" (
 set PPATH="C:\Program Files(x86)\Microsoft\Microsoft Ajax Minifier\AjaxMin.exe"
)

:: js
for /r %%f  in (*.js) do (
			
	echo.%%~nf | findstr /C:min 1>nul	
	
	if errorlevel 1 (
	  %PPATH% %%f -o %%~nf.min.js
	  echo. -------------------------------------------------------------------
	)
)

:: css
for /r %%f  in (*.css) do (
	
	echo.%%~nf | findstr /C:min 1>nul	
	
	if errorlevel 1 (
	  %PPATH% %%f -o %%~nf.min.css
	  echo. -------------------------------------------------------------------
	)
)



if exist %PPATH% ECHO. All files has been minified.. :)
ECHO. Press any key...
pause > nul