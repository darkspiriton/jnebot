var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const APP_TOKEN = '---'

var app = express();
app.use(bodyParser.json());

app.listen(3000, function () {
  console.log("El servidor se encuentra en el puerto 3000");
});

app.get('/', function (req, res) {
  res.send('Bienvenido al jnebot server');
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === 'test_token_say_hello') {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('No tiene acceso');
  }
});

app.post('/webhook', (req, res) => {
  let data = req.body
  if (data.object === 'page') {
    data.entry.forEach(pageEntry => {
      pageEntry.messaging.forEach((messageEvent) => {
        if (messageEvent.message) {
          receiveMessage(messageEvent)
        }

      })
    });
    res.sendStatus(200);
  }
});

const receiveMessage = (event) =>{
  let senderID = event.sender.id;
  let messageText = event.message.text;
  console.log(messageText, senderID)
}
