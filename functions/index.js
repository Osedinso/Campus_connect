const express = require("express");
const cors = require("cors");
const {chatCompletion} = require("./chat_completion");

const app = express();
app.use(cors({origin: true}));

exports.chatCompletion = chatCompletion;
