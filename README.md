# Asterisk-Voice-Call-Agent-App

A Javascript SIP client based on [SIP.js](http://sipjs.com/) (SIP version 0.7.8).

This is a Javascript based SIP client that uses WebRTC and WebSockets to connect to your SIP server.  The UI is designed to be launched as a popup from within your application.  

## Features

- Audio only, Hold / Resume, Mute, multiple call support.
- No plugins required, Works with WebSocket / WebRTC enabled browsers. (Firefox & Chrome.)
- Intuitive interface makes it easy for users.
- Easy to configure and integrate into your project.

## Getting Started

You will need a sip account on a server that supports SIP over websockets.Use Asterisk Installed Server.

- Clone this project
- `cd server` and install node modules using `npm install`
- Create .env file as you want and add it is server folder
- .env Sample 
```
DB_HOST=mysql_db_server_ip 
DB_USER=mysql_db_user
DB_PASSWORD=mysql_db_password
DB_DATABASE=mysql_db_database_name
DB_PORT=3306
````

- Enable WSL in Browser using https://172.20.10.100:8089/httpstatus or https://172.20.10.100:8089/ws

SSL connections are required to work this !


## Dependencies

- [SIP.js](http://sipjs.com/)
- [Bootstrap](http://getbootstrap.com/)
- [FontAwesome](http://fortawesome.github.io/Font-Awesome/)
- [jQuery](http://jquery.com/)
- [Moment.js](http://momentjs.com/)

## Technologies

- Front End - HTML,CSS,Bootsrap,JavaScript
- Library - SIP JS
- Back End - NodeJS with Express JS

