const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

// --- CONFIGURATION ---
const app = express();
const PROJECT_ID = 'real-time-chat-agent-tofs';
const PORT = 3000;

// 1. Setup Google Authentication using Service Account Key
// This allows our server to securely communicate with Dialogflow API
const auth = new GoogleAuth({
  keyFilename: './key.json',
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// 2. Create HTTP & WebSocket Server
// Using a unified server ensures the frontend can connect to the same port
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize a unique Session ID to track the conversation state in Dialogflow
let sessionId = Math.random().toString(36).substring(7);

console.log(`[SYSTEM] Initialized with Session ID: ${sessionId}`);

// --- WEBSOCKET CONNECTION HANDLER ---
wss.on('connection', (ws) => {
  console.log(`[CONNECTION] Client connected at ${new Date().toLocaleTimeString()}`);

  ws.on('message', async (message) => {
    try {
      const userText = message.toString().trim();
      if (!userText) return; // Ignore empty messages

      console.log(`[USER] Message received: "${userText}"`);

      // --- LOGIC: CONVERSATIONAL REPAIR (RESET) ---
      // If the user says 'no', we force a hard reset of the session.
      // This wipes the bot's memory so they can correct mistakes.
      if (userText.toLowerCase() === 'no') {
        sessionId = Math.random().toString(36).substring(7); // Generate new ID
        console.log(`[SYSTEM] Session Reset. New ID: ${sessionId}`);
        ws.send("Booking cancelled. Let's start over! Where are you flying from?");
        return; 
      }

      // --- DIALOGFLOW API INTEGRATION ---
      // Fetch fresh Access Token for every request to prevent timeout errors
      const client = await auth.getClient();
      const token = await client.getAccessToken();
      const url = `https://dialogflow.googleapis.com/v2/projects/${PROJECT_ID}/agent/sessions/${sessionId}:detectIntent`;

      console.log(`[API] Sending request to Dialogflow...`);

      const response = await axios.post(url, {
        queryInput: { 
          text: { 
            text: userText, 
            languageCode: 'en-US' 
          } 
        },
      }, {
        headers: { 
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json'
        }
      });

      // Extract results from Dialogflow response
      let botResponse = response.data.queryResult.fulfillmentText;
      const params = response.data.queryResult.parameters || {};

      // --- LOGIC: CUSTOM VALIDATION INTERCEPT ---
      // Standard Dialogflow doesn't block "Karachi to Karachi". 
      // This logic checks if both cities are identified and if they match.
      if (params.departure_city && params.destination_city) {
        const dep = params.departure_city.toLowerCase();
        const dest = params.destination_city.toLowerCase();

        if (dep === dest) {
          console.log(`[VALIDATION] Match detected: ${dep} == ${dest}. Intercepting...`);
          botResponse = `Wait! You cannot fly from ${params.departure_city} to ${params.destination_city}. Please type 'no' to start again and pick a different destination.`;
        }
      }

      // Send the final response back to the Chat UI
      ws.send(botResponse);
      console.log(`[BOT] Response sent: "${botResponse}"`);

    } catch (err) {
      console.error(`[ERROR] Internal Error: ${err.message}`);
      if (err.response) console.error(`[API ERROR] Status: ${err.response.status}`);
      ws.send("I'm having trouble connecting to the booking service. Please check your key.json file.");
    }
  });

  ws.on('close', () => {
    console.log(`[CONNECTION] Client disconnected.`);
  });
});

// --- START SERVER ---
server.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 FLIGHT AGENT SERVER LIVE ON PORT: ${PORT}`);
  console.log(`📁 KEY FILE: ./key.json`);
  console.log(`🤖 PROJECT ID: ${PROJECT_ID}`);
  console.log(`==============================================\n`);
});