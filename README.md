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

- Clone this project.
- Copy `phone/scripts/config-sample.js` to `phone/scripts/config.js`
- Edit `phone/scripts/config.js` to reflect your sip account.
- Enable WSL in Browser using https://172.20.10.100:8089/httpstatus or https://172.20.10.100:8089/ws

SSL connections for are required for this to work!


## Dependencies

- [SIP.js](http://sipjs.com/)
- [Bootstrap](http://getbootstrap.com/)
- [FontAwesome](http://fortawesome.github.io/Font-Awesome/)
- [jQuery](http://jquery.com/)
- [Moment.js](http://momentjs.com/)

## Technologies

- Front End - HTML,CSS,Bootsrap,JavaScript
- Library - SIP JS
- Back End - Node with Express JS

