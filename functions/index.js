const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const firebaseConfig = require("./firebaseConfig");

app.use(bodyParser.json());
const serviceAccountKey = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: firebaseConfig.databaseURL,
});

const tokens = [];

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.post("/register", (req, res) => {
  tokens.push(req.body.token);
  res.status(200).json({ message: "Successfully registered FCM Token!" });
});

app.post("/notifications", async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});

exports.app = functions.https.onRequest(app);
