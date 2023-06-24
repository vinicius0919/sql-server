const axios = require("axios").default;
const dialogflow = require("dialogflow");

// Variables
const projectId = "consultabot-qedu";
const whatsAppToken = "EAAHV5TgwYToBAAKyzwk0ft8UlwMpDihgpZBWQmSPDt8GGc50ZCbqkZCZB6YL4juz1u01HX31303J0hFVP4ZCxY6AHJnXIVFZCU8yOJDPeHDyPr0haz9ZBuEtJM6PJPhAyTIdZBFZAgd9ZB5007gTaac2BBgcrdXDg5gelOMtyBNVxWFXkG9tmGkNKANC87p2tgJj2koEjUpmw7NAZDZD";
const verifyToken = "123";

// Dialogflow
const sessionClient = new dialogflow.SessionsClient();

exports.cloudAPI = async (req, res) => {
  // VERIFICATION

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

  // RESPONSE
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

      // Define Dialogflow Session
      const sessionPath = sessionClient.sessionPath(projectId, num);
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: msg_body,
            languageCode: "pt-BR",
          },
        },
      };

      // Get Dialogflow Responses
      try {
        const fulfillmentMessages = (
          await sessionClient.detectIntent(request)
        )[0].queryResult.fulfillmentMessages;
        for (const response of fulfillmentMessages) {
          let responseMsg = "";
          if (response.text) {
            for (const text of response.text.text) {
              responseMsg = `${responseMsg}${text}\n`;
            }
          }
          await sendMessage(to, num, responseMsg);
        }
      } catch (e) {
        console.log(e);
        res.sendStatus(403);
      }
      res.sendStatus(200);
    }
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
};

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
