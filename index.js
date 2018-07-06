require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const APP_TOKEN = process.env.APP_TOKEN

const app = express();
app.use(bodyParser.json());

const port = process.env.APP_PORT
app.listen(port, function () {
  console.log(`El servidor se encuentra en el puerto ${port}`);
});

app.get('/', function (req, res) {
  res.send('Bienvenido al jnebot server');
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.APP_AUTH) {
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

const receiveMessage = (event) => {
  let senderID = event.sender.id;
  let messageText = event.message.text;
  console.log(messageText, senderID)
  evaluateMessage(senderID, messageText)
}

const evaluateMessage = (recipientId, message) => {
  let finalMessage = ''
  // Logica de para evaluar los mensajes entrantes
  if (isContain(message, 'ayuda')) {
    finalMessage = `Por el momento no te puedo ayudar`
  } else if (isContain(message, 'jne')) {
    sendMessageImg(recipientId)
  } else if (isContain(message, 'info')) {
    sendMessageTemplate(recipientId)
  } else {
    finalMessage = `mensage repetido de prueba: ${message}`
  }
  console.log(finalMessage)
  sendMessageText(recipientId, finalMessage)
}

const sendMessageTemplate = (recipientId) => {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [elementTemplate()]
        }
      }
    }
  }
  callSendAPI(messageData)
}

const elementTemplate = () => {
  return {
    title: 'JNE Hackaton',
    subtitle: 'Hackton 2018',
    item_url: 'http://www.votoinformado.pe/voto/index.html',
    image_url: 'http://www.democraciadigital.pe/sites/default/files/hackaton_banner_web.jpg',
    buttons: [buttonTemplate()]
  }
}

const buttonTemplate = () => {
  return {
    type: 'web_url',
    url: 'http://www.votoinformado.pe/voto/index.html',
    title: 'Ingresar'
  }
}

const sendMessageImg = (recipientId) => {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: 'http://www.democraciadigital.pe/sites/default/files/hackaton_banner_web.jpg'
        }
      }
    }
  }
  callSendAPI(messageData)
}

const sendMessageText = (recipientId, message) => {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: message
    }
  }
  callSendAPI(messageData)
}

const callSendAPI = (messageData) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: APP_TOKEN },
    method: 'POST',
    json: messageData
  }, (error, reponse, data) => {
    if (error) {
      console.log('No se envio el mensage por un error')
    } else {
      console.log('Mensaje enviado')
    }
  })
}

const isContain = (sentence, word) => {
  return sentence.indexOf(word) > -1
}

