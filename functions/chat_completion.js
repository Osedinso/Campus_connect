// index.js

const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
const {OpenAI} = require("openai");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Define the secret for OpenAI API Key
// eslint-disable-next-line max-len
const OPENAI_API_KEY = "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";

exports.chatCompletion = onRequest(
    {
      region: "us-central1", // Replace with your region if different
    // Uncomment the following line to allow unauthenticated access
    // accessControl: { allowUnauthenticated: true },
    },
    async (req, res) => {
      cors(req, res, async () => {
        try {
        // Handle preflight requests
          if (req.method === "OPTIONS") {
            res.set("Access-Control-Allow-Methods", "POST");
            res.set("Access-Control-Allow-Headers", "Content-Type");
            res.status(204).send("");
            return;
          }

          // Extract the prompt from the request body
          const {prompt} = req.body;

          if (!prompt) {
            res.status(400).send({error: "No prompt provided"});
            return;
          }

          // Initialize OpenAI API with the API key
          const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
          });

          const messages = [
            {role: "system", content: "You are a helpful assistant."},
            {role: "user", content: prompt},
          ];

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
          });

          const aiResponse = completion.choices[0].message.content.trim();
          res.status(200).send({aiResponse});
        } catch (error) {
          console.error("Error in chatCompletion function:", error);
          res.status(500).send({error: error.message});
        }
      });
    },
);
