param(
  [Parameter(Mandatory=$true)][string]$Server,
  [Parameter(Mandatory=$true)][string]$Pair
)

$ErrorActionPreference = 'Stop'
$Python = (Get-Command python -ErrorAction SilentlyContinue)
if (-not $Python) { $Python = Get-Command py -ErrorAction SilentlyContinue }
if (-not $Python) { throw 'Python 3 is required. Install Python 3, then run this installer again.' }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceAgent = Join-Path (Split-Path -Parent $ScriptDir) 'agent\bridge.py'
if (-not (Test-Path $SourceAgent)) { throw "Could not find $SourceAgent" }

$InstallDir = Join-Path $env:LOCALAPPDATA 'VioletLocalBridge'
$WorkRoot = Join-Path $env:USERPROFILE 'VioletBridge'
$Inbox = Join-Path $WorkRoot 'Inbox'
$Outbox = Join-Path $WorkRoot 'Outbox'
New-Item -ItemType Directory -Force -Path $InstallDir, $Inbox, $Outbox | Out-Null

$TargetAgent = Join-Path $InstallDir 'bridge.py'
Copy-Item -Force $SourceAgent $TargetAgent

$PythonExe = $Python.Source
if ($Python.Name -eq 'py.exe') {
  & $PythonExe -3 $TargetAgent pair --server $Server --code $Pair
  $TaskArgs = "-3 `"$TargetAgent`" run"
} else {
  & $PythonExe $TargetAgent pair --server $Server --code $Pair
  $TaskArgs = "`"$TargetAgent`" run"
}
if ($LASTEXITCODE -ne 0) { throw 'Pairing failed. Generate a new code in Violet Forge and retry.' }

$TaskName = 'VioletLocalBridge'
$Action = New-ScheduledTaskAction -Execute $PythonExe -Argument $TaskArgs
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Days 3650)
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName

$CmdPath = Join-Path $InstallDir 'violet-bridge.cmd'
if ($Python.Name -eq 'py.exe') {
  "@echo off`r`n`"$PythonExe`" -3 `"$TargetAgent`" %*" | Set-Content -Path $CmdPath -Encoding ASCII
} else {
  "@echo off`r`n`"$PythonExe`" `"$TargetAgent`" %*" | Set-Content -Path $CmdPath -Encoding ASCII
}

Write-Host ''
Write-Host 'Violet Local Bridge installed and started.'
Write-Host "Status: $CmdPath status"
Write-Host "Inbox:  $Inbox"
Write-Host "Outbox: $Outbox"
Write-Host "Logs:   $(Join-Path $InstallDir 'bridge.log')"
Write-Host ''
Write-Host 'Administrator commands will still show the normal Windows UAC confirmation prompt on this computer.'
