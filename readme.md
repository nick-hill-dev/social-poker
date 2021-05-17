# SocialPoker

Version 1 of Social Poker, including the website and the WebSocket Relay server (for Windows and Mono).

## Build Prerequisites

* MSBuild (dotnet.exe).
* TypeScript Compiler (tsc.exe).
* PowerShell (for Build.ps1, otherwise run the commands manually).

## Build Steps

* Navigate to the Products/SocialPokerProduct directory.
* Execute Build.ps1 using PowerShell.
* If not using PowerShell, run the following commands:
    * `dotnet build "..\..\Application Server\WSRelay\(mono)"`
    * `tsc -b "..\..\Games\SocialPoker\(version1)"`

The result is a directory within the SocialPokerProduct directory named Built, which contains the website and the WebSocket Relay server.

If not using PowerShell, find the build results manually within the above two folders.

## Deployment of WebSocket Relay Server

Install the WebSocket Relay server onto a Windows machine or a Linux machine.

If installing onto Linux, you will need mono.

The WebSocket Relay server can run as a console application, a Windows service or as a /etc/init.d service.

Make sure to configure the WebSocket Relay server by editing WSRelay.exe.config. You might want to change the port number.

For Linux environments using /etc/init.d, you might find the following shell script useful for starting and stopping the service using mono via the command line. You can also ensure the service starts up automatically.

```
#!/bin/bash

APPROOT=/var/wsrelayserver
LOCK_FILE=$APPROOT/WSRelay.lock
EXECUTABLE=$APPROOT/WSRelay.exe

start() {
  if [ -f $LOCK_FILE ] && kill -0 `cat $LOCK_FILE`; then
    echo 'WSRelay service is already running.' >&2
    return 1
  fi
  echo 'Starting WSRelay service...' >&2
  mono-service -d:$APPROOT -l:$LOCK_FILE -m:wsrelayserver $EXECUTABLE
  echo 'Started.' >&2
}
 
stop() {
  echo 'Stopping WSRelay service...' >&2
  if [ ! -f "$LOCK_FILE" ] || ! kill -0 `cat $LOCK_FILE`; then
    echo 'WSRelay service is not running.' >&2
    return 1
  fi
  kill `cat $LOCK_FILE`
  rm -f $LOCK_FILE
  echo 'Stopped.' >&2
}
 
case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
esac
```

## Deployment of SocialPoker Website

The Social Poker website is a simple HTML website with Javascript, therefore it can be hosted on any web server.

Make sure to edit the server.json file to specify the address of your WebSocket Relay server.