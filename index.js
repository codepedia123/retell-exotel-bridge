import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const AGENT_ID = process.env.AGENT_ID;
const RETELL_KEY = process.env.RETELL_KEY;

const wss = new WebSocketServer({ server });

wss.on("connection", (exotelSocket) => {
  console.log("📞 Exotel WebSocket connected");

  const retellSocket = new WebSocket(`wss://ws.retellai.com/v1/agent-${AGENT_ID}`, {
    headers: {
      Authorization: `Bearer ${RETELL_KEY}`
    }
  });

  retellSocket.on("open", () => {
    console.log("🤖 Connected to Retell");
  });

  exotelSocket.on("message", (msg) => {
    if (retellSocket.readyState === WebSocket.OPEN) {
      retellSocket.send(msg);
    }
  });

  retellSocket.on("message", (msg) => {
    if (exotelSocket.readyState === WebSocket.OPEN) {
      exotelSocket.send(msg);
    }
  });

  exotelSocket.on("close", () => retellSocket.close());
  retellSocket.on("close", () => exotelSocket.close());
});

app.get("/start", (req, res) => {
  res.json({
    url: `wss://${req.headers.host}`,
    headers: {
      Authorization: `Bearer ${RETELL_KEY}`
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});
