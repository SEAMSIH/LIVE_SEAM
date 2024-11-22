const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  const url =
    "https://tfhub.dev/mediapipe/tfjs-model/face_detection/short/1/model.json";
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Proxy running on http://localhost:3000"));
