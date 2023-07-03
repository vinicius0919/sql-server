// Import the packages we need
const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();
const axios = require("axios").default;

// Your credentials
const CREDENTIALS = require('./keys')


const whatsAppToken = "EAAHV5TgwYToBACsikjoUkphqJznrICHXiHU3yxW7CI758YKIhiiBo9ZBqupMib9ILyrWuhRWRVJvlkZBuNjcK67iJH44wpupgkRTcdZAWaMUGzNogVVCYLjYof7pftuDLtztZC1g2GzRPTztJfVgZCIxRU5Jem3l3QOnWL8WkYb1kEMmvLypIvozO58KLw1pvu3V3EgDmOQZDZD";
const verifyToken = "123";



//console.log(CREDENTIALS.project_id)
// Other way to read the credentials
// const fs = require('fs');
// const CREDENTIALS = JSON.parse(fs.readFileSync('File path'));

// Your google dialogflow project-id
const PROJECID = CREDENTIALS.project_id;

// Configuration for the client
const CONFIGURATION = {
    credentials: {
        private_key: CREDENTIALS.private_key,
        client_email: CREDENTIALS.client_email
    }
}

//console.log(CREDENTIALS.googleProjectId, CONFIGURATION)
// Create a new session
const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

// Detect intent method
const detectIntent = async (req, res) => {

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      // Get Variables

      let to = req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      let num = from.slice(0,4) + "9" + from.slice(4);
      console.log("to: ", to, "\n from: ", from, "\n num: ", num, "\n msg: ", msg_body)
      let sessionPath = sessionClient.projectAgentSessionPath(PROJECID, num);
  
      // The text query request.
      let request = {
          session: sessionPath,
          queryInput: {
              text: {
                  // The query to send to the dialogflow agent
                  text: msg_body,
                  // The language used by the client (en-US)
                  languageCode: "pt-BR",
              },
          },
      };
  

      // Send request and log result
      const responses = await sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      console.log(result.fulfillmentText);
      //console.log(result.fulfillmentText);
      sendMessage(to, num, result.fulfillmentText)
      }
      res.sendStatus(200)
  }
}
  const sendMessage = async (to, num, msg_body) => {
    await axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v17.0/" +
        to +
        "/messages?access_token=" +
        whatsAppToken,
      data: {
        messaging_product: "whatsapp",
        to: num,
        text: { body: msg_body },
      },
      headers: { "Content-Type": "application/json" },
    });
  };

module.exports={detectIntent, sendMessage}